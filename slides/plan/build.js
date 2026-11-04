// Builds walrus_plan_deck.pptx (repo root): the plan of walrus_plan.pdf, for the supervisors, built up slowly.
// Style and helpers as poseidon/playground/research_plan/slides/squeeze/build.js. Result figures (joint2) are copies from poseidon.
//   ~/Documents/GitHub/poseidon/.venv/bin/python slides/plan/figures.py
//   cd slides/plan && NODE_PATH=/Users/maarten/node_modules node build.js
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
  T(s, body, { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: h - 0.95, fontSize: size || 19, align: "center" });
}
const cards3 = (s, y, h, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 3.65, y, 3.4, h, c, hd, b, size));
const cards2 = (s, y, h, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 5.6, y, 5.1, h, c, hd, b, size));
const cards4 = (s, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + (i % 2) * 5.6, 1.75 + Math.floor(i / 2) * 2.3, 5.1, 2.05, c, hd, b, size || 18));
function table(s, rows, colW, y, size, rowH) {
  const cells = rows.map((r, i) => r.map((t, j) => ({ text: t, options: { bold: i === 0 || j === 0, color: i === 0 ? "FFFFFF" : INK,
    fill: { color: i === 0 ? BAND : (i % 2 ? CARD : "FFFFFF") } } })));
  s.addTable(cells, { x: 1.3, y, w: 10.7, colW, rowH: rowH || 0.5, fontFace: "Times New Roman", fontSize: size || 16,
    border: { type: "solid", pt: 0.5, color: "D5DBE1" }, margin: [4, 8, 4, 8], valign: "middle" });
}
function divider(num, title, sub) {
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  band(s, 3.0, num, title);
  if (sub) T(s, sub, { x: 1.3, y: 4.3, w: 10.7, h: 0.6, fontSize: 20, color: GREY, align: "center" });
  return s;
}
function plain(s, ls, y, size) {      // a few short lines of text, centred, first one bold
  T(s, ls.map((l, i) => ({ text: l, options: Object.assign({ breakLine: i < ls.length - 1 }, i === 0 ? { bold: true, color: BAND } : {}) })),
    { x: 1.8, y: y || 2.2, w: 9.7, h: 4.0, fontSize: size || 24, align: "center", paraSpaceAfter: 22 });
}
const sym = (s, text, y) => T(s, text, { x: 1.3, y, w: 10.7, h: 0.5, fontSize: 16, color: GREY, align: "center" });
function box(s, x, y, w, h, text, colour, size, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || CARD }, line: { color: colour || GREY, width: 1.5 } });
  T(s, text, { x: x + 0.08, y, w: w - 0.16, h, fontSize: size || 17, align: "center", valign: "middle" });
}
// only arrows going right or down (PowerPoint and Keynote disagree on flipped lines)
function arrow(s, x, y, w, h, colour) {
  if ((h || 0) < 0 || w < 0) throw new Error("arrow must go right or down");
  s.addShape(pres.shapes.LINE, { x, y, w, h: h || 0, line: { color: colour || GREY, width: 2, endArrowType: "triangle" } });
}
const small = (s, text, x, y, w, colour) => T(s, text, { x, y, w, h: 0.6, fontSize: 14, color: colour || GREY, align: "center" });
function chain(s, y, h, items, size) {
  const n = items.length, gap = 0.35, w = (10.7 - gap * (n - 1)) / n;
  items.forEach(([text, colour, under], i) => {
    const x = 1.3 + i * (w + gap);
    box(s, x, y, w, h, text, colour, size);
    if (under) small(s, under, x - 0.1, y + h + 0.12, w + 0.2, colour === ORANGE ? ORANGE : GREY);
    if (i < n - 1) arrow(s, x + w + 0.04, y + h / 2, gap - 0.08);
  });
}
function side(s, lines, x, y, w, h) {
  T(s, lines.map((l, i) => ({ text: l, options: { breakLine: i < lines.length - 1 } })), { x, y, w, h, fontSize: 20, paraSpaceAfter: 18, valign: "middle" });
}


// ================================================================= title
{ const s = divider("", "Looking inside Walrus", "The plan. Is it shared, and is it physics?");
  s.addNotes("The plan of walrus_plan.pdf, as slides. Built up slowly. joint2 results are real; everything about Walrus is still to do (Walrus is being set up on DAIC now)."); }

