"""Figures and formulas for walrus_inside.pptx.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/inside/figures.py
"""
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GREY, TEAL, ORANGE = "#232959", "#5A6B7B", "#13A89E", "#E05A2B"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 17,
                     "savefig.dpi": 200, "axes.spines.top": False, "axes.spines.right": False, "mathtext.fontset": "cm"})


def eq(name, tex, size=30):
    fig = plt.figure(figsize=(12, 1.4))
    fig.text(0.5, 0.5, tex, ha="center", va="center", fontsize=size, color=NAVY)
    plt.savefig(os.path.join(HERE, name), dpi=220, bbox_inches="tight", pad_inches=0.04, transparent=True)
    plt.close("all")


eq("f_norm.png", r"$u_{t+1} = u_t + \mathrm{RMS}(\Delta U)\cdot M\!\left(\frac{U}{\mathrm{RMS}(U)}\right)$", 34)
eq("f_rms.png", r"$\mathrm{RMS}(U) = \sqrt{\frac{1}{6N}\sum_{t=1}^{6}\sum_{p=1}^{N} U_{t,p}^{\,2}}$", 30)
eq("f_block.png", r"$v = u + \mathrm{MLP}(n) + \mathrm{Attn}(n), \qquad n = \mathrm{Norm}(u)$", 32)
eq("f_swiglu.png", r"$a_i = \mathrm{SiLU}(g_i)\cdot x_i, \qquad \mathrm{SiLU}(g) = \frac{g}{1+e^{-g}}$", 32)


def field(nx, ny, kind, seed=0):
    """Made-up smooth field, only to show the grid."""
    rng = np.random.default_rng(seed)
    x, y = np.meshgrid(np.linspace(0, 1, nx), np.linspace(0, 1, ny), indexing="ij")
    if kind == "spots":
        f = sum(np.exp(-((x - a) ** 2 + (y - b) ** 2) / 0.004) for a, b in rng.random((14, 2)))
    elif kind == "shear":
        f = np.tanh((np.abs(y - 0.5 + 0.03 * np.sin(6 * np.pi * x)) - 0.25) / 0.04)
    else:
        f = np.where(x > 0.45, 1.0, 0.3) * np.where(y > 0.55, 1.0, 0.5) + 0.15 * np.sin(12 * np.hypot(x - 0.45, y - 0.55))
    return f


def grid_figure():
    systems = [("Gray–Scott", 128, 128, "spots"), ("Euler quadrants", 512, 512, "waves"), ("shear flow", 256, 512, "shear")]
    fig, axes = plt.subplots(1, 3, figsize=(13, 5.6), gridspec_kw={"width_ratios": [1, 1, 0.5]})
    for ax, (name, nx, ny, kind) in zip(axes, systems):
        f = field(nx, ny, kind)
        ax.imshow(f.T, origin="lower", cmap="Greys", extent=(0, nx, 0, ny), aspect="equal", alpha=0.75)
        px, py = nx // 32, ny // 32
        for i in range(33):
            ax.axvline(i * px, color=TEAL, lw=0.5)
            ax.axhline(i * py, color=TEAL, lw=0.5)
        ax.add_patch(plt.Rectangle((0, 0), px, py, fill=True, color=ORANGE, zorder=5))
        ax.set_xlim(0, nx); ax.set_ylim(0, ny)
        ax.set_xticks([]); ax.set_yticks([])
        for sp in ax.spines.values():
            sp.set_visible(True); sp.set_color(GREY)
        ax.set_title(f"{name}\n{nx} × {ny} pixels", fontsize=24, color=NAVY)
        ax.set_xlabel(f"one patch\n{px} × {py} pixels", fontsize=23, color=ORANGE)
    plt.tight_layout()
    plt.savefig(os.path.join(HERE, "grid.png"), bbox_inches="tight")
    plt.close("all")


grid_figure()
print("ok")

