"""joint2 direction overlap per layer, mean over the 28 pairs, without the 'middle' band (weekly deck).
Same data and look as poseidon/playground/research_plan/slides/method/figures.py (c1_overlap.png), read only.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/overlap.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
SUB = np.load(os.path.expanduser("~/Documents/GitHub/poseidon/playground/research_plan/slides/results/subspace_uncapped_joint2_epoch40.npy"))
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 17, "savefig.dpi": 200,
                     "axes.spines.top": False, "axes.spines.right": False})
ov = np.array([m[~np.eye(8, dtype=bool)].mean() for m in SUB])
fig, ax = plt.subplots(figsize=(6.2, 4.6))
ax.plot(range(1, 33), ov, color="#232959", lw=2.5, marker="o", ms=5)
ax.set_ylim(0, 1); ax.set_xlim(0.5, 32.5); ax.set_xticks([1, 8, 16, 24, 32])
ax.set_xlabel("layer"); ax.set_ylabel("overlap φ")
plt.tight_layout(); plt.savefig(os.path.join(HERE, "c1_overlap.png"), bbox_inches="tight"); plt.close("all")
print("ok")
