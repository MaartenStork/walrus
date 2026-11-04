"""The 8 joint2 PDEs as small picture pairs for the weekly deck. Real data: the viewer sample in poseidon (read only),
test example 0. Steady PDEs: input -> solution. Time PDEs: start -> later.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/pdes.py"""
import os
import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

POS = os.path.expanduser("~/Documents/GitHub/poseidon")
sys.path.insert(0, os.path.join(POS, "playground", "families"))
from data import NAMES, SLOTS, Source

HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLE = os.path.join(POS, "playground", "viewer", "sample")
GREY = "#5A6B7B"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 16})
FIELDS = {"allen_cahn": ["u"], "wave_gauss": ["wave", "wave speed"], "wave_layer": ["wave", "wave speed"],
          "euler_gauss": ["density", "velocity x", "velocity y", "pressure"], "euler_riemann": ["density", "velocity x", "velocity y", "pressure"],
          "ns_sines": ["density", "velocity x", "velocity y", "pressure"]}
STEADY = {"poisson": ("heaters", "temperature"), "helmholtz": ("material", "wave field")}

for name in NAMES:
    src = Source(name, SAMPLE)
    lead = 10 if src.kind == "time" else 10
    x, y, m, t = src.item("test", 0, 0, lead)
    if name in STEADY:
        a, b = x[SLOTS[name][0][0]].numpy(), y[SLOTS[name][1][0]].numpy(); labs = STEADY[name]
    else:
        j = max(SLOTS[name][1], key=lambda k: float(x[k].std()))      # the own field that varies most at the start
        a, b = x[j].numpy(), y[j].numpy(); labs = (f"{FIELDS[name][j]}, t = 0", "later")
    fig, axes = plt.subplots(1, 2, figsize=(5.0, 2.3))
    for ax, img, lab in zip(axes, [a, b], labs):
        ax.imshow(img, origin="lower", cmap="magma")
        ax.set_xticks([]); ax.set_yticks([])
        for sp in ax.spines.values(): sp.set_visible(False)
    fig.text(0.5, 0.5, "→", ha="center", va="center", fontsize=26, color=GREY)
    plt.tight_layout(w_pad=1.6)
    fig.savefig(os.path.join(HERE, f"pde_{name}.png"), dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("saved", name, src.kind, flush=True)
