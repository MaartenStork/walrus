"""Clean versions of two joint2 figures for the weekly deck: no 'middle' band, no chance line, x-label just 'layer'.
Reads poseidon's measures (read only). Same data and styling as poseidon's supervisor/figures.py and method/paths3_figure.py.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/figures.py
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
MEAS = os.path.expanduser("~/Documents/GitHub/poseidon/playground/families/measures")
TEAL, PURPLE, ORANGE, BAND, GREY, LINE = "#13A89E", "#9B7FC0", "#E05A2B", "#232959", "#5A6B7B", "#B8C2CC"
COL = {"elliptic": TEAL, "parabolic": ORANGE, "hyperbolic": PURPLE, "mixed": GREY}
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 18,
                     "axes.spines.top": False, "axes.spines.right": False, "savefig.dpi": 220})
L = np.arange(1, 33)

# neurons used per layer, one line per PDE, coloured by type
J = np.load(f"{MEAS}/joint2_epoch40.npz")
types = list(J["types"])
used = 100 * (1 - J["off_share_0.01"])
fig, ax = plt.subplots(figsize=(11, 5))
for k in range(8):
    ax.plot(L, used[:, k], color=COL[types[k]], lw=2.2, alpha=0.85)
for t in ["elliptic", "parabolic", "hyperbolic", "mixed"]:
    ax.plot([], [], color=COL[t], lw=3, label=t)
ax.legend(frameon=False, loc="lower left", fontsize=15, ncol=2)
ax.set_ylim(0, 105); ax.set_ylabel("neurons used (%)")
ax.set_xlim(0.5, 32.5); ax.set_xticks([1, 8, 16, 24, 32]); ax.set_xlabel("layer")
plt.tight_layout(); plt.savefig(os.path.join(HERE, "a_neurons.png"), bbox_inches="tight"); plt.close("all")

# paths, shared important neurons per layer, trained vs random
T = np.load(f"{MEAS}/joint2_epoch40_paths3.npz", allow_pickle=True)
R = np.load(f"{MEAS}/random_paths3.npz", allow_pickle=True)
off = ~np.eye(8, dtype=bool)
mean = lambda S: np.array([S[l][off].mean() for l in range(32)])
plt.rcParams.update({"font.size": 17})
fig, ax = plt.subplots(figsize=(9.5, 5.2))
ax.plot(L, mean(R["share_important"]), color=LINE, lw=3, label="before training")
ax.plot(L, mean(T["share_important"]), color=BAND, lw=3, label="trained")
ax.set_xlim(1, 32); ax.set_ylim(0, 1); ax.set_xticks([1, 4, 8, 12, 16, 20, 24, 28, 32])
ax.set_xlabel("layer"); ax.set_ylabel("shared important neurons")
ax.legend(frameon=False, loc="upper left")
plt.tight_layout(); plt.savefig(os.path.join(HERE, "paths3_layers.png"), bbox_inches="tight"); plt.close("all")

# strongest 10% of neurons, middle layers 13-20: two PDEs against two unrelated lists (no untrained bar, not needed here)
plt.rcParams.update({"font.size": 17})
tm = mean(T["share_active"])[12:20].mean()
fig, ax = plt.subplots(figsize=(9, 2.6))
labels = ["two unrelated lists", "two PDEs, our model"]; vals = [0.10, tm]; cols = ["#E05A2B", BAND]
ax.barh([1, 0], vals, color=cols, height=0.6)
for y, v in zip([1, 0], vals): ax.text(v + 0.015, y, f"{100 * v:.0f}%", va="center", fontsize=20, color=BAND)
ax.set_yticks([1, 0]); ax.set_yticklabels(labels, fontsize=18); ax.set_xlim(0, 0.5); ax.set_xticks([])
ax.spines["bottom"].set_visible(False); ax.tick_params(length=0)
plt.tight_layout(); plt.savefig(os.path.join(HERE, "n_top_bar.png"), bbox_inches="tight"); plt.close("all")
print("ok")
