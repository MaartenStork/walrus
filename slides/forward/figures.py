"""Figures for forward_pass_explained.pptx. Cartoons, made-up numbers, sizes from Walrus (shear flow).
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/forward/figures.py
nn_classic.png is a copy from ../inside."""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon, FancyArrowPatch

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GREY, TEAL, ORANGE, PURPLE, LIGHT = "#232959", "#5A6B7B", "#13A89E", "#E05A2B", "#9B7FC0", "#C9D2DA"
LN, LG = "#E3E5F0", "#F1F5F8"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 20, "mathtext.fontset": "cm",
                     "savefig.dpi": 200})
save = lambda name: (plt.savefig(os.path.join(HERE, name), bbox_inches="tight"), plt.close("all"))
rng = np.random.default_rng(3)


def arrow(ax, x0, y0, x1, y1, c=GREY, lw=2, rad=0.0):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle="-|>", mutation_scale=20, color=c, lw=lw,
                                 connectionstyle=f"arc3,rad={rad}"))


def notebook(ax, x, y, colors, w=0.55, h=0.26, label=None):
    for i, c in enumerate(colors):
        ax.add_patch(Rectangle((x, y + i * h), w, h, fc=c, ec="white", lw=1))
    ax.add_patch(Rectangle((x, y), w, h * len(colors), fc="none", ec=NAVY, lw=1.8))
    if label:
        ax.text(x + w / 2, y - 0.35, label, ha="center", va="top", fontsize=18, color=GREY)


# ---------------------------------------------------------------- encoder writes the notebook
fig, ax = plt.subplots(figsize=(13, 4.6)); ax.set_aspect("equal"); ax.axis("off")
names = ["tracer", "pressure", "velocity x", "velocity y"]
for k, n in enumerate(names):
    img = rng.normal(size=(16, 8)).cumsum(0).cumsum(1); img = (img - img.min()) / (img.max() - img.min())
    ax.imshow(img, cmap="magma", extent=(k * 1.45, k * 1.45 + 1.0, 0.6, 2.6))
    ax.text(k * 1.45 + 0.5, 0.35, n, ha="center", va="top", fontsize=17, color=GREY)
ax.text(2.6, 3.0, "one patch, 4 fields of 8 × 16 pixels", ha="center", fontsize=20, color=NAVY)
arrow(ax, 5.95, 1.6, 6.55, 1.6)
ax.add_patch(Polygon([(6.65, 0.4), (8.0, 1.0), (8.0, 2.2), (6.65, 2.8)], closed=True, fc=LN, ec=NAVY, lw=2))
ax.text(7.33, 1.6, "encoder", ha="center", va="center", fontsize=19, color=NAVY, fontweight="bold")
arrow(ax, 8.1, 1.6, 8.7, 1.6)
notebook(ax, 8.85, 0.0, [ORANGE] * 12, w=0.6, h=0.27)
ax.text(9.65, 1.6, "1,408 numbers\nthe patch's notebook", ha="left", va="center", fontsize=20, color=NAVY)
ax.set_xlim(-0.2, 13.2); ax.set_ylim(-0.4, 3.5)
save("encode.png")


# ---------------------------------------------------------------- where the additions come from
fig, ax = plt.subplots(figsize=(13, 5.4)); ax.set_aspect("equal"); ax.axis("off")
n, c = 5, 0.62
me = (2, 2)
for s, x0 in enumerate([0.0, 3.8, 7.6]):
    for i in range(n):
        for j in range(n):
            hit = (i, j) == me
            ax.add_patch(Rectangle((x0 + i * c, j * c), c, c, fc=ORANGE if hit else LG, ec=LIGHT, lw=1))
    ax.text(x0 + n * c / 2, n * c + 0.25, ["2 snapshots ago", "1 snapshot ago", "now"][s], ha="center", fontsize=19, color=GREY)
cx = lambda x0: (x0 + me[0] * c + c / 2, me[1] * c + c / 2)
now = cx(7.6)
for x0 in (0.0, 3.8):   # time, same patch earlier
    p = cx(x0); arrow(ax, p[0] + 0.2, p[1] + 0.25, now[0] - 0.15, now[1] + 0.3, PURPLE, 2.2, rad=-0.25)
for (i, j) in [(0, 4), (4, 0), (4, 4), (0, 1), (1, 3)]:   # space, other patches now
    p = (7.6 + i * c + c / 2, j * c + c / 2); arrow(ax, p[0], p[1], now[0] + (0.12 if i > 2 else -0.12), now[1] + (0.12 if j > 2 else -0.12), TEAL, 1.8)