{ const s = base("", "In one slide", null, null,
    "Main question from our meeting. Part A uses the four tests built on joint2. Part B only starts where Part A finds sharing.");
  plain(s, ["Do different PDEs share the inside of a physics foundation model?",
            "Part A, is it shared? Look inside Walrus and remove parts of it",
            "Part B, is it physics? Only where Part A finds sharing",
            "Our own model gave a first answer. Now a real foundation model"], 2.1, 23); }

// ================================================================= 1 the question
divider("1", "The question", "Why would one big model for all physics make sense?");

{ const s = base("1", "Foundation models for PDEs work", "One large model, trained once on many kinds of physics, learns new problems from far fewer examples.",
    "Nobody knows why. The model never sees an equation, only fields on a grid.",
    "Poseidon (Herde et al. 2024), Multiple Physics Pretraining (McCabe et al. 2023), Walrus (McCabe et al. 2025). All show that pretraining on many systems helps on new ones. None shows what is inside that makes it work.");
  cards3(s, 2.9, 2.2, [[TEAL, "Poseidon", "trained on fluid flows, then fine-tuned to new PDEs"],
                        [ORANGE, "MPP", "many 2D systems at once, one model"],
                        [PURPLE, "Walrus", "19 systems in 2D and 3D, 1.3 billion parameters"]]); }

{ const s = base("1", "Two possible answers", "Is there something inside that holds for many equations, or does every equation keep to its own corner?",
    "Story 1 justifies one big model. Story 2 makes it mostly a convenient package.",
    "Cartoon, not data. Each cloud = the inside activity of one PDE. Story 1, shared magic: PDEs that behave alike (same textbook type) sit together, there is a common way to handle transport, diffusion, waves. Story 2, several models in one box: every PDE keeps to its own part, only generic things are shared (reading a field in, drawing one out, keeping numbers in range).");
  pic(s, "two_stories.png", 1.3, 2.55, 10.7, 3.8); }

{ const s = base("1", "Why it matters", null, "We do not test which design predicts better. We look inside.",
    "If the inside is shared, one model for all physics is well justified. If it is several models in one box, separate smaller models per type of physics make as much sense.");
  cards3(s, 2.2, 3.0, [[BAND, "One big model?", "Shared inside, one model is justified. Separate inside, a few smaller models would do as well."],
                       [TEAL, "Trust", "A model with one consistent picture of physics should behave sensibly on new settings. Separate shortcuts can fail without warning."],
                       [ORANGE, "Transfer", "Knowing what is shared tells us what kind of pretraining helps, and why."]], 18); }

{ const s = base("1", "Shared is not yet physics", "A shared part can be generic, like smoothing or taking differences. So the question has two parts, in this order.",
    "If nothing is shared, that is the answer too. Story 2, and an interesting one.",
    "Part A decides whether and where there is sharing. Part B only looks there. If Part A finds every PDE in its own corner, Part B shrinks to one system as a smaller follow-up.");
  box(s, 1.8, 2.85, 3.6, 1.3, "Part A\nis it shared?", BAND, 20);
  arrow(s, 5.45, 3.5, 2.1);
  small(s, "shared somewhere", 5.4, 3.0, 2.2);
  box(s, 7.6, 2.85, 3.9, 1.3, "Part B\nis it physics?", TEAL, 20);
  arrow(s, 3.6, 4.2, 0, 0.75);
  small(s, "nowhere", 3.75, 4.3, 1.4);
  box(s, 1.8, 5.0, 3.6, 1.05, "story 2\nseveral models in one box", GREY, 18); }

// ================================================================= 2 joint2
divider("2", "What we know from joint2", "Our own small model, already tested");

{ const s = base("2", "joint2", "Poseidon-T design, 21 million parameters, trained by us from scratch on 8 PDEs.",
    "It predicts all eight well, with test errors from 0.9% to 11.8%.",
    "Poseidon's recipe, 40 epochs, 8 datasets of Poseidon's collection. Test error one step ahead: Allen-Cahn 0.9, Poisson 1.3, wave L 2.6, Helmholtz 3.0, wave G 3.5, Euler G 5.6, Euler R 7.5, Navier-Stokes 11.8 (%).");
  table(s, [["type", "how information travels", "PDEs in joint2"],
            ["elliptic", "a steady state, every point depends on all others", "Poisson, Helmholtz"],
            ["parabolic", "spreads and smooths over time", "Allen–Cahn"],
            ["hyperbolic", "travels at finite speed, stays sharp", "wave G, wave L, Euler G, Euler R"],
            ["mixed", "a bit of both", "Navier–Stokes"]], [2.2, 4.8, 3.7], 2.75, 18, 0.6); }

