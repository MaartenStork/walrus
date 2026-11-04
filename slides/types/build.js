// Builds pde_types_explained.pptx (repo root): the three PDE types, every symbol explained, built up slowly.
// Same style as the other decks.
//   ~/Documents/GitHub/poseidon/.venv/bin/python slides/types/figures.py
//   cd slides/types && NODE_PATH=/Users/maarten/node_modules node build.js
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const BAND = "232959", INK = "000000", GREY = "5A6B7B", TEAL = "13A89E", ORANGE = "E05A2B", PURPLE = "9B7FC0", CARD = "F1F5F8";
const F = (p) => path.join(__dirname, p);
const sizeOf = (p) => { const b = fs.readFileSync(p); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE";
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, fontFace: "Times New Roman", color: INK, valign: "top", margin: 0 }, o));

function band(s, y, num, title) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.174, y, w: 10.986, h: 0.996, rectRadius: 0.12, fill: { color: BAND }, line: { color: BAND } });
  if (num) s.addShape(pres.shapes.OVAL, { x: 1.576, y: y + 0.164, w: 0.67, h: 0.67, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
  if (num) T(s, num, { x: 1.576, y: y + 0.164, w: 0.67, h: 0.67, fontSize: 18, bold: true, align: "center", valign: "middle" });
  T(s, title, { x: 2.5, y, w: 9.5, h: 0.996, fontSize: 25, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
}
function base(num, head, lead, take, note) {
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  band(s, 0.465, num, head);
  if (lead) T(s, lead, { x: 1.3, y: 1.65, w: 10.7, h: 0.8, fontSize: 20, align: "center" });
  if (take) T(s, take, { x: 1.3, y: 6.45, w: 10.7, h: 0.7, fontSize: 19, bold: true, align: "center" });
  if (note) s.addNotes(note);
  return s;
}
function pic(s, file, x, y, bw, bh) { const d = sizeOf(F(file)), r = Math.min(bw / d.w, bh / d.h);
  s.addImage({ path: F(file), x: x + (bw - d.w * r) / 2, y: y + (bh - d.h * r) / 2, w: d.w * r, h: d.h * r }); }
function card(s, x, y, w, h, colour, head, body, size) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: CARD }, line: { color: colour, width: 1.5 } });
  T(s, head, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.5, fontSize: 20, bold: true, color: colour, align: "center" });
  T(s, body, { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: h - 0.95, fontSize: size || 18, align: "center" });
}
const cards3 = (s, y, h, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 3.65, y, 3.4, h, c, hd, b, size));
const cards4 = (s, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + (i % 2) * 5.6, 1.75 + Math.floor(i / 2) * 2.3, 5.1, 2.05, c, hd, b, size || 18));
function divider(num, title, sub) {
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  band(s, 3.0, num, title);
  if (sub) T(s, sub, { x: 1.3, y: 4.3, w: 10.7, h: 0.6, fontSize: 20, color: GREY, align: "center" });
  return s;
}
function plain(s, ls, y, size) {
  T(s, ls.map((l, i) => ({ text: l, options: Object.assign({ breakLine: i < ls.length - 1 }, i === 0 ? { bold: true, color: BAND } : {}) })),
    { x: 1.8, y: y || 2.2, w: 9.7, h: 4.0, fontSize: size || 24, align: "center", paraSpaceAfter: 22 });
}
function side(s, lines, x, y, w, h, colour) {
  T(s, lines.map((l, i) => ({ text: l, options: { breakLine: i < lines.length - 1 } })), { x, y, w, h, fontSize: 20, paraSpaceAfter: 18, valign: "middle", color: colour || INK });
}
const sym = (s, text, y) => T(s, text, { x: 1.3, y, w: 10.7, h: 0.5, fontSize: 16, color: GREY, align: "center" });
function table(s, rows, colW, y, size, rowH) {
  const cells = rows.map((r, i) => r.map((t, j) => ({ text: t, options: { bold: i === 0 || j === 0, color: i === 0 ? "FFFFFF" : INK,
    fill: { color: i === 0 ? BAND : (i % 2 ? CARD : "FFFFFF") } } })));
  s.addTable(cells, { x: 1.3, y, w: 10.7, colW, rowH: rowH || 0.5, fontFace: "Times New Roman", fontSize: size || 18,
    border: { type: "solid", pt: 0.5, color: "D5DBE1" }, margin: [4, 8, 4, 8], valign: "middle" });
}


