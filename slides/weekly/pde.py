"""The three PDE types in one picture, same kind of plot each: the field along a line, darker = later in time.
Elliptic has no time (one curve), parabolic spreads, hyperbolic travels and stays sharp.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/pde.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import to_rgb

HERE = os.path.dirname(os.path.abspath(__file__))
TEAL, ORANGE, PURPLE, GREY = "#13A89E", "#E05A2B", "#9B7FC0", "#5A6B7B"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "mathtext.fontset": "cm",
                     "savefig.dpi": 200, "axes.spines.top": False, "axes.spines.right": False, "axes.spines.left": False})
x = np.linspace(-1, 1, 600)
bump = lambda c, s: np.exp(-((x - c) ** 2) / (2 * s ** 2))


def shade(color, f):            # f in 0..1, light to full colour
    c = np.array(to_rgb(color)); return tuple(1 - f * (1 - c))


fig, axes = plt.subplots(1, 3, figsize=(15, 4.6))
panels = [(TEAL, r"$-\Delta u = f$"), (ORANGE, r"$\dfrac{\partial u}{\partial t} = \Delta u$"),
          (PURPLE, r"$\dfrac{\partial^2 u}{\partial t^2} = \Delta u$")]
times = [0, 1, 2, 3]
for k, (ax, (c, eq)) in enumerate(zip(axes, panels)):
    if k == 0:
        ax.plot(x, 1 - np.abs(x), color=c, lw=3.5)                       # steady answer to a point heater
    elif k == 1:
        for i, t in enumerate(times):
            s = np.sqrt(0.004 + 0.012 * t)
            ax.plot(x, bump(0, s) * np.sqrt(0.004) / s, color=shade(c, 0.3 + 0.7 * i / 3), lw=3)
    else:
        for i, t in enumerate(times):
            ax.plot(x, 0.5 * (bump(-0.25 * t, 0.06) + bump(0.25 * t, 0.06)),
                    color=shade(c, 0.3 + 0.7 * i / 3), lw=3)
    ax.set_title(eq, fontsize=30, color=c, pad=18)
    note = lambda txt, xy, xyt: ax.annotate(txt, xy=xy, xytext=xyt, fontsize=19, color=GREY, ha="center",
                                            arrowprops=dict(arrowstyle="-", color=GREY, lw=1))
    if k == 0:
        note("heat source", (0, 1.0), (0.45, 0.95))
    elif k == 1:
        note("$t = 0$", (0.03, 0.93), (0.42, 0.9)); note("$t = 3$", (-0.2, 0.17), (-0.6, 0.55))
    else:
        note("$t = 0$", (0.04, 0.95), (0.42, 0.95)); note("$t = 3$", (-0.75, 0.5), (-0.75, 0.75))
    ax.set_yticks([]); ax.set_xticks([]); ax.set_ylim(-0.02, 1.08); ax.set_xlabel("place", fontsize=18, color=GREY)
plt.tight_layout(w_pad=4)
plt.savefig(os.path.join(HERE, "pde_types.png"), bbox_inches="tight"); plt.close("all")
print("ok")