def edp_figure():
    """Classic encoder - processor - decoder picture, sizes for shear flow."""
    from matplotlib.patches import Polygon, Rectangle
    fig, ax = plt.subplots(figsize=(15, 5.3))
    ax.set_xlim(0, 17.2); ax.set_ylim(0, 6); ax.axis("off")
    LT, LN, LG = "#DDF2F0", "#E3E5F0", "#F1F5F8"

    def stack(x, y, w, h, n, d, fc, ec):
        for i in range(n):
            ax.add_patch(Rectangle((x + i * d, y - i * d), w, h, fc=fc, ec=ec, lw=1.5))

    def arr(x0, x1, y=3.0):
        ax.annotate("", xy=(x1, y), xytext=(x0, y), arrowprops=dict(arrowstyle="-|>", color=GREY, lw=2, mutation_scale=22))

    def label(x, y, text, color=GREY, size=19, bold=False):
        ax.text(x, y, text, ha="center", va="center", fontsize=size, color=color, fontweight="bold" if bold else "normal")

    stack(0.2, 1.65, 1.2, 2.8, 6, 0.1, LG, GREY)                      # 6 snapshots, full resolution
    label(1.05, 0.55, "6 snapshots\n4 fields, 256 × 512")
    arr(2.05, 2.45)
    ax.add_patch(Polygon([(2.5, 0.95), (4.3, 2.15), (4.3, 3.85), (2.5, 5.05)], closed=True, fc=LN, ec=NAVY, lw=2))
    label(3.4, 3.0, "encoder", NAVY, 21, True)
    arr(4.35, 4.75)
    stack(4.8, 2.4, 1.0, 1.0, 6, 0.07, LT, TEAL)                       # small grid
    label(5.4, 0.55, "6 × 32 × 32 patches\n1,408 numbers each", TEAL)
    arr(6.3, 6.7)
    ax.add_patch(Rectangle((6.75, 2.1), 3.7, 1.8, fc=LT, ec=TEAL, lw=2))
    for i in range(1, 40):
        ax.plot([6.75 + i * 3.7 / 40] * 2, [2.1, 3.9], color=TEAL, lw=0.6)
    label(8.6, 4.45, "processor, 40 blocks", TEAL, 21, True)
    label(8.6, 1.55, "same grid, same size", GREY)
    arr(10.5, 10.9)
    stack(10.95, 2.4, 1.0, 1.0, 6, 0.07, LT, TEAL)
    arr(12.4, 12.8)
    ax.add_patch(Polygon([(12.85, 2.15), (14.65, 0.95), (14.65, 5.05), (12.85, 3.85)], closed=True, fc=LN, ec=NAVY, lw=2))
    label(13.75, 3.0, "decoder", NAVY, 21, True)
    arr(14.7, 15.1)
    ax.add_patch(Rectangle((15.15, 1.6), 1.25, 2.8, fc=LG, ec=GREY, lw=1.5))
    label(15.78, 0.55, "change per field\n256 × 512")
    plt.savefig(os.path.join(HERE, "edp.png"), bbox_inches="tight")
    plt.close("all")


edp_figure()
print("ok")

eq("f_gnorm.png", r"$n_{p,i} = \gamma_i\,\frac{u_{p,i}}{\mathrm{RMS}_g}, \qquad \mathrm{RMS}_g = \sqrt{\frac{1}{88\cdot 1024}\sum_{p}\sum_{j\in g} u_{p,j}^{\,2}}$", 30)
eq("f_attn1.png", r"$s_{pr} = \frac{q_p\cdot k_r}{\sqrt{88}}, \qquad w_{pr} = \frac{e^{\,s_{pr}}}{\sum_{r'} e^{\,s_{pr'}}}$", 30)
eq("f_attn2.png", r"$o_p = \sum_{r} w_{pr}\, v_r$", 32)


