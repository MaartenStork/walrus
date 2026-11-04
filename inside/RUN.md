# Running Walrus on DAIC

Every block is meant to be pasted as is. Mac = your laptop terminal, DAIC = after `ssh daic`.
On DAIC the repo lives in `~/linuxhome/walrus`. Big files (weights, data, uv cache) go in `$DATA`,
reached through the links `checkpoints` and `well` inside the repo.

## 1. Copy the code (Mac)

```bash
ssh -t daic kinit
```

then

```bash
rsync -av --exclude .git --exclude '*.pdf' --exclude '*.tex' --exclude HANDOFF.md ~/Documents/GitHub/walrus/ daic:linuxhome/walrus/
```

## 2. Find room (DAIC)

Weights 5 GB, environment about 7 GB, data about 75 GB (one test file per system; the two Euler files are 26 GB each).

```bash
df -h ~/linuxhome
ls /tudelft.net/staff-umbrella/ 2>/dev/null
du -sh ~/linuxhome/* 2>/dev/null | sort -h | tail -n 10
```

Paste the output to Claude. Then set the place, once (replace the path):

```bash
echo 'export DATA=/path/with/100GB/free/walrus_data' >> ~/.bashrc
source ~/.bashrc
mkdir -p $DATA/checkpoints $DATA/well $DATA/uv_cache
cd ~/linuxhome/walrus && ln -sfn $DATA/checkpoints checkpoints && ln -sfn $DATA/well well
```

## 3. Environment (DAIC login node)

Walrus pins torch 2.5.1, which does not run on the RTX PRO 6000 (Blackwell). We use torch 2.7.1 with CUDA 12.8, which runs on all DAIC GPUs.

```bash
cd ~/linuxhome/walrus
command -v uv || { curl -LsSf https://astral.sh/uv/install.sh | sh; source ~/.local/bin/env; }
export UV_CACHE_DIR=$DATA/uv_cache
uv venv -p 3.11 .venv
uv pip install -p .venv torch==2.7.1 torchvision==0.22.1 torchaudio==2.7.1 --index-url https://download.pytorch.org/whl/cu128
printf 'torch==2.7.1\ntorchvision==0.22.1\ntorchaudio==2.7.1\n' > overrides.txt
uv pip install -p .venv --override overrides.txt -e .
.venv/bin/python -c "import torch, walrus, the_well; print('ok', torch.__version__, torch.version.cuda)"
```

The last line should print `ok 2.7.1+cu128 12.8`.

## 4. Weights and data (DAIC login node, in the background)

```bash
cd ~/linuxhome/walrus
curl -L -o checkpoints/extended_config.yaml https://huggingface.co/polymathic-ai/walrus/resolve/main/extended_config.yaml
nohup bash -c '
curl -L -o checkpoints/walrus.pt https://huggingface.co/polymathic-ai/walrus/resolve/main/walrus.pt
for n in helmholtz_staircase rayleigh_benard shear_flow gray_scott_reaction_diffusion acoustic_scattering_discontinuous acoustic_scattering_inclusions euler_multi_quadrants_openBC euler_multi_quadrants_periodicBC; do
  echo "=== $n"; .venv/bin/the-well-download --base-path well --dataset $n --split test --first-only
done; echo ALL DONE' > download.log 2>&1 &
```

A few hours. Follow with `tail -f download.log` (Ctrl+C stops watching, not the download). When it says ALL DONE:

```bash
ls -lh checkpoints/ && du -sh well/datasets/*
```

`walrus.pt` should be 5.1 GB. Data comes from The Well's own server, not Hugging Face, so shear_flow is v2.0
(v1.0 had 80% of its test runs copied from training).

## 5. Check: load Walrus, one-step errors, random-weight copy (DAIC)

```bash
cd ~/linuxhome/walrus
cat > check.sh <<'EOF'
#!/bin/bash
#SBATCH --account=daic-eemcs-insy-prb
#SBATCH --partition=all
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=64G
#SBATCH --time=01:00:00
#SBATCH --exclude=gpu46,gpu50,gpu51
#SBATCH --job-name=walrus_check
#SBATCH --output=walrus_check_%j.out
cd ~/linuxhome/walrus
export HDF5_USE_FILE_LOCKING=FALSE
.venv/bin/python inside/0_check.py --well well --n 20
.venv/bin/python inside/0_check.py --well well --n 5 --random
EOF
sbatch check.sh
```

Then `squeue -u $USER` and `tail -f walrus_check_*.out`. Paste the whole output to Claude.
What to look for: parameters 1.3 B, 40 blocks, neuron shapes ending in 2816, and our median one-step VRMSE
close to the paper column (same order of magnitude; shear flow may be a bit higher, since the paper used v1.0).
The random-weight run should be much worse.