// ================================================================= title
{ const s = divider("", "PDE types, explained", "Every symbol, and why no t, one t or two t's");
  s.addNotes("Elliptic, parabolic, hyperbolic, from the ground up. All pictures are made up but shaped like the real solutions; the one simulation (fade or move on) is real, a small finite-difference run."); }

{ const s = base("", "In one slide", null, null, "Everything after this unpacks these four lines.");
  plain(s, ["All three use the same building block, Δu", "Elliptic, Δu sets the answer itself", "Parabolic, Δu sets the speed", "Hyperbolic, Δu sets the acceleration"], 2.1, 24); }

// ================================================================= 1 building blocks
divider("1", "Building blocks", "The symbols, slope and curvature, and Δu");

{ const s = base("1", "The symbols", null, "Given f, find u.",
    "u can be temperature, pressure, a chemical, a velocity component. In the pictures it is temperature. f is given by the problem; u is what the PDE determines.");
  table(s, [["symbol", "what it is"],
            ["u", "the field we solve for, like temperature, one number at every place"],
            ["x, y", "place, where you are"],
            ["t", "time, when you are"],
            ["f", "the source, given, where heat comes in from outside"],
            ["∂", "partial, change one variable and keep the others fixed"]], [2.0, 8.7], 2.0, 20, 0.62); }

{ const s = base("1", "Slope and curvature", "A derivative says how u changes when you take a tiny step.",
    "In time, the same two ideas are called speed and acceleration.",
    "First derivative = slope: going up or down when you move right. Second derivative = curvature, how the slope itself changes. Negative at a peak (bending down), positive in a dip (bending up), zero on a straight line. In time: du/dt is how fast u at one point changes (speed), d2u/dt2 how fast that speed changes (acceleration).");
  pic(s, "slope.png", 0.9, 2.55, 6.4, 3.7);
  pic(s, "f_d1.png", 7.5, 2.9, 4.8, 1.0);
  pic(s, "f_dt.png", 7.5, 4.5, 4.8, 1.0); }

{ const s = base("1", "The Laplacian Δu", "Curvature in x plus curvature in y. On a grid it compares a point with its four neighbours.",
    "Δu says how much a point differs from the average of its neighbours.",
    "h = grid spacing. The grid formula is the same thing as the sum of the two second derivatives, written for a grid. (sum of 4 neighbours - 4u) = 4 x (average of neighbours - u).");
  pic(s, "f_lap.png", 6.9, 2.65, 5.2, 1.1);
  pic(s, "f_grid.png", 6.9, 4.2, 5.2, 1.1);
  pic(s, "stencil.png", 1.6, 2.5, 4.2, 3.85); }

{ const s = base("1", "Reading Δu", "A small example. Three points in a row, with values 0, 1 and 0.",
    "Keep this example. Each type treats this peak in its own way.",
    "Middle: neighbours 0 and 0, itself 1, so 0 + 0 - 2 x 1 = -2 (1D version of the grid formula, h = 1). Left: neighbours 1 (and 0 outside), itself 0, so +1.");
  pic(s, "three.png", 1.0, 2.5, 6.0, 3.85);
  side(s, ["Δu < 0, higher than its neighbours, a peak", "Δu > 0, lower, a dip", "Δu = 0, exactly the average"], 7.4, 2.6, 4.9, 3.5); }

// ================================================================= 2 elliptic
divider("2", "Elliptic", "−Δu = f, no t");

{ const s = base("2", "Elliptic", "How much higher I am than my neighbours equals how much heat comes in here.",
    "No t, so nothing changes. One steady answer for each f.",
    "Poisson. The minus sign makes it come out the natural way: where f > 0, Delta u < 0, a peak. Picture: left the source f (a small heater), right the temperature u once everything has settled, cold walls.");
  pic(s, "f_ell.png", 4.4, 2.5, 4.5, 0.95);
  pic(s, "ell_pair.png", 2.8, 3.55, 7.7, 2.8); }