{ const s = base("2", "Four ways to look inside", null, "Each test also has a control, random weights or random neurons.",
    "Neurons = outputs of the MLP inside each layer. Directions = principal components of a PDE's activations per layer (90% of the variance), overlap phi between two PDEs. Paths = top 10% of neurons by activation times gradient. Removal = take a PDE's directions out (or delete its neurons) while the model runs.");
  cards4(s, [[TEAL, "Neurons", "Which neurons does each PDE use?"], [ORANGE, "Directions", "Which mixes of neurons does each PDE vary along?"],
             [PURPLE, "Paths", "Which neurons does each PDE's prediction depend on?"], [BAND, "Removal", "Take a part out. Whose error goes up?"]], 19); }

{ const s = base("2", "Neurons say shared", "Every PDE uses almost all neurons. At most 0.8% of a layer is used by one type only.",
    "Counted neuron by neuron, everything is shared. But neurons can be used in different mixes.",
    "Used = mean |activation| above 1% of the layer's average. This is why neurons alone mislead, and why directions and paths are the main tests.");
  plain(s, ["almost all neurons used by every PDE", "used by one type only, at most 0.8%"], 3.0, 26); }

{ const s = base("2", "Directions split in the middle", "Overlap of the PDEs' directions, layer by layer. 1 is the same directions, 0 is at right angles.",
    "Start and end overlap. The middle, where the solving happens, much less.",
    "Real results, joint2 epoch 40. phi averaged over all 28 pairs of PDEs. Middle layers 13-20: 0.14 to 0.22. Start and end about 0.6.");
  pic(s, "f_phi.png", 7.6, 2.75, 4.3, 0.9);
  pic(s, "c1_overlap.png", 1.3, 2.5, 6.0, 3.85);
  T(s, "U_d holds PDE d's directions as columns, k_d of them", { x: 7.6, y: 3.8, w: 4.3, h: 0.8, fontSize: 15, color: GREY, align: "center" }); }

{ const s = base("2", "Grouped by equation, not by type", "In the middle, two datasets of the same equation overlap. Two equations of the same type do not.",
    "Wave and Euler are both hyperbolic, but overlap no more than elliptic and hyperbolic.",
    "Real results, joint2. Middle 13-20: same equation 0.49, same type other equation 0.12, different type 0.15.");
  pic(s, "groups.png", 1.8, 2.5, 9.7, 3.85); }

{ const s = base("2", "Removal agrees", null, "The model needs its own directions, mostly separately per equation.",
    "Real results, layers 13-20. Row = whose directions are removed, column = whose error rises (% of normal). Read per column. Orange boxes = own. Random directions of the same number: 0-12% on the own PDE (Euler up to 31%). Allen-Cahn, waves and NS barely use the middle: they go around it through Poseidon's skips.");
  pic(s, "ladder_13-20.png", 0.9, 1.6, 6.3, 4.8);
  side(s, ["Poisson, Helmholtz and Euler break most from their own directions.", "The two Euler sets hurt each other.",
           "Allen–Cahn, the waves and NS barely notice. They go around the middle."], 7.6, 2.2, 4.8, 3.8); }

{ const s = base("2", "So, in joint2", null, null, "Paths agree too: two PDEs share about 20% of their top neurons (unrelated lists 10%, random weights 44%), only the two waves 71%. Pruning too.");
  plain(s, ["The same neurons, used mostly separately per equation", "Sharing follows the equation, not the PDE type", "Story 2, for a small model"], 2.4, 26); }

