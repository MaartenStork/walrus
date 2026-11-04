"""Formulas for walrus_plan_deck.pptx. The other PNGs here are copies from poseidon/playground/research_plan/slides.
   ~/Documents/GitHub/poseidon/.venv/bin/python slides/plan/figures.py
"""
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
plt.rcParams.update({"mathtext.fontset": "cm"})


def eq(name, tex, size=30):
    fig = plt.figure(figsize=(12, 1.4))
    fig.text(0.5, 0.5, tex, ha="center", va="center", fontsize=size, color="#232959")
    plt.savefig(os.path.join(HERE, name), dpi=220, bbox_inches="tight", pad_inches=0.04, transparent=True)
    plt.close("all")


eq("f_C.png", r"$C = \frac{\mathrm{how\ far\ off\ the\ law,\ with\ shuffled\ errors}}{\mathrm{how\ far\ off\ the\ law,\ with\ the\ real\ readouts}}$", 30)
eq("f_energy.png", r"$E = \frac{p}{\gamma - 1} + \frac{1}{2}\,\rho\,|u|^2$", 34)
eq("f_phi.png", r"$\varphi(d,e) = \frac{\|U_d^{\top}U_e\|_F^2}{\min(k_d,\,k_e)}$", 32)
print("ok")