{ const s = base("2", "What follows from it", null, "Change f anywhere, and u changes everywhere at once.",
    "Away from the heater Delta u = 0: every point is the mean of its neighbours. That allows no bumps or wiggles, so u is as smooth as possible. Every point is tied to its neighbours, those to theirs, so the whole field is one chain. Boundary conditions (for example u = 0 on the walls) are needed to fix the answer.");
  cards3(s, 2.3, 2.6, [[TEAL, "At the heater", "f > 0, so Δu < 0. A peak, hotter than around it."],
                       [TEAL, "Away from it", "f = 0, so every point is the average of its neighbours. As smooth as possible."],
                       [TEAL, "The edges", "The walls must be given too, like cold walls. Otherwise there is no single answer."]]); }

{ const s = base("2", "Where it comes from", "Take heat with a heater, and wait forever. In the end nothing changes anymore.",
    "Elliptic is where parabolic ends up after infinite time.",
    "Heat with a source: du/dt = Delta u + f. Steady state: du/dt = 0. Helmholtz, Delta u + k^2 u = f, is elliptic too: still no time, one answer, but the k^2 u term makes the answer wavy.");
  pic(s, "f_steady.png", 1.6, 3.1, 10.1, 1.2);
  sym(s, "Helmholtz, Δu + k²u = f, is elliptic too. No time, but a wavy answer.", 4.9); }

// ================================================================= 3 parabolic
divider("3", "Parabolic", "∂u/∂t = Δu, one t");

{ const s = base("3", "Parabolic", "How fast I change equals how different I am from my neighbours.",
    "The peak gets lower and wider. A hot spot spreads out.",
    "Three-point example, speed = Delta u. Middle: -2, goes down at speed 2. Neighbours: +1, go up at speed 1. Every point moves towards the average of its surroundings.");
  pic(s, "f_par.png", 7.6, 2.55, 4.4, 1.2);
  pic(s, "three_par.png", 1.0, 2.5, 6.2, 3.9);
  side(s, ["the peak goes down, speed 2", "the neighbours go up, speed 1"], 7.6, 4.0, 4.6, 1.9, ORANGE); }

{ const s = base("3", "Over time", null, "Sharp parts go first. It gets smoother and smoother.",
    "The field along a line at t = 0, 1, 2, 3. The total heat stays the same, it only spreads.");
  pic(s, "line_par.png", 2.3, 1.8, 8.7, 4.5); }

{ const s = base("3", "What follows from one t", null, null,
    "Influence reaches everywhere at once, but very weakly (a far point warms immediately, by a tiny amount).");
  cards4(s, [[ORANGE, "No momentum", "The speed is set by the shape right now. Once flat, it stops. It never overshoots."],
             [ORANGE, "It smooths", "Sharp features have the biggest Δu, so they vanish first."],
             [ORANGE, "One way in time", "You cannot run it backwards. Heat does not un-spread."],
             [ORANGE, "One starting condition", "Give the field at t = 0, and the rest follows."]]); }

{ const s = base("3", "Our parabolic PDEs", "D is how fast it spreads. R(u) is a reaction, chemicals being made or used up.",
    "Allen–Cahn and Gray–Scott are spreading plus a reaction.",
    "On the slides D = 1 and R = 0, plain heat.");
  pic(s, "f_pargen.png", 2.8, 3.0, 7.7, 1.3); }

// ================================================================= 4 hyperbolic
divider("4", "Hyperbolic", "∂²u/∂t² = Δu, two t's");

{ const s = base("4", "Hyperbolic", "How fast my speed changes equals how different I am from my neighbours.",
    "Δu is now a force, and each point has mass. Like a drum skin.",
    "One more time derivative. Delta u no longer sets the speed but the acceleration: Newton, m a = F. Each point of a string or drum skin is pulled towards its neighbours (the force is Delta u) and has mass, so it accelerates.");
  pic(s, "f_hyp.png", 4.4, 2.55, 4.5, 1.25);
  pic(s, "f_newton.png", 2.8, 4.3, 7.7, 1.2); }

