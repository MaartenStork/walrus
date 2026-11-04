"""Pictures that explain the three measures (neurons, paths, directions) for the weekly deck. Cartoons, made-up numbers.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/explain.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GREY, TEAL, ORANGE, PURPLE, LIGHT = "#232959", "#5A6B7B", "#13A89E", "#E05A2B", "#9B7FC0", "#C9D2DA"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 18, "mathtext.fontset": "cm",
                     "savefig.dpi": 200, "axes.spines.top": False, "axes.spines.right": False})
save = lambda n: (plt.savefig(os.path.join(HERE, n), bbox_inches="tight"), plt.close("all"))
rng = np.random.default_rng(4)

# ---------------------------------------------------------------- neurons: average activity per neuron, for two PDEs
fig, axes = plt.subplots(2, 1, figsize=(10, 4.8), sharex=True)
n = 14
for ax, name, c, seed in [(axes[0], "PDE A", TEAL, 1), (axes[1], "PDE B", NAVY, 2)]:
    v = np.maximum(np.random.default_rng(seed).gamma(2.0, 0.5, n), 0.45); v[np.random.default_rng(seed + 5).choice(n, 2, replace=False)] = 0.12
    strong = np.argsort(v)[-2:]
    cols = [c if x > 0.3 else LIGHT for x in v]
    bars = ax.bar(range(n), v, color=cols, width=0.7)
    ax.axhline(0.3, color=GREY, ls="--", lw=1.4)
    ax.set_ylabel(name, color=c, rotation=0, ha="right", va="center", fontsize=20)
    ax.set_yticks([]); ax.spines["left"].set_visible(False)
for ax in axes:
    ax.text(n - 0.35, 0.3, "used\nif above", color=GREY, fontsize=15, ha="left", va="center")
    ax.set_xlim(-0.6, n + 0.9)
axes[1].set_xticks(range(n)); axes[1].set_xticklabels([]); axes[1].set_xlabel("neurons of one layer", color=GREY)
plt.tight_layout(); save("x_neurons.png")

# ---------------------------------------------------------------- paths: two PDEs, each its own route of important neurons
def net(ax, route, c, title):
    cols = [[0.5, 1.5], [0, 1, 2], [0, 1, 2], [1]]; xs = [0, 1.6, 3.2, 4.8]
    for k in range(3):
        for y0 in cols[k]:
            for y1 in cols[k + 1]:
                ax.plot([xs[k], xs[k + 1]], [y0, y1], color=LIGHT, lw=1.2, zorder=1)
    ax.plot([p[0] for p in route], [p[1] for p in route], color=c, lw=4.5, zorder=2)
    for k, cc in enumerate(cols):
        for y in cc:
            on = (xs[k], y) in route
            ax.add_patch(plt.Circle((xs[k], y), 0.26, fc=c if on else "white", ec=c if on else LIGHT, lw=2, zorder=3))
    ax.text(4.8, 1.55, "prediction", ha="center", fontsize=16, color=GREY)
    ax.set_title(title, color=c, fontsize=21); ax.set_aspect("equal"); ax.axis("off"); ax.set_xlim(-0.5, 5.4); ax.set_ylim(-0.5, 2.5)
fig, axes = plt.subplots(1, 2, figsize=(12, 3.8))
net(axes[0], [(0, 0.5), (1.6, 2), (3.2, 1), (4.8, 1)], ORANGE, "path of PDE A")
net(axes[1], [(0, 1.5), (1.6, 0), (3.2, 1), (4.8, 1)], NAVY, "path of PDE B")
plt.tight_layout(); save("x_paths.png")

fig = plt.figure(figsize=(12, 1.5))
fig.text(0.5, 0.5, r"$\mathrm{importance} \;=\; \left|\, \mathrm{activation} \times \dfrac{\partial\, \mathrm{prediction}}{\partial\, \mathrm{activation}} \,\right|$",
         ha="center", va="center", fontsize=30, color=NAVY)
plt.savefig(os.path.join(HERE, "x_imp.png"), dpi=220, bbox_inches="tight", pad_inches=0.04, transparent=True); plt.close("all")

# ---------------------------------------------------------------- directions: clouds of activations and their main direction
def cloud(ax, ang, c, n=160, cx=0, cy=0):
    p = rng.normal(size=(n, 2)) * [1.0, 0.28]
    R = np.array([[np.cos(ang), -np.sin(ang)], [np.sin(ang), np.cos(ang)]]); p = p @ R.T
    ax.scatter(p[:, 0] + cx, p[:, 1] + cy, s=12, color=c, alpha=0.5, lw=0)
    d = R @ [2.1, 0]
    ax.annotate("", xy=(cx + d[0], cy + d[1]), xytext=(cx - d[0], cy - d[1]), arrowprops=dict(arrowstyle="-|>", color=c, lw=3, mutation_scale=18))
fig, axes = plt.subplots(1, 3, figsize=(13, 4.4))
for ax, title in zip(axes, ["one PDE, its main direction", "two PDEs, same direction\noverlap close to 1", "two PDEs, at right angles\noverlap close to 0"]):
    ax.set_title(title, fontsize=19, color=NAVY); ax.set_xlim(-3, 3); ax.set_ylim(-3, 3); ax.set_aspect("equal")
    ax.set_xticks([]); ax.set_yticks([]); ax.set_xlabel("neuron 1", color=GREY); ax.set_ylabel("neuron 2", color=GREY)
cloud(axes[0], 0.5, PURPLE)
cloud(axes[1], 0.5, PURPLE); cloud(axes[1], 0.55, NAVY)
cloud(axes[2], 0.5, PURPLE); cloud(axes[2], 0.5 + np.pi / 2, NAVY)
plt.tight_layout(); save("x_directions.png")
print("ok")


# ---------------------------------------------------------------- one neuron, its number on every patch, for two PDEs
fig, axes = plt.subplots(1, 2, figsize=(11, 3.9), sharey=True)
pts = 12
for ax, name, vals, used, c in [(axes[0], "PDE A", np.abs(np.random.default_rng(8).normal(0, 1.4, pts)), True, TEAL),
                                (axes[1], "PDE B", np.abs(np.random.default_rng(9).normal(0, 0.05, pts)), False, NAVY)]:
    ax.plot(range(pts), vals, "o", color=c, ms=10)
    m = vals.mean()
    ax.axhline(m, color=c, lw=3); ax.text(pts - 0.5, max(m + 0.12, 0.6), "average", ha="right", fontsize=17, color=c)
    ax.axhline(0.3, color=GREY, ls="--", lw=1.4)
    ax.set_title(f"{name}, " + ("uses it" if used else "does not use it"), fontsize=20, color=c)
    ax.set_xticks([]); ax.set_xlabel(f"patches of {name}, one dot each", color=GREY)
axes[0].set_ylabel("the neuron's number", color=GREY); axes[0].set_yticks([0, 1, 2, 3])
axes[1].text(-0.3, 0.36, "the line", ha="left", fontsize=15, color=GREY)
plt.tight_layout(); save("x_avg.png")
print("ok")


# ---------------------------------------------------------------- paths, simple: switch one neuron off, does the prediction change?
def small_net(ax, off=None, title="", c=ORANGE):
    cols = [[0.5, 1.5], [0, 1, 2], [0, 1, 2]]; xs = [0, 1.6, 3.2]
    for k in range(2):
        for y0 in cols[k]:
            for y1 in cols[k + 1]:
                dead = off is not None and ((xs[k], y0) == off or (xs[k + 1], y1) == off)
                ax.plot([xs[k], xs[k + 1]], [y0, y1], color="#EEF1F4" if dead else LIGHT, lw=1.2, zorder=1)
    for y in cols[2]:
        ax.plot([3.2, 4.6], [y, 1], color="#EEF1F4" if off == (3.2, y) else LIGHT, lw=1.2, zorder=1)
    for k, cc in enumerate(cols):
        for y in cc:
            is_off = off == (xs[k], y)
            ax.add_patch(plt.Circle((xs[k], y), 0.26, fc="white", ec=c if is_off else LIGHT, lw=2.5 if is_off else 2, zorder=3))
            if is_off:
                ax.plot([xs[k] - 0.18, xs[k] + 0.18], [y - 0.18, y + 0.18], color=c, lw=3, zorder=4)
                ax.plot([xs[k] - 0.18, xs[k] + 0.18], [y + 0.18, y - 0.18], color=c, lw=3, zorder=4)
    ax.set_title(title, fontsize=20, color=NAVY); ax.set_aspect("equal"); ax.axis("off"); ax.set_xlim(-0.5, 6.4); ax.set_ylim(-0.6, 2.6)


yy, xx = np.mgrid[-1:1:80j, -1:1:80j]
base_img = np.exp(-((xx + 0.2) ** 2 + (yy - 0.2) ** 2) / 0.12)
changed = base_img * 0.6 + 0.35 * np.exp(-((xx - 0.4) ** 2 + (yy + 0.3) ** 2) / 0.08)
fig, axes = plt.subplots(1, 2, figsize=(13, 3.9))
for ax, off, title, img in [(axes[0], None, "normal", base_img), (axes[1], (1.6, 2), "one neuron switched off", changed)]:
    small_net(ax, off, title)
    ax.imshow(img, extent=(4.7, 6.3, 0.2, 1.8), cmap="magma", zorder=2)
plt.tight_layout(); save("x_switch.png")
print("ok")


# ---------------------------------------------------------------- paths, what I wanted: follow the route. And why Poseidon's skips make it messy
from matplotlib.patches import FancyArrowPatch
def route_net(ax, skips=False):
    cols = [[0, 1, 2]] * 5; xs = [0, 1.4, 2.8, 4.2, 5.6]
    for k in range(4):
        for y0 in cols[k]:
            for y1 in cols[k + 1]:
                ax.plot([xs[k], xs[k + 1]], [y0, y1], color=LIGHT, lw=1.1, zorder=1)
    route = [(0, 0), (1.4, 1), (2.8, 2), (4.2, 1), (5.6, 1)]
    ax.plot([p[0] for p in route], [p[1] for p in route], color=ORANGE, lw=4.5, zorder=2)
    if skips:
        for (a, b) in [(0, 5.6), (1.4, 4.2)]:
            ax.add_patch(FancyArrowPatch((a, 2.35), (b, 2.35), connectionstyle="arc3,rad=-0.35", arrowstyle="-|>",
                                         mutation_scale=16, color=GREY, lw=2, ls="--", zorder=1))
        ax.add_patch(FancyArrowPatch((0, 0), (5.6, 1), connectionstyle="arc3,rad=0.45", arrowstyle="-|>",
                                     mutation_scale=16, color=ORANGE, lw=2.5, ls="--", zorder=2))
    for k, cc in enumerate(cols):
        for y in cc:
            on = (xs[k], y) in route
            ax.add_patch(plt.Circle((xs[k], y), 0.24, fc=ORANGE if on else "white", ec=ORANGE if on else LIGHT, lw=2, zorder=3))
    ax.set_aspect("equal"); ax.axis("off"); ax.set_xlim(-0.5, 7.4); ax.set_ylim(-1.4, 3.6)
fig, axes = plt.subplots(1, 2, figsize=(13, 4.2))
route_net(axes[0]); axes[0].set_title("information goes layer by layer", fontsize=20, color=NAVY)
route_net(axes[1], skips=True); axes[1].set_title("in Poseidon, it can also jump layers", fontsize=20, color=NAVY)
plt.tight_layout(); save("x_route.png")
print("ok")
