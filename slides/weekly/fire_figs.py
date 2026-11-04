"""Neuron slides of the weekly deck, the firing version: a neuron fires on a patch when its activation is above 0.
Reads poseidon/playground/families/records/joint2_fire_epoch40.npz (read only).
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/weekly/fire_figs.py"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
REC = os.path.expanduser("~/Documents/GitHub/poseidon/playground/families/records/joint2_fire_epoch40.npz")
NAVY, GREY, TEAL, ORANGE, PURPLE, LIGHT = "#232959", "#5A6B7B", "#13A89E", "#E05A2B", "#9B7FC0", "#C9D2DA"
COL = {"elliptic": TEAL, "parabolic": ORANGE, "hyperbolic": PURPLE, "mixed": GREY}
plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman", "DejaVu Serif"], "font.size": 18,
                     "axes.spines.top": False, "axes.spines.right": False, "savefig.dpi": 220})
save = lambda n: (plt.tight_layout(), plt.savefig(os.path.join(HERE, n), bbox_inches="tight"), plt.close("all"))

# ---------------------------------------------------------------- how: one neuron, its number on every patch, two PDEs (made up)
fig, axes = plt.subplots(1, 2, figsize=(11, 4.0), sharey=True)
pts = 12
a = np.array([1.8, -0.1, 2.4, 0.9, -0.15, 1.2, 0.4, -0.05, 2.9, 1.1, -0.12, 0.7])
b = np.array([-0.1, -0.15, -0.05, -0.12, -0.08, -0.16, -0.03, -0.11, -0.14, -0.06, -0.09, -0.13])
for ax, name, v, c in [(axes[0], "PDE A", a, TEAL), (axes[1], "PDE B", b, NAVY)]:
    on = v > 0
    ax.axhline(0, color=GREY, lw=1.6)
    ax.plot(np.arange(pts)[on], v[on], "o", color=c, ms=11)
    ax.plot(np.arange(pts)[~on], v[~on], "o", mfc="white", mec=LIGHT, mew=2, ms=11)
    ax.set_title(f"{name}, fires on {on.sum()} of {pts} patches", fontsize=20, color=c)
    ax.set_xticks([]); ax.set_xlabel(f"patches of {name}, one dot each", color=GREY)
axes[0].set_ylabel("the neuron's number", color=GREY); axes[0].set_yticks([0, 1, 2, 3])
axes[0].text(11.6, 0.08, "0", color=GREY, fontsize=16, ha="right", va="bottom")
save("x_fire.png")

R = np.load(REC)
names, types, ds = list(R["datasets"]), list(R["types"]), R["dataset"]
L = len(R["blocks"]); layers = np.arange(1, L + 1)
rate = [np.stack([R[f"fire_{l:02d}"][ds == k].astype(np.float32).mean(0) for k in range(len(names))]) for l in range(L)]

# ---------------------------------------------------------------- silent neurons per PDE and layer
silent = np.array([(r < 0.01).mean(1) for r in rate]) * 100
fig, ax = plt.subplots(figsize=(11, 4.6))
for k in range(len(names)):
    ax.plot(layers, silent[:, k], color=COL[types[k]], lw=2.2, alpha=0.85)
for t in ["elliptic", "parabolic", "hyperbolic", "mixed"]:
    ax.plot([], [], color=COL[t], lw=3, label=t)
ax.legend(frameon=False, fontsize=15, ncol=2, loc="upper left")
ax.set_ylim(0, 100); ax.set_xlim(0.5, L + 0.5); ax.set_xticks([1, 8, 16, 24, 32])
ax.set_xlabel("layer"); ax.set_ylabel("neurons silent for the PDE (%)")
save("fire_silent.png")

# ---------------------------------------------------------------- for how many PDEs does a neuron fire, per layer
groups = [("for all 8", lambda n: n == 8, TEAL), ("for 4 to 7", lambda n: (n >= 4) & (n <= 7), "#8FD3CC"),
          ("for 2 or 3", lambda n: (n >= 2) & (n <= 3), "#C9B8E2"), ("for 1", lambda n: n == 1, PURPLE),
          ("for none", lambda n: n == 0, LIGHT)]
counts = [(r >= 0.01).sum(0) for r in rate]
fig, ax = plt.subplots(figsize=(11, 4.6))
bottom = np.zeros(L)
for lab, f, c in groups:
    v = np.array([100 * f(n).mean() for n in counts])
    ax.bar(layers, v, bottom=bottom, color=c, width=0.85, label=lab); bottom += v
ax.set_ylim(0, 100); ax.set_xlim(0.4, L + 0.6); ax.set_xticks([1, 8, 16, 24, 32])
ax.set_xlabel("layer"); ax.set_ylabel("neurons (%)")
ax.legend(frameon=False, fontsize=15, ncol=5, loc="upper center", bbox_to_anchor=(0.5, -0.2), title="a neuron fires", title_fontsize=15)
save("fire_count.png")
print("ok")


# ---------------------------------------------------------------- same neurons? overlap of firing neurons per pair, middle layers
NICE = ["Poisson", "Helmholtz", "Allen–Cahn", "wave G", "wave L", "Euler G", "Euler R", "NS"]
M = np.zeros((8, 8))
for l in range(12, 20):
    on = rate[l] >= 0.01
    for i in range(8):
        for j in range(8):
            M[i, j] += (on[i] & on[j]).sum() / max((on[i] | on[j]).sum(), 1) / 8
off = ~np.eye(8, dtype=bool)
fig, ax = plt.subplots(figsize=(7.6, 6.8))
ax.imshow(np.where(off, M, np.nan), cmap="Blues", vmin=0.2, vmax=1.0)
for i in range(8):
    for j in range(8):
        if i != j:
            ax.text(j, i, f"{M[i, j]:.2f}", ha="center", va="center", fontsize=15, color="white" if M[i, j] > 0.7 else NAVY)
ax.set_xticks(range(8)); ax.set_yticks(range(8))
ax.set_xticklabels(NICE, rotation=40, ha="right"); ax.set_yticklabels(NICE)
for lab, k in zip(ax.get_xticklabels(), range(8)): lab.set_color(COL[types[k]])
for lab, k in zip(ax.get_yticklabels(), range(8)): lab.set_color(COL[types[k]])
for s in ax.spines.values(): s.set_visible(False)
ax.tick_params(length=0)
save("fire_pairs.png")
print("pairs ok")


# ---------------------------------------------------------------- elliptic vs hyperbolic, average silent share per group
fig, ax = plt.subplots(figsize=(11, 4.6))
for t, lab in [("elliptic", "elliptic, Poisson and Helmholtz"), ("hyperbolic", "hyperbolic, waves and Euler")]:
    ks = [k for k in range(len(names)) if types[k] == t]
    ax.plot(layers, silent[:, ks].mean(1), color=COL[t], lw=3.5, label=lab)
ax.legend(frameon=False, fontsize=16, loc="upper left")
ax.set_ylim(0, 100); ax.set_xlim(0.5, L + 0.5); ax.set_xticks([1, 8, 16, 24, 32])
ax.set_xlabel("layer"); ax.set_ylabel("neurons silent for the PDE (%)")
save("fire_groups.png")
for t in ["elliptic", "hyperbolic"]:
    ks = [k for k in range(len(names)) if types[k] == t]
    g = silent[:, ks].mean(1)
    print(t, "start 1-4", g[:4].mean().round(1), "middle 13-20", g[12:20].mean().round(1), "end 29-32", g[28:].mean().round(1))
