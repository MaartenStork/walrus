"""Poseidon-T design (joint2) as a classic U-Net picture, same style as the Walrus encoder-processor-decoder figure.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/arch.py
Sizes from poseidon/playground/families/data.py::model_config: 128x128 in, patch 4 -> 32x32, embed 48,
depths [4,4,4,4], skips on stages 1-3, mirrored decoder, 32 layers in all."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GREY, TEAL = "#232959", "#5A6B7B", "#13A89E"
LT, LN, LG = "#DDF2F0", "#E3E5F0", "#F1F5F8"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "savefig.dpi": 200})

fig, ax = plt.subplots(figsize=(15, 6.6))
ax.set_xlim(-0.2, 15.6); ax.set_ylim(-1.4, 6.9); ax.axis("off")


def label(x, y, text, color=GREY, size=17, bold=False, ha="center"):
    ax.text(x, y, text, ha=ha, va="center", fontsize=size, color=color, fontweight="bold" if bold else "normal")


def arr(x0, y0, x1, y1, color=GREY, lw=2, ls="-"):
    ax.annotate("", xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, ls=ls, mutation_scale=20, shrinkA=0, shrinkB=0))


# stages: (grid, numbers per patch, box height, box width, centre y)
st = [(32, 48, 3.2, 0.35, 5.0), (16, 96, 1.6, 0.55, 2.4), (8, 192, 0.8, 0.8, 1.0), (4, 384, 0.4, 1.1, 0.0)]
xe = [2.0, 3.0, 4.35, 5.95]                  # encoder x
xd = [12.95, 11.75, 10.2, 8.35]              # decoder x (same stage order)


def seg(x0, y0, x1, y1, color=NAVY, lw=2):
    ax.plot([x0, x1], [y0, y1], color=color, lw=lw, solid_capstyle="butt")


# input and output
ax.add_patch(Rectangle((0.0, 3.4), 1.2, 3.2, fc=LG, ec=GREY, lw=1.5))
label(0.6, 2.6, "1 snapshot\n+ time t", size=23)
ax.add_patch(Rectangle((14.05, 3.4), 1.2, 3.2, fc=LG, ec=GREY, lw=1.5))
label(14.65, 2.6, "solution\nat time t", size=23)
arr(1.3, 5.0, 1.9, 5.0)
arr(xd[0] + st[0][3] + 0.1, 5.0, 13.95, 5.0)

for k, (g, c, h, w, yc) in enumerate(st):
    middle = k == 3
    fc, ec = (LT, TEAL) if middle else (LN, NAVY)
    for x in (xe[k], xd[k]):
        ax.add_patch(Rectangle((x, yc - h / 2), w, h, fc=fc, ec=ec, lw=2))
    if not middle:
        yn = st[k + 1][4]
        # down: straight down from this box, then right into the next
        xm = xe[k] + w / 2
        seg(xm, yc - h / 2, xm, yn); arr(xm, yn, xe[k + 1] - 0.05, yn, NAVY)
        # up: out of the deeper box to the right, then straight up into this one
        xm = xd[k] + w / 2
        seg(xd[k + 1] + st[k + 1][3], yn, xm, yn); arr(xm, yn, xm, yc - h / 2 - 0.03, NAVY)
        # skip straight across
        arr(xe[k] + w + 0.08, yc, xd[k] - 0.08, yc, GREY, 1.8, "--")
        label(xe[k] + w + 0.15, yc - 0.38, f"{g} × {g}, {c} each", NAVY, 22, ha="left")

arr(xe[3] + st[3][3] + 0.08, 0.0, xd[3] - 0.08, 0.0, TEAL)
label((xe[3] + xd[3] + st[3][3]) / 2, -0.55, "middle, 4 × 4, 384 each", TEAL, 24, True)
label(7.6, 5.5, "skips, straight across", GREY, 24)
label(1.0, 1.0, "encoder\ngoing down", NAVY, 24, True)
label(14.3, 1.0, "decoder\ngoing up", NAVY, 24, True)
plt.savefig(os.path.join(HERE, "poseidon_u.png"), bbox_inches="tight")
plt.close("all")


# Walrus picture again, with bigger text for a half-width slot (same drawing as slides/inside/figures.py::edp_figure)
from matplotlib.patches import Polygon
fig, ax = plt.subplots(figsize=(15, 5.6))
ax.set_xlim(0, 17.2); ax.set_ylim(-0.3, 6); ax.axis("off")


def stack(x, y, w, h, n, d, fc, ec):
    for i in range(n):
        ax.add_patch(Rectangle((x + i * d, y - i * d), w, h, fc=fc, ec=ec, lw=1.5))


def arr2(x0, x1, y=3.0):
    ax.annotate("", xy=(x1, y), xytext=(x0, y), arrowprops=dict(arrowstyle="-|>", color=GREY, lw=2, mutation_scale=22))


stack(0.2, 1.65, 1.2, 2.8, 6, 0.1, LG, GREY); label(1.05, 0.45, "6 snapshots", size=23)
arr2(2.05, 2.45)
ax.add_patch(Polygon([(2.5, 0.95), (4.3, 2.15), (4.3, 3.85), (2.5, 5.05)], closed=True, fc=LN, ec=NAVY, lw=2))
label(3.4, 3.0, "encoder", NAVY, 24, True)
arr2(4.35, 4.75)
stack(4.8, 2.4, 1.0, 1.0, 6, 0.07, LT, TEAL); label(5.4, 0.9, "32 × 32\n1,408 each", TEAL, 22)
arr2(6.3, 6.7)
ax.add_patch(Rectangle((6.75, 2.1), 3.7, 1.8, fc=LT, ec=TEAL, lw=2))
for i in range(1, 40):
    ax.plot([6.75 + i * 3.7 / 40] * 2, [2.1, 3.9], color=TEAL, lw=0.6)
label(8.6, 4.5, "40 blocks", TEAL, 26, True)
arr2(10.5, 10.9)
stack(10.95, 2.4, 1.0, 1.0, 6, 0.07, LT, TEAL)
arr2(12.4, 12.8)
ax.add_patch(Polygon([(12.85, 2.15), (14.65, 0.95), (14.65, 5.05), (12.85, 3.85)], closed=True, fc=LN, ec=NAVY, lw=2))
label(13.75, 3.0, "decoder", NAVY, 24, True)
arr2(14.7, 15.1)
ax.add_patch(Rectangle((15.15, 1.6), 1.25, 2.8, fc=LG, ec=GREY, lw=1.5)); label(15.78, 0.9, "change", size=23)
plt.savefig(os.path.join(HERE, "edp_big.png"), bbox_inches="tight")
plt.close("all")
print("ok")