{ const s = base("4", "The same peak", "Starting at rest. Now Δu sets the acceleration, not the speed.",
    "So the bump does not flatten in place. It moves on.",
    "The middle accelerates downwards and gains speed; the neighbours are pulled up and start moving. The middle passes its bump on to its neighbours, those pass it on further.");
  pic(s, "three_hyp.png", 1.0, 2.5, 6.2, 3.9);
  side(s, ["the middle speeds up downwards", "the neighbours are pulled up", "the bump is passed on"], 7.6, 2.6, 4.6, 3.5, PURPLE); }

{ const s = base("4", "Over time", null, "The bump splits and travels, at a fixed speed, keeping its shape.",
    "1D: the bump splits into two halves going left and right. In 2D it is a growing ring.");
  pic(s, "line_hyp.png", 2.3, 1.8, 8.7, 4.5); }

{ const s = base("4", "Fade or move on", "A real small simulation. The same bump, the height in the middle over time.",
    "Parabolic stays and fades. Hyperbolic moves away and leaves nothing behind.",
    "41 points on a line, finite differences, same starting bump, at rest. Heat: the middle slowly drops, the bump is still there, only wider. Wave: the middle empties quickly, because the two halves have travelled away.");
  pic(s, "middle.png", 2.3, 2.5, 8.7, 3.85); }

{ const s = base("4", "What follows from two t's", null, null,
    "General form d2u/dt2 = c^2 Delta u, c = wave speed (1 here). Euler (compressible gas) is written as first-order equations for density, momentum and energy, but behaves the same: finite speeds, sharp fronts. So it counts as hyperbolic.");
  cards4(s, [[PURPLE, "Fixed speed", "It travels at a set speed c. A point it has not reached yet does not move."],
             [PURPLE, "Stays sharp", "Nothing smooths it. That is why Euler makes shocks."],
             [PURPLE, "Back and forth", "Energy swaps between motion and shape, so it can swing and bounce."],
             [PURPLE, "Two starting conditions", "Give the shape and the speed at t = 0. Plucked or hit."]]); }

// ================================================================= 5 names and mixed
divider("5", "Names, and mixed", "Why ellipse, parabola, hyperbola, and Navier–Stokes");

{ const s = base("5", "Why those names", "Replace each derivative by a letter, ∂/∂x by X and ∂/∂t by T, and keep the highest ones.",
    "No t, one t, two t's. The determinant rule checks exactly these signs.",
    "Elliptic: X^2 + Y^2, a circle. Parabolic: T = X^2 + Y^2, one side squared and one not. Hyperbolic: T^2 = X^2 + Y^2, a minus sign between squares. The formal rule: the sign of the determinant of the second-order coefficients (b^2 - 4ac).");
  pic(s, "f_conic.png", 1.8, 2.6, 9.7, 0.9);
  pic(s, "1_conics.png", 2.3, 3.7, 8.7, 2.6); }

{ const s = base("5", "Mixed, Navier–Stokes", "u is now the velocity, p the pressure, ν the viscosity.",
    "So shear flow and Rayleigh–Bénard are mixed.",
    "nu Delta u with du/dt: friction smooths the flow (parabolic). (u . grad) u: the flow carries itself along (travelling, hyperbolic-like). div u = 0: no squeezing; this forces the pressure to solve a Poisson equation at every moment, so it adjusts everywhere at once (elliptic).");
  pic(s, "f_ns.png", 1.8, 2.45, 9.7, 1.0);
  cards3(s, 3.75, 2.45, [[ORANGE, "Parabolic part", "ν Δu, friction smooths the flow"],
                         [PURPLE, "Travelling part", "(u·∇)u, the flow carries itself along"],
                         [TEAL, "Elliptic part", "∇·u = 0, the pressure adjusts everywhere at once"]]); }

{ const s = base("", "In short", null, null, "");
  plain(s, ["No t, one steady answer", "One t, it spreads and smooths", "Two t's, it travels and stays sharp"], 2.4, 26); }

pres.writeFile({ fileName: path.join(__dirname, "../../pde_types_explained.pptx") }).then((f) => console.log("wrote", f));