{ const s = base("2", "Why that is not the end", null, "So now a real foundation model, and a small model we can squeeze.",
    "Room: all 8 PDEs together use 316-761 of the 1,536 directions in a middle layer.");
  cards3(s, 2.2, 3.0, [[BAND, "Small model", "21 million parameters, 8 PDEs. Real foundation models are 60 times bigger. Sharing could appear only at that scale."],
                       [TEAL, "Room to spare", "All 8 PDEs together use at most half of a middle layer. Keeping them apart cost nothing."],
                       [ORANGE, "The U shape", "Skips carry information around the middle. Some PDEs barely needed it."]], 18); }

// ================================================================= 3 Walrus
divider("3", "Walrus", "The main model");

{ const s = base("3", "Walrus in one picture", "Released in 2025 by Polymathic AI. 1.3 billion parameters, trained on 19 systems.",
    "40 blocks of the same shape, and nothing goes around them.",
    "Given the last 6 snapshots it predicts the change to the next one. The encoder shrinks each field to 32 x 32 patches of 1,408 numbers, 40 blocks work on that grid, the decoder gives back a change per field. Example sizes for shear flow. The separate deck walrus_inside.pptx goes through the inside step by step.");
  pic(s, "edp.png", 1.3, 2.55, 10.7, 3.75); }

{ const s = base("3", "Why Walrus", null, null,
    "Weights and code are public (github PolymathicAI/walrus, huggingface polymathic-ai/walrus). Trained on 96 H100 GPUs, so we cannot retrain it. Looking and removing only needs one GPU.");
  cards4(s, [[BAND, "A real foundation model", "Large, many kinds of physics, among the best on its benchmarks."],
             [TEAL, "Easy to look inside", "No U, no skips. Every block can be compared with every other, removal cannot be dodged."],
             [ORANGE, "Released and studied", "Two papers looked inside it, so we can compare."],
             [PURPLE, "We only need to run it", "Recording, removal, readouts all use the frozen model. One GPU is enough."]]); }

{ const s = base("3", "Eight systems", null, "Pairs of the same equation, so we can tell same equation from same type.",
    "All 8 are in Walrus's training data (Walrus Table 6). 2D only, to keep things comparable. Walrus has no steady elliptic system like Poisson; Helmholtz staircase comes closest. Elliptic PDEs can come in later by fine-tuning.");
  table(s, [["system (The Well)", "equation", "type", "pair"],
            ["acoustics, inclusions", "wave equation", "hyperbolic", "same equation"],
            ["acoustics, discontinuous", "wave equation", "hyperbolic", "same equation"],
            ["Euler quadrants, periodic", "compressible Euler", "hyperbolic", "same equation"],
            ["Euler quadrants, open", "compressible Euler", "hyperbolic", "same equation"],
            ["Gray–Scott", "reaction and diffusion", "parabolic", ""],
            ["shear flow", "Navier–Stokes", "mixed", "same family"],
            ["Rayleigh–Bénard", "Navier–Stokes plus heat", "mixed", "same family"],
            ["Helmholtz staircase", "Helmholtz", "elliptic in space", "borderline"]], [3.4, 3.1, 2.2, 2.0], 1.75, 17, 0.5); }

{ const s = base("3", "Two papers looked inside Walrus", null, "Nobody has measured how much different PDEs share, or whether Walrus needs it.",
    "Physics Steering, Fear et al., NeurIPS 2025 (arXiv 2511.20798). Sparse probes and murky physics, Rosenfeld and Sonnewald, ICLR 2026 workshop (arXiv 2606.11657). Both read in full.");
  table(s, [["study", "what they did", "what is left open"],
            ["Physics Steering", "A vortex direction from shear flow, pushed into the last block, also makes swirls in Euler and Gray–Scott", "judged by eye, no random control, one block, a few concepts"],
            ["Sparse probes", "A sparse autoencoder on block 20, shear flow only. Features recur at first, but do not map cleanly onto physics", "one system, no control, no test of use"]],
    [2.4, 4.9, 3.4], 2.0, 17, 1.2); }

// ================================================================= 4 Part A
divider("4", "Part A, is it shared?", "The joint2 tests, now on Walrus");

{ const s = base("4", "Part A, step by step", "From cheap to expensive. Each step reuses a test we built and checked on joint2.",
    "Plus a lab model next to it, for what Walrus cannot tell us.",
    "A0 get Walrus running and check it. A1 record the inside. A2 neurons. A3 directions. A4 paths. A5 removal and pruning. A6 the lab model, in parallel.");
  chain(s, 3.0, 1.2, [["A0\nrun, check", GREY, "reproduce its errors"], ["A1\nrecord", BAND, "every block"], ["A2\nneurons", TEAL, "who uses what"],
                      ["A3\ndirections", TEAL, "overlap, by pair"], ["A4\npaths", PURPLE, "what it depends on"], ["A5\nremoval", ORANGE, "does it need it"]], 18); }

