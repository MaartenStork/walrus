"""Figures and formulas for pde_types_explained.pptx. Made-up fields, shaped like the real solutions.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/types/figures.py
1_conics.png is a copy from poseidon/playground/research_plan/slides/pde_types."""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import to_rgb

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, GREY, TEAL, ORANGE, PURPLE = "#232959", "#5A6B7B", "#13A89E", "#E05A2B", "#9B7FC0"
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 18, "mathtext.fontset": "cm",
                     "savefig.dpi": 200, "axes.spines.top": False, "axes.spines.right": False})
save = lambda name: (plt.savefig(os.path.join(HERE, name), bbox_inches="tight"), plt.close("all"))


def eq(name, tex, size=34, color=NAVY):
    fig = plt.figure(figsize=(12, 1.6)); fig.text(0.5, 0.5, tex, ha="center", va="center", fontsize=size, color=color)
    plt.savefig(os.path.join(HERE, name), dpi=220, bbox_inches="tight", pad_inches=0.04, transparent=True); plt.close("all")


# ---------------------------------------------------------------- formulas
eq("f_ell.png", r"$-\Delta u = f$", 54, TEAL)
eq("f_par.png", r"$\dfrac{\partial u}{\partial t} = \Delta u$", 54, ORANGE)
eq("f_hyp.png", r"$\dfrac{\partial^2 u}{\partial t^2} = \Delta u$", 54, PURPLE)
eq("f_d1.png", r"$\dfrac{\partial u}{\partial x}\ \ \mathrm{slope} \qquad \dfrac{\partial^2 u}{\partial x^2}\ \ \mathrm{curvature}$", 32)
eq("f_dt.png", r"$\dfrac{\partial u}{\partial t}\ \ \mathrm{speed} \qquad \dfrac{\partial^2 u}{\partial t^2}\ \ \mathrm{acceleration}$", 32)
eq("f_lap.png", r"$\Delta u = \dfrac{\partial^2 u}{\partial x^2} + \dfrac{\partial^2 u}{\partial y^2}$", 36)
eq("f_grid.png", r"$\Delta u \approx \dfrac{u_{\mathrm{left}} + u_{\mathrm{right}} + u_{\mathrm{up}} + u_{\mathrm{down}} - 4\,u}{h^2}$", 32)
eq("f_steady.png", r"$\dfrac{\partial u}{\partial t} = \Delta u + f \quad \longrightarrow \quad 0 = \Delta u + f \quad \longrightarrow \quad -\Delta u = f$", 30)
eq("f_pargen.png", r"$\dfrac{\partial u}{\partial t} = D\,\Delta u + R(u)$", 34, ORANGE)
eq("f_hypgen.png", r"$\dfrac{\partial^2 u}{\partial t^2} = c^2\,\Delta u$", 34, PURPLE)
eq("f_newton.png", r"$m\,a = F \qquad \longleftrightarrow \qquad \dfrac{\partial^2 u}{\partial t^2} = \Delta u$", 32)
eq("f_ns.png", r"$\dfrac{\partial u}{\partial t} + (u\cdot\nabla)\,u = \nu\,\Delta u - \nabla p, \qquad \nabla\cdot u = 0$", 32)
eq("f_conic.png", r"$X^2 + Y^2 \qquad\qquad T = X^2 + Y^2 \qquad\qquad T^2 = X^2 + Y^2$", 32)


# ---------------------------------------------------------------- slope and curvature
x = np.linspace(-3, 3, 400)
u = np.exp(-(x + 1) ** 2) - 0.8 * np.exp(-(x - 1.4) ** 2 / 0.6)
fig, ax = plt.subplots(figsize=(10, 4.2))
ax.plot(x, u, color=NAVY, lw=3)
x0 = 0.2; i0 = np.argmin(abs(x - x0)); s = np.gradient(u, x)[i0]
ax.plot([x0 - 0.7, x0 + 0.7], [u[i0] - 0.7 * s, u[i0] + 0.7 * s], color=ORANGE, lw=2.5)
ax.text(x0 + 0.15, u[i0] + 0.25, "slope", color=ORANGE, fontsize=20)
ax.plot([-1], [1], "o", color=TEAL, ms=10); ax.text(-1, 1.12, "peak, curvature < 0", ha="center", color=TEAL, fontsize=20)
ax.plot([1.4], [-0.8], "o", color=PURPLE, ms=10); ax.text(1.4, -1.08, "dip, curvature > 0", ha="center", color=PURPLE, fontsize=20)
ax.set_xticks([]); ax.set_yticks([]); ax.set_xlabel("place x", color=GREY); ax.set_ylabel("u", color=GREY, rotation=0)
ax.set_ylim(-1.25, 1.35)
save("slope.png")


# ---------------------------------------------------------------- grid stencil
fig, ax = plt.subplots(figsize=(5, 5)); ax.set_aspect("equal"); ax.axis("off")
for i in range(5):
    ax.plot([0.5, 4.5], [i + 0.5] * 2, color="#C9D2DA", lw=1); ax.plot([i + 0.5] * 2, [0.5, 4.5], color="#C9D2DA", lw=1)
for (cx, cy, c, t) in [(2.5, 2.5, NAVY, "u"), (1.5, 2.5, TEAL, "left"), (3.5, 2.5, TEAL, "right"), (2.5, 3.5, TEAL, "up"), (2.5, 1.5, TEAL, "down")]:
    ax.add_patch(plt.Circle((cx, cy), 0.36, fc="white", ec=c, lw=2.5, zorder=3))
    ax.text(cx, cy, t, ha="center", va="center", fontsize=15 if t != "u" else 22, color=c, zorder=4)
