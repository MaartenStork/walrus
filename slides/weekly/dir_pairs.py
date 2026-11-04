"""joint2 direction overlap per pair of PDEs, middle layers 13-20, in the same format as the neuron heatmap.
Reads poseidon/playground/research_plan/slides/results/subspace_uncapped_joint2_epoch40.npy (read only, 32 x 8 x 8).
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/dir_pairs.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
SUB = np.load(os.path.expanduser("~/Documents/GitHub/poseidon/playground/research_plan/slides/results/subspace_uncapped_joint2_epoch40.npy"))
NAVY, GREY, TEAL, ORANGE, PURPLE = "#232959", "#5A6B7B", "#13A89E", "#E05A2B", "#9B7FC0"
types = ["elliptic", "elliptic", "parabolic", "hyperbolic", "hyperbolic", "hyperbolic", "hyperbolic", "mixed"]
COL = {"elliptic": TEAL, "parabolic": ORANGE, "hyperbolic": PURPLE, "mixed": GREY}
NICE = ["Poisson", "Helmholtz", "Allen–Cahn", "wave G", "wave L", "Euler G", "Euler R", "NS"]
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 18, "savefig.dpi": 220})
M = SUB[12:20].mean(0)
off = ~np.eye(8, dtype=bool)
fig, ax = plt.subplots(figsize=(7.6, 6.8))
ax.imshow(np.where(off, M, np.nan), cmap="Blues", vmin=0.0, vmax=0.8)
for i in range(8):
    for j in range(8):
        if i != j:
            ax.text(j, i, f"{M[i, j]:.2f}", ha="center", va="center", fontsize=15, color="white" if M[i, j] > 0.5 else NAVY)
ax.set_xticks(range(8)); ax.set_yticks(range(8))
ax.set_xticklabels(NICE, rotation=40, ha="right"); ax.set_yticklabels(NICE)
for lab, k in zip(ax.get_xticklabels(), range(8)): lab.set_color(COL[types[k]])
for lab, k in zip(ax.get_yticklabels(), range(8)): lab.set_color(COL[types[k]])
for s in ax.spines.values(): s.set_visible(False)
ax.tick_params(length=0)
plt.tight_layout(); plt.savefig(os.path.join(HERE, "dir_pairs.png"), bbox_inches="tight"); plt.close("all")
print(np.round(M, 2))
