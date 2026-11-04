"""joint2 neurons-used graph with callouts, for the weekly deck. Same data as figures.py (read only from poseidon).
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/neurons_annot.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
MEAS = os.path.expanduser("~/Documents/GitHub/poseidon/playground/families/measures")
TEAL, PURPLE, ORANGE, BAND, GREY = "#13A89E", "#9B7FC0", "#E05A2B", "#232959", "#5A6B7B"
COL = {"elliptic": TEAL, "parabolic": ORANGE, "hyperbolic": PURPLE, "mixed": GREY}
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 18,
                     "axes.spines.top": False, "axes.spines.right": False, "savefig.dpi": 220})
J = np.load(f"{MEAS}/joint2_epoch40.npz")
types = list(J["types"]); used = 100 * (1 - J["off_share_0.01"]); L = np.arange(1, 33)
fig, ax = plt.subplots(figsize=(12, 5.4))
for k in range(8):
    ax.plot(L, used[:, k], color=COL[types[k]], lw=2.2, alpha=0.85)
ax.set_ylim(0, 112); ax.set_ylabel("neurons used (%)"); ax.set_xlim(0.5, 32.5); ax.set_xticks([1, 8, 16, 24, 32]); ax.set_xlabel("layer")
box = dict(boxstyle="round,pad=0.35", fc="white", ec=GREY, lw=1)
ax.annotate("most layers, all PDEs at 100%\nevery PDE touches almost every neuron", xy=(6, 100), xytext=(2.0, 55),
            fontsize=17, color=BAND, bbox=box, arrowprops=dict(arrowstyle="-", color=GREY))
ax.annotate("Euler leaves up to 28% silent", xy=(14, 73), xytext=(9.5, 25),
            fontsize=17, color=PURPLE, bbox=box, arrowprops=dict(arrowstyle="-", color=GREY))
ax.annotate("dead neurons, unused by every PDE", xy=(21.5, 62), xytext=(19.5, 25),
            fontsize=17, color=GREY, bbox=box, arrowprops=dict(arrowstyle="-", color=GREY))
plt.tight_layout(); plt.savefig(os.path.join(HERE, "a_neurons_annot.png"), bbox_inches="tight"); plt.close("all")
print("ok", used[12:15].min().round(1), used[20:23].mean().round(1))
