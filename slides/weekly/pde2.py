"""Alternative PDE-types picture: 2D snapshots of the whole field. Elliptic, two answers (heater in two places, no time).
Parabolic and hyperbolic, three moments in time. Made-up but shaped like the real solutions.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/pde2.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
TEAL, ORANGE, PURPLE, GREY = "#13A89E", "#E05A2B", "#9B7FC0", "#5A6B7B"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "mathtext.fontset": "cm", "savefig.dpi": 200})
n = 200
y, x = np.mgrid[-1:1:n * 1j, -1:1:n * 1j]
r = lambda cx, cy: np.hypot(x - cx, y - cy)


def elliptic(cx, cy):                       # steady temperature around a heater, cold walls
    u = np.log(1 / (r(cx, cy) + 0.04)); u = u - u.min(); w = (1 - x ** 2) * (1 - y ** 2)
    return u * w / (u * w).max()


def parabolic(t):                           # a hot spot spreading out, same heat, so it gets lower
    s2 = 0.004 + 0.02 * t
    return (0.004 / s2) * np.exp(-r(0, 0) ** 2 / (2 * s2))


def hyperbolic(t):                          # a ring travelling out, staying sharp
    return np.exp(-(r(0, 0) - 0.35 * t) ** 2 / (2 * 0.045 ** 2))


rows = [(TEAL, "elliptic", r"$-\Delta u = f$", [np.exp(-r(-0.1, 0.05) ** 2 / (2 * 0.03 ** 2)), elliptic(-0.1, 0.05)], ["source f", "answer u"]),
        (ORANGE, "parabolic", r"$\dfrac{\partial u}{\partial t} = \Delta u$", [np.sqrt(parabolic(t)) for t in (0, 1, 2)], ["$t = 0$", "$t = 1$", "$t = 2$"]),
        (PURPLE, "hyperbolic", r"$\dfrac{\partial^2 u}{\partial t^2} = \Delta u$", [hyperbolic(t) for t in (0, 1, 2)], ["$t = 0$", "$t = 1$", "$t = 2$"])]
fig, axes = plt.subplots(3, 4, figsize=(12, 9.6), gridspec_kw={"width_ratios": [1.25, 1, 1, 1]})
for i, (c, name, eq, pics, caps) in enumerate(rows):
    a0 = axes[i, 0]; a0.axis("off")
    a0.text(0.5, 0.62, name, ha="center", va="center", fontsize=40, color=c, fontweight="bold", transform=a0.transAxes)
    a0.text(0.5, 0.26, eq, ha="center", va="center", fontsize=40, color=c, transform=a0.transAxes)
    for j in range(3):
        ax = axes[i, j + 1]; ax.set_xticks([]); ax.set_yticks([])
        if j < len(pics):
            ax.imshow(pics[j], cmap="magma", vmin=0, vmax=1, origin="lower")
            ax.set_title(caps[j], fontsize=30, color=GREY, pad=8)
            for sp in ax.spines.values(): sp.set_color("#C9D2DA")
        else:
            ax.axis("off")
plt.tight_layout(h_pad=1.6, w_pad=1.0)
plt.savefig(os.path.join(HERE, "pde_snapshots.png"), bbox_inches="tight"); plt.close("all")
print("ok")