{ const s = base("4", "A0, get it running and check it", "Nothing counts until we reproduce Walrus's own errors.",
    "If we cannot reproduce them, something in our setup is wrong.",
    "Being set up on DAIC now. Check against Walrus Table 1, median one-step VRMSE per system. Typical traps: normalisation, time step, field order. Shear flow test data is the corrected v2.0 (v1.0 had test runs copied from training).");
  cards3(s, 2.9, 2.4, [[GREY, "Install", "Code and weights on DAIC, a few dozen test runs per system."],
                        [BAND, "Reproduce", "One-step errors on our 8 systems, against the paper's numbers."],
                        [TEAL, "Control", "The same model with random weights, for every test after this."]]); }

{ const s = base("4", "A1, record the inside", "Run test examples through the frozen model and keep the 2,816 neurons of every block.",
    "The same recording as for joint2, now in all 40 blocks, 8 systems, and the random-weight copy.",
    "Neurons = the MLP's 2,816 numbers per patch after its gate. Newest snapshot only. Per example, each neuron's average over all 1,024 patches plus a sample of 64 patches. Also the block output at a few blocks, to compare with Physics Steering. Note: each system enters through the input weights of its own field names, so early blocks can tell systems apart by format alone. What counts is deeper in, and against random weights.");
  const n = 40, x0 = 1.3, W = 10.7, gap = 0.04, c = (W - gap * (n - 1)) / n, y = 3.6;
  for (let i = 0; i < n; i++) s.addShape(pres.shapes.RECTANGLE, { x: x0 + i * (c + gap), y, w: c, h: 0.8, fill: { color: "DDF2F0" }, line: { color: TEAL, width: 0.75 } });
  T(s, "block 1", { x: x0, y: y + 0.88, w: 1.0, h: 0.4, fontSize: 14, color: GREY });
  T(s, "block 40", { x: x0 + W - 1.1, y: y + 0.88, w: 1.1, h: 0.4, fontSize: 14, color: GREY, align: "right" });
  sym(s, "per block, 2,816 neurons for each of the 1,024 patches", 2.9); }

{ const s = base("4", "A2 and A3, neurons and directions", "Per block, which neurons each system uses, and which directions it varies along.",
    "Three pictures, from block 1 to block 40. Where is Walrus shared, and where split?",
    "Like joint2. Neurons: expected almost all used by all. Directions: overlap phi per block averaged over pairs; then by kind of pair (next slide); then room, the directions all systems need together against the 2,816 available. Overlap in a trained block must differ from the random-weight block to mean anything.");
  cards3(s, 2.9, 2.2, [[TEAL, "Overlap per block", "averaged over all pairs, like the joint2 curve"],
                        [ORANGE, "By kind of pair", "same equation, same type, different type"],
                        [PURPLE, "Room", "directions all systems need, against 2,816"]]); }

{ const s = base("4", "Kinds of pairs", "We chose the 8 systems so every kind of pair is there.",
    "If same type sits clearly above different type, the textbook types exist inside.",
    "The direct test of story 1 versus story 2. In joint2: same equation 0.49, same type other equation 0.12, different type 0.15.");
  table(s, [["kind of pair", "example in our 8"], ["same equation", "acoustics with acoustics, Euler with Euler"], ["same family", "shear flow with Rayleigh–Bénard"],
            ["same type, other equation", "acoustics with Euler"], ["different type", "Gray–Scott with Euler"]], [4.0, 6.7], 2.75, 19, 0.62); }

{ const s = base("4", "A4 and A5, does Walrus need it?", "Remove a system's directions, or delete its top neurons, while Walrus runs. Then measure every system's error.",
    "Walrus has no skips around the middle, so a removal cannot be dodged.",
    "This is joint2's matrix, to show how it is read: row = removed, column = whose error rises, read per column, own on the diagonal. Controls: random directions, random neurons of the same number. Paths: importance = activation x gradient, top 10% per system. Pruning: delete least important first, 25-90%. Both directions (keeps each neuron's average) and deleting (sets to 0) are reported, they can differ.");
  pic(s, "ladder_13-20.png", 0.9, 2.45, 6.3, 3.95);
  side(s, ["Read per column, whose error rises.", "Own part on the diagonal.", "Always against random parts of the same size."], 7.6, 2.7, 4.8, 3.3); }

