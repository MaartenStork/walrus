"""Small icons for the four measures on slide 9 of the weekly deck. Cartoons, not data.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/icons.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GREY, TEAL, ORANGE, PURPLE, LIGHT = "#232959", "#5A6B7B", "#13A89E", "#E05A2B", "#9B7FC0", "#C9D2DA"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"]})


def new():
    fig, ax = plt.subplots(figsize=(3.2, 1.9)); ax.set_aspect("equal"); ax.axis("off"); return fig, ax


def done(fig, ax, name, xl, yl):
    ax.set_xlim(*xl); ax.set_ylim(*yl)
    fig.savefig(os.path.join(HERE, name), dpi=250, bbox_inches="tight", transparent=True); plt.close(fig)


def dot(ax, x, y, on, c, r=0.32):
    ax.add_patch(plt.Circle((x, y), r, fc=c if on else "white", ec=c if on else LIGHT, lw=2, zorder=3))


# neurons: which ones light up, for two PDEs
fig, ax = new()
a = [1, 1, 0, 1, 0, 1, 1]; b = [1, 0, 1, 1, 1, 0, 1]
for i in range(7):
    dot(ax, i, 1.0, a[i], TEAL); dot(ax, i, 0.0, b[i], NAVY)
ax.text(-0.75, 1.0, "A", ha="right", va="center", fontsize=16, color=TEAL); ax.text(-0.75, 0.0, "B", ha="right", va="center", fontsize=16, color=NAVY)
done(fig, ax, "icon_neurons.png", (-1.4, 6.5), (-0.5, 1.5))

# paths: a small network, one route bold
fig, ax = new()
cols = [[0.5, 1.5], [0, 1, 2], [0, 1, 2], [1]]
xs = [0, 1.6, 3.2, 4.8]
for k in range(3):
    for y0 in cols[k]:
        for y1 in cols[k + 1]:
            ax.plot([xs[k], xs[k + 1]], [y0, y1], color=LIGHT, lw=1.2, zorder=1)
route = [(0, 0.5), (1.6, 2), (3.2, 1), (4.8, 1)]
ax.plot([p[0] for p in route], [p[1] for p in route], color=ORANGE, lw=4, zorder=2)
for k, c in enumerate(cols):
    for y in c:
        dot(ax, xs[k], y, (xs[k], y) in route, ORANGE, 0.26)
done(fig, ax, "icon_paths.png", (-0.5, 5.3), (-0.5, 2.5))

# directions: two clouds, each with its main direction
rng = np.random.default_rng(1)
fig, ax = new()
for (cx, ang, c) in [(0.0, 0.35, PURPLE), (3.4, 1.25, NAVY)]:
    p = rng.normal(size=(110, 2)) * [1.0, 0.38]
    R = np.array([[np.cos(ang), -np.sin(ang)], [np.sin(ang), np.cos(ang)]]); p = p @ R.T * 0.8
    ax.scatter(p[:, 0] + cx, p[:, 1] + 1.0, s=14, color=c, alpha=0.55, lw=0)
    d = R @ [1.25, 0]
    ax.annotate("", xy=(cx + d[0], 1.0 + d[1]), xytext=(cx - d[0], 1.0 - d[1]),
                arrowprops=dict(arrowstyle="-|>", color=c, lw=2.5, mutation_scale=16))
done(fig, ax, "icon_directions.png", (-1.6, 4.9), (-0.4, 2.4))

# squeezing: a wide layer, then a narrow one
fig, ax = new()
for y in np.linspace(0, 2.4, 7):
    dot(ax, 0, y, True, NAVY, 0.17)
for y in np.linspace(0.8, 1.6, 2):
    dot(ax, 3.2, y, True, NAVY, 0.17)
ax.annotate("", xy=(2.5, 1.2), xytext=(0.7, 1.2), arrowprops=dict(arrowstyle="-|>", color=GREY, lw=2, mutation_scale=16))
ax.text(1.6, 1.45, "fewer", ha="center", fontsize=14, color=GREY)
done(fig, ax, "icon_squeeze.png", (-0.6, 3.8), (-0.4, 2.8))
print("ok")