def silu_figure():
    g = np.linspace(-5, 4, 300)
    fig, ax = plt.subplots(figsize=(6.4, 4.4))
    ax.axhline(0, color="#C9D2DA", lw=1); ax.axvline(0, color="#C9D2DA", lw=1)
    ax.plot(g, g / (1 + np.exp(-g)), color=NAVY, lw=3)
    for x0, c in [(-3, GREY), (2, ORANGE)]:
        y0 = x0 / (1 + np.exp(-x0))
        ax.plot([x0], [y0], "o", ms=12, color=c)
        ax.text(-4.8, 3.3 if x0 > 0 else 0.6, f"g = {x0}, SiLU = {y0:.2f}", fontsize=17, color=c)
    ax.set_xlabel("gate g"); ax.set_ylabel("SiLU(g)")
    ax.set_ylim(-1, 4.2)
    plt.tight_layout(); plt.savefig(os.path.join(HERE, "silu.png")); plt.close("all")


silu_figure()
print("ok")


# ---------------------------------------------------------------- the MLP as a classic network
def node(ax, x, y, text="", fc="white", ec=NAVY, r=0.28, size=15, tc="black"):
    ax.add_patch(plt.Circle((x, y), r, fc=fc, ec=ec, lw=2, zorder=3))
    if text:
        ax.text(x, y, text, ha="center", va="center", fontsize=size, color=tc, zorder=4)


def edges(ax, xs0, ys0, xs1, ys1, color="#B8C2CC", lw=0.9):
    for y0 in ys0:
        for y1 in ys1:
            ax.plot([xs0, xs1], [y0, y1], color=color, lw=lw, zorder=1)


def col(n, top=4.0, step=1.0):
    return [top - i * step for i in range(n)]


def nn_classic():
    fig, ax = plt.subplots(figsize=(12, 5.6)); ax.axis("off"); ax.set_aspect("equal")
    yi, yh, yo = col(4, 3.4, 1.0), col(6, 4.4, 1.0), col(4, 3.4, 1.0)
    edges(ax, 0, yi, 5, yh); edges(ax, 5, yh, 10, yo)
    for y in yi: node(ax, 0, y, fc="#F1F5F8", ec=GREY)
    for y in yh: node(ax, 5, y, "", fc="#DDF2F0", ec=TEAL)
    for y in yo: node(ax, 10, y, fc="#F1F5F8", ec=GREY)
    for x, y in [(0, yi[-1]), (5, yh[-1]), (10, yo[-1])]:
        ax.plot([x] * 3, [y - 0.75 + d for d in (0.25, 0, -0.25)], "o", ms=4, color=GREY)
    ax.text(0, 5.2, "1,408 numbers\nof one patch", ha="center", fontsize=18, color=NAVY)
    ax.text(5, 5.2, "2,816 neurons\neach with a bend", ha="center", fontsize=18, color=TEAL, fontweight="bold")
    ax.text(10, 5.2, "1,408 numbers\nback", ha="center", fontsize=18, color=NAVY)
    ax.text(2.5, -1.9, "up\na weighted sum\nper neuron", ha="center", va="top", fontsize=16, color=GREY)
    ax.text(7.5, -1.9, "down\na weighted sum\nper output", ha="center", va="top", fontsize=16, color=GREY)
    ax.set_xlim(-1.4, 11.4); ax.set_ylim(-3.9, 6.2)
    plt.savefig(os.path.join(HERE, "nn_classic.png"), bbox_inches="tight"); plt.close("all")