{ const s = base("4", "A6, a lab model we can squeeze", "Walrus cannot be retrained. A small model can. Does it share when it has to?",
    "Together needs the sum, they are separate. Together fits in the bigger one, they share.",
    "Left, real joint2 numbers: all 8 PDEs use 316-761 of 1,536 directions per middle layer. Right, made-up numbers, how the squeeze is read. Same design (Poseidon-T), only fewer MLP neurons (1,536, 384, 96, 24). System A alone, B alone, A and B together. First pair Poisson and Euler. Then the direction test on each squeezed model: does overlap rise as room shrinks?");
  pic(s, "room.png", 1.0, 2.5, 5.6, 3.85);
  pic(s, "lab_sizes.png", 6.8, 2.5, 5.6, 3.85); }

{ const s = base("4", "What Part A can give", null, "Every row is a finding.",
    "joint2 showed story 2, so story 1 in Walrus would be the more surprising result. Story 2 again shows it is not a small-model accident.");
  table(s, [["if we see", "it means"],
            ["overlap between types deep in Walrus, shared paths, removals that hurt several types", "shared magic, story 1. On to Part B, in those blocks"],
            ["overlap within a type clearly above between types", "the textbook types exist inside"],
            ["sharing only within an equation, as in joint2", "several models in one box, now for a large model"],
            ["shared in some blocks, split in others", "a map of where Walrus shares"],
            ["lab, together fits in the bigger one", "PDEs can share, separation is a luxury of room"]], [6.0, 4.7], 1.75, 16, 0.72); }

// ================================================================= 5 Part B
divider("5", "Part B, is it physics?", "Only where Part A finds sharing");

{ const s = base("5", "Three properties, in this order", "Each one can stop the line.",
    "Others tested readable and used, one quantity at a time. Coherent is new.",
    "Liao and Cao 2026 found energy readable but not used in Poseidon. Physics Steering showed used, by eye, for a few concepts.");
  cards3(s, 2.7, 2.6, [[TEAL, "1. Readable", "A simple formula can read physical quantities out of the shared part."],
                       [ORANGE, "2. Coherent", "The read-out quantities agree with each other, the way the laws of physics say."],
                       [PURPLE, "3. Used", "Changing them inside changes the prediction the way physics says."]]); }

{ const s = base("5", "Readable", "A weighted sum of a block's activations, trained to read a quantity at every patch.",
    "If one direction reads kinetic energy in three systems, Walrus has one shared idea of it.",
    "Linear readout (ridge). Train on some simulation runs, test on others. A weighted sum cannot multiply, so a quantity that needs multiplying fields can only be read if the model computed it. Candidates: kinetic energy, total energy, Mach number (Euler); shear |grad u|^2 (shear flow); heat carried up w times b (Rayleigh-Benard); reaction rate A B^2 (Gray-Scott). Controls: the input itself, random weights, every block.");
  cards2(s, 2.9, 2.5, [[TEAL, "Only hard quantities", "Ones that need multiplying fields, like kinetic energy, half density times speed squared. A weighted sum cannot do that by itself."],
                        [ORANGE, "One readout, many systems", "Train the kinetic energy readout on Euler. Test it unchanged on shear flow and Rayleigh–Bénard."]], 18); }

{ const s = base("5", "Coherent", "Two models can read everything equally well. Do their errors hang together?",
    "Shortcuts give unrelated errors. One picture of the world gives errors that fit together.",
    "Sketch. Each dot = one example, error of readout 1 against readout 2. Left: the errors go together. Right: the same errors paired with random other examples, the link is gone. A model with one picture of the world is wrong in one consistent way, in which the laws still hold.");
  pic(s, "shuffle.png", 1.8, 2.5, 9.7, 3.85); }

