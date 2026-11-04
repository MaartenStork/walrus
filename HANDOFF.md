# Handoff: looking inside physics foundation models

For a new chat (possibly in another repo). Read this first, then `walrus_plan.pdf`.
Everything below lives in the repo `~/Documents/GitHub/poseidon` (absolute: `/Users/maarten/Documents/GitHub/poseidon`).
Paths are relative to that repo unless they start with `/` or `~`. If you work in another repo, read these files from there,
or copy what you need.

---

## 0. Who and how to work with Maarten

- MSc student, research on the inside of PDE / physics foundation models (TU Delft, cluster DAIC).
- Wants to **understand** the methods himself: explain step by step, plain language, small examples, formulas with every symbol explained.
- **Writing style** (slides, docs, chat):
  - short, plain, casual; no AI-sounding wording ("genuine", "honest", "it's worth noting", "delve")
  - **no colons in slide text** (he finds them "very AI")
  - say **"activations"**, never "hidden numbers"
  - give a recommendation, not a survey of options
  - be honest about what results do and do not show; do not oversell ("three methods agree" when they don't is called out)
- **DAIC**: give him the commands, he runs them. Never run DAIC commands yourself.
  - First, alone: `ssh -t daic kinit` (he types the password; pasting more lines after it eats them as the password).
  - Then rsync from the Mac, from `~/Documents/GitHub/poseidon`. Quote globs in zsh: `rsync -av 'daic:...prune*.npz' ...`.
  - On DAIC the repo is `~/linuxhome/poseidon`. Jobs: `sbatch`, check with `squeue -u $USER`, logs `tail -f <name>_<jobid>.out`.
  - Job header used everywhere: `--account=daic-eemcs-insy-prb --partition=all --exclude=gpu46,gpu50,gpu51`.
- **LaTeX**: build with `latexmk -pdf -auxdir=<scratch dir> -outdir=.` so no .aux/.log land in the repo. Never delete PDFs.
- He builds slides as `.pptx` (pptxgenjs), not web artifacts.

---

## 1. The plan (where things are going)

**Main document: `playground/research_plan/walrus_plan.pdf`** (source `walrus_plan.tex`, 26 pages). Summary:

- **Big goal.** Supervisor's question: is there shared "magic" inside a physics foundation model, a physical pattern that helps for all
  equations? If yes (story 1), one big model is justified. If every PDE keeps to itself inside (story 2, several models in one box),
  the case for one big model is weak and separate smaller ones would make as much sense. We do NOT test which predicts better; we look inside.
- **Main model: Walrus** (released, 1.3B, Polymathic AI). Look at it, remove parts of it. No retraining.
- **Lab model**: a small model we can retrain (Poseidon-T design = joint2, maybe a mini-Walrus later). Only for things that need retraining:
  the squeeze (fewer neurons, same design; one system alone vs two together).
- **Part A: is it shared?** Neurons, directions, paths, removal/pruning on Walrus + the lab squeeze.
- **Part B: is it physics?** Only where Part A finds sharing. Readable (linear probes on hard quantities) -> coherent (do the read-out
  errors fit together through physical laws; shuffle score C) -> used (steering / removal along the readout direction).
- Later: elliptic PDEs into Walrus (look only, then fine-tune).

Older context documents (for background, not the current plan):
- `playground/research_plan/STATUS.md` short status.
- `playground/families/PLAN.md` the original "families" plan (steps 0-3: train, look inside, probe, coherence).
- `playground/research_plan/results_notes.md` notes of the first results deck.
- `playground/research_plan/research_plan.pdf` an older, different project (inverse problems / warm start). Good **style** example for a PDF plan.

---

## 2. What we found on joint2 (our own model)

Model **joint2**: Poseidon-T design (scOT, SwinV2 transformer in a U shape, 32 layers, ~21M params, skips across the U from layers
1-12 to 21-32), trained from scratch 40 epochs with Poseidon's recipe on 8 PDEgym datasets:
Poisson, Helmholtz (elliptic), Allen-Cahn (parabolic), wave Gauss, wave layer, Euler Gauss, Euler Riemann (hyperbolic), Navier-Stokes (mixed).
Test error one step ahead: AC 0.9, Poisson 1.3, wave L 2.6, Helmholtz 3.0, wave G 3.5, Euler G 5.6, Euler R 7.5, NS 11.8 (%).
Middle layers 13-20 have 1,536 MLP neurons each.

| Test | Result |
|---|---|
| Neurons on/off | every PDE uses almost all neurons; used by one type only <= 0.8%; dead neurons in layers 21-23 |
| Directions (overlap phi) | start/end ~0.6, middle 0.14-0.22. By pair kind, middle: same equation 0.49, same type other equation 0.12, different type 0.15 |
| Removal of directions (13-20) | own removal hurts most for Poisson (+102%), Helmholtz (+207%), Euler G (+279%), Euler R (+185%); AC, waves, NS only +8-14% (they go around the middle via skips). Random control 0-12% on own PDE (Euler up to 31%) |
| Paths (top-10% important neurons) | ~20% shared between PDEs (unrelated lists 10%, random-weight model 44%); only wave G-wave L 71% |
| Pruning (delete top 10% per PDE) | own deletion hurts most for Poisson, Helmholtz, Euler; AC + waves break together (they depend on a few very loud neurons in layer 13) |
| Pruning (least important first) | delete 90% of the middle: AC x1.10, waves x1.15, NS x1.21 fine; Poisson x3.0, Helmholtz x3.8, Euler G x4.8, Euler R x2.5 |
| Room | all 8 PDEs together need 316-761 of 1,536 directions per middle layer: lots of spare room |

**Conclusion:** same neurons, used mostly separately per equation in the middle; sharing follows the equation, not the PDE type.
Caveats: small model, 8 PDEs, room to spare, U-shape skips make the middle bypassable.

Lessons (keep these for Walrus):
1. Neuron counts alone say "shared"; use directions and paths.
2. Read removal matrices **per column** (whose error), not per row; Euler is fragile.
3. Always a control: random weights for measures, random directions/neurons for removal.
4. Removing directions (keeps the neuron's mean) differs from deleting neurons (sets to 0). Report both.
5. Do not change the architecture to test it (we tried removing Poseidon's skips for a bottleneck; dropped, and that run crashed anyway).

---

## 3. All code files (`playground/families/`)

Run everything from the repo root with `PYTHONPATH=.` and `.venv/bin/python`. The DAIC job blocks for every script are in
**`playground/families/RUN.md`** (sections 1-11, paste-ready).

| File | What it does | Output |
|---|---|---|
| `data.py` | The 8 datasets and how each goes into Poseidon's 4 slots (Poseidon's own scaling constants). `Source(name)`: `.item(split, i, t1, t2)`, `.eval_slots()`, `.kind`. `NAMES`, `model_config()` | - |
| `0_subset.py` | Download a subset of each dataset from Hugging Face (camlab-ethz), save float16 `.h5` | `data/<name>.h5` (DAIC) |
| `1_train.py` | Train one model on all datasets (Poseidon-T recipe), resumes by itself, multi-GPU via torchrun. Options `--width/--skips/--pdes` exist for the (dropped) bottleneck | `runs/<name>/ckpt_epochXX.pt`, `history.json` |
| `3_record.py` | Freeze a model, run test examples, record per-block activations (mean, mean abs, a few whole patches). Hooks `Swinv2Intermediate` (MLP after GELU) | `records/<name>.npz` |
| `4_measure.py` | The measures from a recording: neurons off, overlap of top neurons, similarity, type probe, **subspace overlap**, purity | `measures/<name>.npz` |
| `5_figures.py` | Figures from the measures | `figures/` |
| `6_fluids.py` | Same comparison on released Poseidon-T (Euler vs NS) | prints |
| `7_paths.py` | Old "paths into a shared neuron" (after PURE). **Superseded by 9_paths.py** (failed the random-weight control) | `measures/*_paths.npz` |
| `8_ablate.py` | **Removal of a PDE's directions** (PCA subspace) while the model runs, every PDE's error, random control, DDI. `--layers 13-20` (also 9-24, 5-28, 1-32 = the "ladder"), `--mode learned` (Saha et al. rotation) | `measures/*_ablate_pca[_layersX].npz` |
| `9_paths.py` | **Paths**: importance = \|sum_p a*dF/da\| per neuron per PDE, top-10% shares, also top-10% active; `--random` control | `measures/*_paths3.npz` |
| `10_prune.py` | **Pruning**: delete a PDE's top-10% neurons (`perpde`), and least-important-first 25-90% (`overall`), random controls; importance on training examples | `measures/*_prune[_layers9-24].npz` |
| `squeeze.py` | Bottleneck model without skips (dropped idea; base run crashed with CUDA illegal memory access, never debugged) | - |
| `make_results_notebook.py` | Builds `families_results.ipynb` with the raw numbers | notebook |
| `RUN.md` | **All DAIC commands**, paste-ready | - |
| `PLAN.md` | Original plan for this line of work | - |

Results already on the Mac: `playground/families/measures/` (all `.npz` above), `playground/families/records/`,
`playground/research_plan/slides/results/subspace_uncapped_joint2_epoch40.npy` (32 x 8 x 8 overlap matrix, no cap on k).
Model checkpoints and data are only on DAIC (`~/linuxhome/poseidon/playground/families/runs/joint2/`, `.../data/`).

---

## 4. The methods, precisely (to re-implement for Walrus)

**Where to hook.** One "neuron" = one output of the MLP's hidden layer, per patch.
- Poseidon/scOT: forward hook on every `Swinv2Intermediate` module (output after GELU). Shape `[batch, patches, neurons]`.
- Walrus (from its paper, Table 3): 40 processor blocks, hidden dim 1408, **MLP dim 5632, SwiGLU**, space block = parallel attention+MLP
  (`v = u + MLP(norm u) + Attn(norm u)`), then causal time attention. 2D: 6 past frames, base token grid 32x32. Hook the MLP's hidden
  activation (after the SwiGLU gate product, before the output projection). Record the newest frame only.
  Walrus predicts the change (delta), normalisation happens outside the model; each system has its own first projection (so early blocks
  separate systems by input format alone: judge sharing deeper in, and against random weights).
  Code: github.com/PolymathicAI/walrus, weights: huggingface.co/polymathic-ai/walrus. Paper arXiv 2511.15684 (Tables 3, 6).

**1. Neurons used.** Per PDE and layer: neuron used if mean |a| over all its patches > 1% of the layer's average. Count used by one PDE / one type / all.

**2. Directions + overlap** (Chang, Tu & Bergen 2022; Hu et al. 2021 LoRA Eq. 4). Per PDE d and layer: patches' activation vectors,
subtract d's own mean, SVD, keep top k_d components covering 90% of variance -> U_d (columns unit length).
`phi(d,e) = ||U_d^T U_e||_F^2 / min(k_d, k_e)`, 0..1. Report per layer (mean over pairs) and by pair kind (same equation / same type / different type).
Code: `4_measure.py::subspace_overlap` (capped k<=32) and `research_plan/slides/results/figures.py::subspace_uncapped`.

**3. Removal** (Saha, Bergen & Khosla 2026). Fit U_d on TRAINING examples, measure on TEST examples. While the model runs, in the chosen layers:
`a' = a - U_d U_d^T (a - mu_own)` with mu_own the mean of the patch's own PDE (removes only variation). Error = median relative L1 error
on the PDE's own fields. Report rise in % of normal error, matrix [removed x measured], read per column. Control: random orthonormal
U of the same size. Code: `8_ablate.py`.

**4. Paths / importance** (conductance, Dhamdhere, Sundararajan & Yan 2019). `F = sum(pred * pred.detach())` over the PDE's own output slots;
backward; per neuron `I = | sum over patches of a * dF/da |`, summed over examples. Top 10% = path. `share(d,e) = |top_d & top_e| / |top_d|`.
Chance (two unrelated lists) = 10%; fully separate = 0%. Control: random-weight model. Code: `9_paths.py`.

**5. Pruning.** Mask neurons to 0 in the chosen layers (= removing their in/out weights). Per PDE: delete its top 10% by importance (computed on
training examples), measure all PDEs; control random neurons of same number. Overall: delete least important first (importance per PDE
normalised to sum 1, summed over PDEs) at 25/50/75/90%. Report error / normal error. Code: `10_prune.py`.

**6. Squeeze (lab).** Planned, not built: same design, fewer MLP neurons (Poseidon-T `mlp_ratio` 4 -> 1 -> 0.25 -> 0.0625), train system A alone,
B alone, A+B together; smallest size that still works; together ~ sum = separate, ~ bigger one = shared. Then directions on each squeezed model.

**7. Part B (planned).** Linear probes (ridge) from one block's activations to hard quantities (need multiplying fields: kinetic energy,
w*b heat transport, reaction rate). Split train/test by simulation run. Controls: probe on raw input, random weights, every block.
Coherence score `C = law error with shuffled readout errors / law error with real readouts` (fixed before measuring).
Laws: Euler energy `E = p/(gamma-1) + 1/2 rho|u|^2`; Rayleigh-Benard slab heat budget (slopes moved onto a smooth bump by integration by parts).
Used: steer along the readout direction (Physics Steering style) and check the prediction follows physics.
Background deck for this: `research_plan/box_probe.pptx` (source `slides/box/build.js`).

---

## 5. How to make slides (pptx) in Maarten's style

**Look at these first:**
- `playground/research_plan/inside_update.pptx`: the full supervisor deck, best example of the style. Source:
  `playground/research_plan/slides/update/build.js` (+ `figures.py`, `formulas.py`).
- `playground/research_plan/squeeze_plan.pptx`: short and clean, good starting template. Source: `playground/research_plan/slides/squeeze/build.js`
  (+ `figures.py`, `prune_figures.py`).
- `playground/research_plan/big_plan.pptx`: the original style reference.

**Build:**
```bash
.venv/bin/python playground/research_plan/slides/<deck>/figures.py        # figures as PNG next to build.js
cd playground/research_plan/slides/<deck> && NODE_PATH=/Users/maarten/node_modules node build.js   # writes ../../<deck>.pptx
```

**Style (copy the helpers at the top of `slides/squeeze/build.js`):**
- `LAYOUT_WIDE` (13.33 x 7.5 in), white background, font Times New Roman.
- Colours: navy band `232959`, ink `000000`, grey `5A6B7B`, teal `13A89E`, orange `E05A2B`, purple `9B7FC0`, card `F1F5F8`.
  Types: elliptic teal, parabolic orange, hyperbolic purple, mixed grey.
- Every slide: a rounded navy band at the top with a white circle holding the section number, white bold title (`band`, `base`).
  One short lead line under it (`lead`), a picture or a few cards in the middle, one bold take-away line at the bottom (`take`).
  Details go in the speaker notes (`s.addNotes`), not on the slide.
- Section **dividers**: white slide, the navy band centred vertically with number and section title, grey subtitle (`divider`).
- Sometimes just a few centred lines of text instead of boxes (`plain`). Cards: `cards2`/`cards3`. Tables: `table`.
- Little text. No colons. Real numbers on real-result figures; label cartoons "made-up numbers".
- Pictures via `pic(s, file, x, y, w, h)` (keeps aspect ratio).

**Figures (matplotlib, see any `figures.py`):**
```python
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 17,
                     "savefig.dpi": 200, "axes.spines.top": False, "axes.spines.right": False, "mathtext.fontset": "cm"})
```
Same colours as above. Clean: few lines, big labels, no clutter. Matrices: `slides/method/ladder_figures.py` (per-column colouring,
bold column max, orange boxes on the diagonal). Formulas as images: `slides/method/formulas.py` (mathtext; use `\left| \right|`, not `\Big`).

**Check the result visually** (LibreOffice is not available; use Keynote):
```bash
osascript -e 'tell application "Keynote"
set d to open POSIX file "/abs/path/deck.pptx"
delay 3
export d to POSIX file "/abs/scratch/deck.pdf" as PDF
close d saving no
end tell'
uv run --no-project --with pypdfium2 python -c "import pypdfium2 as p; d=p.PdfDocument('deck.pdf'); [d[i].render(scale=0.8).to_pil().save(f's{i+1}.png') for i in range(len(d))]"
```
Then look at the PNGs (overlaps, overflow, labels colliding).

## 6. How to make a PDF plan/report

Template: **`playground/research_plan/walrus_plan.tex`** (and the older `research_plan.tex`). 11pt A4, wide margins, line stretch 1.3,
newpx fonts, teal/ink colours, `keybox`/`notebox` (tcolorbox) for key points, `\question{}` for the main question, TikZ for diagrams,
figures from `slides/*/` via `\graphicspath`. Build:
```bash
cd playground/research_plan
latexmk -pdf -interaction=nonstopmode -auxdir=<scratch dir> -outdir=. walrus_plan.tex
```
Style: big goal first, then build up step by step; every step says how, what we expect, and what each outcome would mean.

---

## 7. Other decks (explanations Maarten already has)

In `playground/research_plan/` (sources in `slides/<name>/`):
- `subspace_method.pptx` (method/): the direction + removal + paths method for supervisors, short.
- `pca_explained.pptx` (pca/), `ruler_explained.pptx` (ruler/), `removal_explained.pptx` + `removal_poster.pdf` (removal/): PCA, projection
  ("length 1", the ruler), removal, step by step with 2-4 neurons.
- `pde_types.pptx` (pde_types/): the three PDE types, the determinant rule.
- `physics_steering.pptx` (steering/): the Walrus Physics Steering paper explained.
- `box_probe.pptx` (box/): probes and the coherence idea (Part B background).
- `shared_or_separate.pptx`, `results.pptx`, `big_plan.pptx`: earlier versions of the story.
- `transformer_explained.pptx`, `layers_explained.pptx`, `gelu_explained.pptx`, `embedding_explained.pptx`: model basics.

---

## 8. Open, next

1. Read the two Walrus interpretability papers in full: Physics Steering (Fear et al., NeurIPS 2025, arXiv 2511.20798) and
   Sparse probes and murky physics (Rosenfeld & Sonnewald 2026, arXiv 2606.11657). Proper literature check (coherence claim is from a quick search).
2. Get Walrus running on DAIC, reproduce its one-step errors on the 8 systems of `walrus_plan.pdf` Table 2 (acoustic inclusions + discontinuous,
   Euler multi-quadrants periodic + open, Gray-Scott, shear flow, Rayleigh-Benard, Helmholtz staircase). Random-weight copy.
3. Port `3_record.py`, `4_measure.py` (subspace overlap), `8_ablate.py`, `9_paths.py`, `10_prune.py` to Walrus.
4. Lab squeeze on the Poseidon-T design (fewer MLP neurons), in parallel.
5. Decision point with supervisor, then Part B.