def nn_gated(name, inputs, neurons, outputs_n=4, numbers=False):
    """neurons: list of (x_text, g_text, a_text)."""
    fig, ax = plt.subplots(figsize=(12.5, 5.8)); ax.axis("off"); ax.set_aspect("equal")
    n = len(neurons)
    yc = col(n, 1.6 * (n - 1) / 2 + 0.8, 1.6) if n > 1 else [0.8]
    yi = col(len(inputs), (len(inputs) - 1) / 2 * 1.1 + 0.8, 1.1)
    yo = col(outputs_n, (outputs_n - 1) / 2 * 1.0 + 0.8, 1.0)
    xi, xn, xa, xo = 0, 4, 6.4, 9.6
    yx = [y + 0.38 for y in yc]; yg = [y - 0.38 for y in yc]
    edges(ax, xi, yi, xn, yx, color="#9FD9D3"); edges(ax, xi, yi, xn, yg, color="#F2B9A3")
    for k in range(n):
        ax.plot([xn, xa], [yx[k], yc[k]], color=TEAL, lw=2, zorder=1)
        ax.plot([xn, xa], [yg[k], yc[k]], color=ORANGE, lw=2, zorder=1)
    edges(ax, xa, yc, xo, yo)
    r = 0.42 if numbers else 0.3
    fs = 24 if numbers else 18
    ns = 20 if numbers else 15
    for y, t in zip(yi, inputs): node(ax, xi, y, t, fc="#F1F5F8", ec=GREY, r=r + 0.05, size=ns + 2)
    for k, (tx, tg, ta) in enumerate(neurons):
        node(ax, xn, yx[k], tx, fc="#DDF2F0", ec=TEAL, r=r, size=ns)
        node(ax, xn, yg[k], tg, fc="#FBE7DF", ec=ORANGE, r=r, size=ns)
        node(ax, xa, yc[k], ta, fc="#FBE7DF" if numbers else "#E3E5F0", ec=NAVY, r=r + 0.12, size=ns)
    for y in yo: node(ax, xo, y, "", fc="#F1F5F8", ec=GREY)
    top = max(yi + yx + yo) + 0.9
    ax.text(xi, top, "input", ha="center", fontsize=fs, color=NAVY)
    ax.text(xn, top + (0.55 if numbers else 0.45), "value x", ha="center", fontsize=fs, color=TEAL)
    ax.text(xn, top, "gate g", ha="center", fontsize=fs, color=ORANGE)
    ax.text(xa + 0.3, top, "a = SiLU(g) · x", ha="center", fontsize=fs, color=NAVY, fontweight="bold")
    ax.text(xo, top, "output", ha="center", fontsize=fs, color=NAVY)
    if not numbers:
        for x, y in [(xi, yi[-1]), (xa, yc[-1]), (xo, yo[-1])]:
            ax.plot([x] * 3, [y - 0.95 + d for d in (0.25, 0, -0.25)], "o", ms=4, color=GREY)
        ax.plot([xn] * 3, [yg[-1] - 0.95 + d for d in (0.25, 0, -0.25)], "o", ms=4, color=GREY)
    lo = min(yi + yg + yo) - (1.6 if not numbers else 0.9)
    ax.set_xlim(-1.2, 10.8); ax.set_ylim(lo, top + 1.2)
    plt.savefig(os.path.join(HERE, name), bbox_inches="tight"); plt.close("all")


def stacked_matrices():
    from matplotlib.patches import Rectangle
    fig, ax = plt.subplots(figsize=(12, 4.8)); ax.axis("off"); ax.set_aspect("equal")
    # left, two separate matrices
    ax.add_patch(Rectangle((0, 2.6), 2.4, 2.0, fc="#DDF2F0", ec=TEAL, lw=2)); ax.text(1.2, 3.6, "W_x\n2,816 × 1,408", ha="center", va="center", fontsize=17)
    ax.add_patch(Rectangle((0, 0.0), 2.4, 2.0, fc="#FBE7DF", ec=ORANGE, lw=2)); ax.text(1.2, 1.0, "W_g\n2,816 × 1,408", ha="center", va="center", fontsize=17)
    ax.text(1.2, 5.1, "what the model has", ha="center", fontsize=18, color=NAVY)
    ax.annotate("", xy=(5.3, 2.3), xytext=(3.2, 2.3), arrowprops=dict(arrowstyle="-|>", color=GREY, lw=2, mutation_scale=22))
    ax.text(4.25, 2.75, "stacked", ha="center", fontsize=16, color=GREY)
    # right, one stacked matrix
    ax.add_patch(Rectangle((5.8, 2.3), 2.4, 2.3, fc="#DDF2F0", ec=TEAL, lw=2))
    ax.add_patch(Rectangle((5.8, 0.0), 2.4, 2.3, fc="#FBE7DF", ec=ORANGE, lw=2))
    ax.text(7.0, 2.3, "one matrix\n5,632 × 1,408", ha="center", va="center", fontsize=17, bbox=dict(fc="white", ec="none", pad=2))
    ax.text(7.0, 5.1, "what the code computes", ha="center", fontsize=18, color=NAVY)
    ax.annotate("", xy=(11.0, 2.3), xytext=(8.9, 2.3), arrowprops=dict(arrowstyle="-|>", color=GREY, lw=2, mutation_scale=22))
    ax.text(9.95, 2.75, "split again", ha="center", fontsize=16, color=GREY)
    ax.text(11.6, 3.4, "2,816 values x", ha="left", va="center", fontsize=17, color=TEAL)
    ax.text(11.6, 1.2, "2,816 gates g", ha="left", va="center", fontsize=17, color=ORANGE)
    ax.set_xlim(-0.3, 14.6); ax.set_ylim(-0.4, 5.7)
    plt.savefig(os.path.join(HERE, "stacked.png"), bbox_inches="tight"); plt.close("all")