ax.text(3.85, -0.55, "time step, the same patch earlier", ha="center", fontsize=19, color=PURPLE)
ax.text(10.75, 1.55, "space step\nthe other patches now", ha="left", va="center", fontsize=19, color=TEAL)
ax.text(10.75, 0.25, "MLP\nthe patch on its own", ha="left", va="center", fontsize=19, color=ORANGE)
ax.set_xlim(-0.2, 13.4); ax.set_ylim(-0.9, 3.8)
save("sources.png")


# ---------------------------------------------------------------- the notebook getting richer
fig, ax = plt.subplots(figsize=(12, 5.0)); ax.set_aspect("equal"); ax.axis("off")
cols = {"own": ORANGE, "past": PURPLE, "nbr": TEAL, "calc": NAVY}
stages = [("after the encoder", {"own": 12}), ("after block 1", {"own": 8, "past": 1, "nbr": 2, "calc": 1}),
          ("after block 20", {"own": 4, "past": 2, "nbr": 3, "calc": 3}), ("after block 40", {"own": 3, "past": 2, "nbr": 3, "calc": 4})]
for k, (lab, mix) in enumerate(stages):
    cs = [cols[key] for key, m in mix.items() for _ in range(m)]
    order = rng.permutation(len(cs)) if k else range(len(cs)); cs = [cs[i] for i in order]
    notebook(ax, 0.6 + k * 2.6, 0.6, cs, w=0.7, h=0.27, label=lab)
    if k < 3:
        arrow(ax, 1.45 + k * 2.6, 2.2, 3.05 + k * 2.6, 2.2)
for i, (key, lab) in enumerate([("own", "its own picture"), ("past", "its past"), ("nbr", "the neighbours"), ("calc", "its own calculations")]):
    ax.add_patch(Rectangle((10.6, 3.4 - i * 0.7), 0.4, 0.4, fc=cols[key], ec="none"))
    ax.text(11.15, 3.6 - i * 0.7, lab, va="center", fontsize=19, color=GREY)
ax.set_xlim(0, 14.4); ax.set_ylim(-0.6, 4.3)
save("grow.png")


# ---------------------------------------------------------------- decoder reads the notebook
fig, ax = plt.subplots(figsize=(13, 4.4)); ax.set_aspect("equal"); ax.axis("off")
mixed = [cols[k] for k in ["own", "calc", "nbr", "past", "calc", "own", "nbr", "calc", "past", "own", "calc", "nbr"]]
notebook(ax, 0.2, 0.0, mixed, w=0.6, h=0.27, label="final notebook")
arrow(ax, 0.95, 1.6, 1.55, 1.6)
ax.add_patch(Polygon([(1.65, 1.0), (3.0, 0.4), (3.0, 2.8), (1.65, 2.2)], closed=True, fc=LN, ec=NAVY, lw=2))
ax.text(2.33, 1.6, "decoder", ha="center", va="center", fontsize=19, color=NAVY, fontweight="bold")
arrow(ax, 3.1, 1.6, 3.7, 1.6)
for k in range(4):
    img = rng.normal(size=(16, 8)).cumsum(0).cumsum(1) * 0.3; img = np.clip(0.5 + img / (abs(img).max() * 2), 0, 1)
    ax.imshow(img, cmap="RdBu_r", vmin=0, vmax=1, extent=(3.85 + k * 1.15, 3.85 + k * 1.15 + 0.85, 0.6, 2.6))
ax.text(5.9, 0.3, "the change, 4 fields, 8 × 16 pixels", ha="center", va="top", fontsize=18, color=GREY)
ax.text(8.75, 1.6, "+ last snapshot\n= prediction", ha="left", va="center", fontsize=21, color=NAVY, fontweight="bold")
ax.set_xlim(0, 11.6); ax.set_ylim(-0.6, 3.5)
save("decode.png")


fig = plt.figure(figsize=(12, 1.4))
fig.text(0.5, 0.5, r"$\mathrm{notebook} \;=\; \mathrm{notebook} \;+\; \mathrm{time} \;+\; \mathrm{attention} \;+\; \mathrm{MLP}$",
         ha="center", va="center", fontsize=32, color=NAVY)
plt.savefig(os.path.join(HERE, "f_add.png"), dpi=220, bbox_inches="tight", pad_inches=0.04, transparent=True); plt.close("all")
print("ok")