ax.annotate("", xy=(3.5, 4.75), xytext=(2.5, 4.75), arrowprops=dict(arrowstyle="<->", color=GREY))
ax.text(3.0, 4.9, "h", ha="center", color=GREY, fontsize=18)
ax.set_xlim(0.3, 4.7); ax.set_ylim(0.3, 5.2)
save("stencil.png")


# ---------------------------------------------------------------- three points 0, 1, 0
def three(name, arrows=None, label="", color=NAVY):
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    xs, vs = [0, 1, 2], [0, 1, 0]
    ax.axhline(0, color="#C9D2DA", lw=1)
    for xx, v in zip(xs, vs):
        ax.plot([xx, xx], [0, v], color=NAVY, lw=3); ax.plot([xx], [v], "o", color=NAVY, ms=14)
    ax.text(1, 1.12, "Δu = −2", ha="center", fontsize=20, color=NAVY)
    ax.text(0, 0.18, "Δu = +1", ha="center", fontsize=17, color=NAVY); ax.text(2, 0.18, "Δu = +1", ha="center", fontsize=17, color=NAVY)
    if arrows:
        for xx, v, d, t in arrows:
            ax.annotate("", xy=(xx + 0.22, v + d), xytext=(xx + 0.22, v), arrowprops=dict(arrowstyle="-|>", color=color, lw=3, mutation_scale=22))
            ax.text(xx + 0.32, v + d / 2, t, color=color, fontsize=18, va="center")
    if label:
        ax.set_title(label, color=color, fontsize=20)
    ax.set_xticks(xs); ax.set_xticklabels(["left", "middle", "right"]); ax.set_yticks([0, 1])
    ax.set_xlim(-0.5, 2.8); ax.set_ylim(-0.6, 1.35)
    save(name)


three("three.png")
three("three_par.png", [(1, 1, -0.5, "goes down"), (0, 0.4, 0.3, "up"), (2, 0.4, 0.3, "up")], "speed = Δu", ORANGE)
three("three_hyp.png", [(1, 1, -0.5, "speeds up, down"), (0, 0.4, 0.3, ""), (2, 0.4, 0.3, "")], "acceleration = Δu", PURPLE)


# ---------------------------------------------------------------- a real small simulation: middle point over time
N, dx = 41, 1.0
u0 = np.exp(-((np.arange(N) - 20) ** 2) / 4.0)
def heat(T, dt=0.1):
    u = u0.copy(); out = [u[20]]
    for _ in range(int(T / dt)):
        u[1:-1] += dt * (u[2:] + u[:-2] - 2 * u[1:-1]); out.append(u[20])
    return np.array(out)
def wave(T, dt=0.1):
    u = u0.copy(); up = u0.copy(); out = [u[20]]
    for _ in range(int(T / dt)):
        un = u.copy(); un[1:-1] = 2 * u[1:-1] - up[1:-1] + dt ** 2 * (u[2:] + u[:-2] - 2 * u[1:-1]); up, u = u, un; out.append(u[20])
    return np.array(out)
T = 12; tt = np.arange(0, T + 1e-9, 0.1)
fig, ax = plt.subplots(figsize=(9, 4.2))
ax.axhline(0, color="#C9D2DA", lw=1)
ax.plot(tt, heat(T)[:len(tt)], color=ORANGE, lw=3, label="parabolic, stays and fades")
ax.plot(tt, wave(T)[:len(tt)], color=PURPLE, lw=3, label="hyperbolic, moves away")
ax.set_xlabel("time t"); ax.set_ylabel("height in the middle"); ax.set_yticks([0, 1]); ax.legend(frameon=False, fontsize=17)
save("middle.png")


# ---------------------------------------------------------------- 1D lines and 2D snapshots per type (as in the weekly deck)
xl = np.linspace(-1, 1, 600)
bump = lambda c, s: np.exp(-((xl - c) ** 2) / (2 * s ** 2))
shade = lambda color, f: tuple(1 - f * (1 - np.array(to_rgb(color))))
def lines(name, kind):
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    for i, t in enumerate([0, 1, 2, 3]):
        if kind == "par":
            s = np.sqrt(0.004 + 0.012 * t); y = bump(0, s) * np.sqrt(0.004) / s; c = ORANGE
        else:
            y = 0.5 * (bump(-0.25 * t, 0.06) + bump(0.25 * t, 0.06)); c = PURPLE
        ax.plot(xl, y, color=shade(c, 0.3 + 0.7 * i / 3), lw=3, label=f"$t = {t}$")
    ax.set_yticks([]); ax.set_xticks([]); ax.set_xlabel("place", color=GREY); ax.spines["left"].set_visible(False)
    ax.legend(frameon=False, fontsize=15, loc="upper right" if kind == "par" else "upper left")
    save(name)
lines("line_par.png", "par"); lines("line_hyp.png", "hyp")

n = 200
yy, xx = np.mgrid[-1:1:n * 1j, -1:1:n * 1j]
r = lambda cx, cy: np.hypot(xx - cx, yy - cy)
def ell():
    v = np.log(1 / (r(-0.1, 0.05) + 0.04)); v -= v.min(); w = (1 - xx ** 2) * (1 - yy ** 2); return v * w / (v * w).max()
fig, axes = plt.subplots(1, 2, figsize=(8, 4.3))
for ax, img, cap in zip(axes, [np.exp(-r(-0.1, 0.05) ** 2 / (2 * 0.03 ** 2)), ell()], ["source f", "answer u"]):
    ax.imshow(img, cmap="magma", vmin=0, vmax=1, origin="lower"); ax.set_xticks([]); ax.set_yticks([])
    ax.set_title(cap, fontsize=22, color=GREY)
plt.tight_layout(); save("ell_pair.png")
print("ok")