nn_classic()
nn_gated("nn_gated.png", ["", "", "", ""], [("", "", ""), ("", "", ""), ("", "", "")])
nn_gated("nn_tiny.png", ["1", "2"], [("0.5", "3", "1.43"), ("−1", "−2", "0.24")], outputs_n=2, numbers=True)
stacked_matrices()
print("ok")


def gate_example():
    """Made-up: 3 inputs, one neuron. Value and gate both read all inputs, with different weights."""
    fig, ax = plt.subplots(figsize=(13, 5.4)); ax.axis("off"); ax.set_aspect("equal")
    ins = [("ρ", 2.4), ("u", 1.2), ("p", 0.0)]
    gpos, xpos, apos = (5.0, 2.0), (5.0, 0.4), (8.4, 1.2)
    wg = {"ρ": 1, "u": 0, "p": 0}; wx = {"ρ": 0, "u": 1, "p": 0}
    for name, y in ins:
        for (tx, ty), w, c in [(gpos, wg[name], ORANGE), (xpos, wx[name], TEAL)]:
            if w:
                ax.plot([0, tx], [y, ty], color=c, lw=4, zorder=1)
            else:
                ax.plot([0, tx], [y, ty], color="#C9D2DA", lw=1.2, ls="--", zorder=1)
    ax.plot([gpos[0], apos[0]], [gpos[1], apos[1]], color=ORANGE, lw=2.5, zorder=1)
    ax.plot([xpos[0], apos[0]], [xpos[1], apos[1]], color=TEAL, lw=2.5, zorder=1)
    for name, y in ins:
        node(ax, 0, y, name, fc="#F1F5F8", ec=GREY, r=0.42, size=24)
    node(ax, *gpos, "g", fc="#FBE7DF", ec=ORANGE, r=0.42, size=24)
    node(ax, *xpos, "x", fc="#DDF2F0", ec=TEAL, r=0.42, size=24)
    node(ax, *apos, "a", fc="#E3E5F0", ec=NAVY, r=0.52, size=26)
    ax.text(0, 3.25, "the patch's numbers", ha="center", fontsize=19, color=NAVY)
    ax.text(-0.75, 2.4, "density", ha="right", va="center", fontsize=17, color=GREY)
    ax.text(-0.75, 1.2, "velocity", ha="right", va="center", fontsize=17, color=GREY)
    ax.text(-0.75, 0.0, "pressure", ha="right", va="center", fontsize=17, color=GREY)
    ax.text(5.0, 2.75, "gate  g = 1·ρ + 0·u + 0·p = ρ", ha="center", fontsize=19, color=ORANGE)
    ax.text(5.0, -0.55, "value  x = 0·ρ + 1·u + 0·p = u", ha="center", va="top", fontsize=19, color=TEAL)
    ax.text(9.1, 1.2, "a = SiLU(g) · x\n   ≈ ρ · u", ha="left", va="center", fontsize=21, color=NAVY, fontweight="bold")
    ax.set_xlim(-2.6, 12.2); ax.set_ylim(-1.3, 3.7)
    plt.savefig(os.path.join(HERE, "gate_example.png"), bbox_inches="tight"); plt.close("all")


gate_example()
print("ok")