{ const s = base("5", "The coherence score", "Put the readouts into a law of physics and see how far off it is. Then the same with the errors shuffled.",
    "C near 1, no shared picture. C much bigger than 1, the errors hang together.",
    "Fixed before we measure. Two laws to start. Energy in a gas: read out E and kinetic energy separately, does the difference match the pressure term? No derivatives. Heat budget of a slab in Rayleigh-Benard: heat in a band changes only through its edges; slopes are moved onto a smooth bump we draw ourselves. The comparison that counts is trained against random-weight Walrus.");
  pic(s, "f_C.png", 1.8, 2.55, 9.7, 1.1);
  cards2(s, 3.95, 2.25, [[ORANGE, "Energy in a gas", " "], [TEAL, "Heat in a slab", "the heat in a band changes only through its top and bottom"]], 17);
  pic(s, "f_energy.png", 1.8, 4.8, 4.4, 1.0); }

{ const s = base("5", "Used", "Push the activations along a readout's direction while Walrus runs. Does the prediction follow physics?",
    "And the reverse. Take the direction out, does the prediction lose exactly that physics?",
    "As in Physics Steering, but measured, not by eye, and with a random direction of the same size as control. Example: more heat carried up should cool the lower slab and warm the upper one faster. Also: build a vortex direction in shear flow and the same contrast in Euler and Rayleigh-Benard, and compare the directions against random ones.");
  chain(s, 3.0, 1.2, [["readout direction", TEAL, "from step 1"], ["push the activations", ORANGE, "while Walrus runs"],
                      ["the prediction changes", BAND, ""], ["check against physics", PURPLE, "and against a random push"]], 18); }

{ const s = base("5", "What Part B can give", null, "Every row is again a finding.",
    "Liao and Cao found the third row for energy in Poseidon.");
  table(s, [["if we see", "it means"],
            ["readable, coherent and used, one readout across systems", "a shared picture of the physics, and Walrus relies on it"],
            ["readable, but errors do not hang together", "separate shortcuts per quantity"],
            ["readable and coherent, but not used", "the picture is there, predictions run on something else"],
            ["not readable", "not in there, at least not in a simple form"]], [5.6, 5.1], 2.0, 17, 0.75); }

// ================================================================= 6 order
divider("6", "Order and risks", "From cheap to expensive");

{ const s = base("6", "Order", null, "Steps 2 to 6 can be a first paper on their own. Part B builds on it.",
    "Optional later: elliptic PDEs into Walrus (look only, then fine-tune), and a mini-Walrus lab model if Walrus and joint2 disagree.");
  table(s, [["step", "what", "status"],
            ["1", "read the two Walrus papers", "done"],
            ["2", "Walrus on DAIC, reproduce its errors, random copy", "now"],
            ["3", "record the inside, neurons, directions", ""],
            ["4", "paths, removal, pruning", ""],
            ["5", "lab squeeze, in parallel", ""],
            ["6", "decision point with you", ""],
            ["7 to 9", "Part B, readable, coherent, used", ""]], [1.4, 7.3, 2.0], 1.75, 18, 0.55); }

{ const s = base("6", "Risks, and what we do", null, null,
    "Input format: in Walrus each field name has its own input weights, shared by systems with the same fields (pressure, velocity). So early blocks are partly separate by format alone. Superposition: one neuron, many meanings, so directions and paths are the main tests; a sparse autoencoder is a possible extra.");
  table(s, [["risk", "what we do"],
            ["getting Walrus to run correctly takes time", "nothing counts until we reproduce its errors"],
            ["the input format separates systems on its own", "judge deeper in, and against random weights"],
            ["one neuron, many meanings", "directions and paths are the main tests"],
            ["no steady elliptic system", "test types on the others, add elliptic later"],
            ["lab model and Walrus differ in design", "move to a mini-Walrus if they disagree"],
            ["the answer is separate again", "that is story 2 for a large model, a result"]], [5.3, 5.4], 1.75, 17, 0.6); }

{ const s = base("", "In one line", null, null, "Next: Walrus running on DAIC and the sanity check, then the recording script.");
  plain(s, ["Part A says whether physics foundation models are one model or several in a box",
            "Part B says, where they are one, whether what holds them together is physics",
            "Next, Walrus running on DAIC and checked"], 2.3, 22); }

pres.writeFile({ fileName: path.join(__dirname, "../../walrus_plan_deck.pptx") }).then((f) => console.log("wrote", f));
