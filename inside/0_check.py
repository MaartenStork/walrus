"""Step A0 check: load released Walrus, run one step on test data, print errors and neuron shapes.

Run from the repo root on a GPU node:
    .venv/bin/python inside/0_check.py --well <folder that holds datasets/> --n 20
"""

import argparse
import os

import numpy as np
import torch
from hydra.utils import instantiate
from omegaconf import OmegaConf

from walrus.data.multidataset import MixedWellDataset
from walrus.data.well_to_multi_transformer import ChannelsFirstWithTimeFormatter

SYSTEMS = [
    "acoustic_scattering_inclusions",
    "acoustic_scattering_discontinuous",
    "euler_multi_quadrants_periodicBC",
    "euler_multi_quadrants_openBC",
    "gray_scott_reaction_diffusion",
    "shear_flow",
    "rayleigh_benard",
    "helmholtz_staircase",
]
HOOK_BLOCKS = [0, 20, 39]
# Walrus paper (arXiv 2511.15684) Table 1, median one-step VRMSE
PAPER = {
    "acoustic_scattering_inclusions": 0.0089,
    "acoustic_scattering_discontinuous": 0.0021,
    "euler_multi_quadrants_periodicBC": 0.0194,
    "euler_multi_quadrants_openBC": 0.0112,
    "gray_scott_reaction_diffusion": 0.0001,
    "shear_flow": 0.0012,
    "rayleigh_benard": 0.0059,
    "helmholtz_staircase": 0.0005,
}


def to_device(batch, device):
    return {
        k: (v.to(device) if k not in {"metadata", "boundary_conditions"} else v)
        for k, v in batch.items()
    }


def vrmse(pred, ref, eps=1e-7):
    """The Well's VRMSE per field: sqrt(mean squared error / variance of the truth), over space."""
    b, t, c = pred.shape[0], pred.shape[1], pred.shape[-1]
    p = pred.reshape(b, t, -1, c).double()
    y = ref.reshape(b, t, -1, c).double()
    mse = ((p - y) ** 2).mean(dim=2)
    var = ((y - y.mean(dim=2, keepdim=True)) ** 2).mean(dim=2)
    return torch.sqrt(mse / (var + eps))  # b, t, c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--well", required=True, help="folder that holds datasets/<name>/data/test/*.hdf5")
    ap.add_argument("--ckpt", default="checkpoints/walrus.pt")
    ap.add_argument("--config", default="checkpoints/extended_config.yaml")
    ap.add_argument("--n", type=int, default=20, help="test windows per system")
    ap.add_argument("--systems", nargs="*", default=SYSTEMS)
    ap.add_argument("--random", action="store_true", help="random weights instead of trained")
    args = ap.parse_args()

    torch.manual_seed(0)
    np.random.seed(0)  # Walrus shifts periodic grids at random in every block
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("device", device, torch.cuda.get_device_name(0) if device.type == "cuda" else "")

    config = OmegaConf.load(args.config)
    fmap = OmegaConf.to_container(config.data.field_index_map_override)
    model = instantiate(config.model, n_states=max(fmap.values()) + 1)
    if not args.random:
        state = torch.load(args.ckpt, map_location="cpu", weights_only=True)["app"]["model"]
        model.load_state_dict(state)
    model.to(device).eval()
    print(f"parameters {sum(p.numel() for p in model.parameters()) / 1e9:.2f} B, blocks {len(model.blocks)}")

    # The neurons we will record later: SwiGLU output inside each block's space mixing
    shapes = {}
    for i in HOOK_BLOCKS:
        mod = model.blocks[i].space_mixing.activation
        mod.register_forward_hook(lambda m, inp, out, i=i: shapes.__setitem__(i, tuple(out.shape)))

    formatter = ChannelsFirstWithTimeFormatter()
    revin = instantiate(config.trainer.revin)()
    infos = OmegaConf.to_container(config.data.module_parameters.well_dataset_info)

    results = {}
    for name in args.systems:
        if not os.path.isdir(os.path.join(args.well, "datasets", name, "data", "test")):
            print(f"\n{name}: no test folder, skipped")
            continue
        ds = MixedWellDataset(
            well_base_path=os.path.join(args.well, "datasets"),
            well_dataset_info={name: infos[name]},
            well_split_name="test",
            n_steps_input=6,
            n_steps_output=1,
            field_index_map_override=fmap,
            prefetch_field_names=False,
        )
        idx = np.linspace(0, len(ds) - 1, args.n).round().astype(int)
        scores = []
        for k, j in enumerate(idx):
            batch = ds[[int(j)]]
            if batch["input_fields"].dim() == 5:  # no batch axis
                batch = {
                    k2: (v.unsqueeze(0) if torch.is_tensor(v) and k2 not in {"field_indices", "padded_field_mask"} else v)
                    for k2, v in batch.items()
                }
            meta = batch["metadata"]
            batch = to_device(batch, device)
            with torch.no_grad():
                inputs, y_ref = formatter.process_input(batch, causal_in_time=model.causal_in_time, predict_delta=True, train=False)
                inputs = list(inputs)
                stats = revin.compute_stats(inputs[0], meta, epsilon=1e-5)
                x = revin.normalize_stdmean(inputs[0], stats)
                y = model(x, inputs[1], inputs[2].tolist(), metadata=meta, train=False)
                if model.causal_in_time:
                    y = y[-1:]
                y = inputs[0][-1:].float() + revin.denormalize_delta(y, stats)
                y = formatter.process_output(y, meta)[..., : y_ref.shape[-1]]
            mask = batch["padded_field_mask"].bool()
            s = vrmse(y[..., mask], y_ref[:, :1][..., mask])
            scores.append(s.mean().item())
            if k == 0:
                print(f"\n{name}: {len(ds)} windows, input {tuple(batch['input_fields'].shape)}, fields {mask.sum().item()}")
                print("  neuron shapes (t*b, h, w, d, neurons):", {b: shapes.get(b) for b in HOOK_BLOCKS})
        results[name] = scores
        print(f"  one-step VRMSE over {len(scores)} windows: mean {np.mean(scores):.4f}, median {np.median(scores):.4f}")

    print("\nsummary: median one-step VRMSE, ours vs Walrus paper Table 1")
    for name, s in results.items():
        print(f"  {name:38s} {np.median(s):.4f}   paper {PAPER.get(name, float('nan')):.4f}")


if __name__ == "__main__":
    main()
