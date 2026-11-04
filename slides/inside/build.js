// Builds walrus_inside.pptx (repo root): what Walrus looks like inside, and where we will record.
// Same style and helpers as poseidon/playground/research_plan/slides/squeeze/build.js.
//   ~/Documents/GitHub/poseidon/.venv/bin/python slides/inside/figures.py
//   cd slides/inside && NODE_PATH=/Users/maarten/node_modules node build.js
// Facts from the Walrus paper (arXiv 2511.15684, Table 3, App. B) and the code in this repo.
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
  T(s, body, { x: x + 0.25, y: y + 0.85, w: w - 0.5, h: h - 1.0, fontSize: size || 19, align: "center" });
}
function cards2b(s) {
  card(s, 7.0, 2.6, 5.0, 1.6, GREY, "gate −3, value 0.5", "SiLU = −0.14, a = −0.07, nearly off", 18);
  card(s, 7.0, 4.5, 5.0, 1.6, ORANGE, "gate 2, value 0.5", "SiLU = 1.76, a = 0.88, on", 18);
}
function table2(s, rows, x, y, w) {
  const cells = rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, color: i === 0 ? "FFFFFF" : INK,
    fill: { color: i === 0 ? BAND : (i % 2 ? CARD : "FFFFFF") } } })));
  s.addTable(cells, { x, y, w, colW: [1.4, (w - 1.4) / 2, (w - 1.4) / 2], rowH: 0.45, fontFace: "Times New Roman", fontSize: 16,
    border: { type: "solid", pt: 0.5, color: "D5DBE1" }, margin: [3, 6, 3, 6], valign: "middle", align: "center" });
}
function side(s, lines, x, y, w, h) {
  T(s, lines.map((l, i) => ({ text: l, options: { breakLine: i < lines.length - 1 } })), { x, y, w, h, fontSize: 20, paraSpaceAfter: 18, valign: "middle" });
}
const cards3 = (s, y, h, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 3.65, y, 3.4, h, c, hd, b, size));
const cards2 = (s, y, h, items) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 5.6, y, 5.1, h, c, hd, b));
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
// a rounded box with centred text
function box(s, x, y, w, h, text, colour, size, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || CARD }, line: { color: colour || GREY, width: 1.5 } });
  T(s, text, { x: x + 0.08, y, w: w - 0.16, h, fontSize: size || 17, align: "center", valign: "middle" });
}
// Only straight arrows going right or down: PowerPoint and Keynote disagree on flipped (upward) lines.
function arrow(s, x, y, w, h, colour) {
  if ((h || 0) < 0 || w < 0) throw new Error("arrow must go right or down");
  s.addShape(pres.shapes.LINE, { x, y, w, h: h || 0, line: { color: colour || GREY, width: 2, endArrowType: "triangle" } });
}
const seg = (s, x, y, w, h) => s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color: GREY, width: 2 } });
// one line splits into several boxes (fork) or several boxes merge into one (join), with straight lines only
function fork(s, x, y0, ys, w) {
  const xm = x + w / 2, all = [y0, ...ys], lo = Math.min(...all), hi = Math.max(...all);
  seg(s, x, y0, w / 2, 0); seg(s, xm, lo, 0, hi - lo); ys.forEach((y) => arrow(s, xm, y, w / 2));
}
function join(s, x, ys, y1, w) {
  const xm = x + w / 2, all = [y1, ...ys], lo = Math.min(...all), hi = Math.max(...all);
  ys.forEach((y) => seg(s, x, y, w / 2, 0)); seg(s, xm, lo, 0, hi - lo); arrow(s, xm, y1, w / 2);
}
// a vertical arrow pointing up, drawn top to bottom with the head at the start
const upArrow = (s, x, yTop, yBottom, colour) => s.addShape(pres.shapes.LINE, { x, y: yTop, w: 0, h: yBottom - yTop,
  line: { color: colour || GREY, width: 2, beginArrowType: "triangle" } });
const line = (s, x, y, w, h, colour, dash) => s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color: colour || GREY, width: 1.5, dashType: dash || "solid" } });
const small = (s, text, x, y, w, colour) => T(s, text, { x, y, w, h: 0.6, fontSize: 14, color: colour || GREY, align: "center" });
// a row of boxes joined by arrows, all the same width
function chain(s, y, h, items, size) {
  const n = items.length, gap = 0.4, w = (10.7 - gap * (n - 1)) / n;
  items.forEach(([text, colour, under], i) => {
    const x = 1.3 + i * (w + gap);
    box(s, x, y, w, h, text, colour, size);
    if (under) small(s, under, x - 0.1, y + h + 0.12, w + 0.2, colour === ORANGE ? ORANGE : GREY);
    if (i < n - 1) arrow(s, x + w + 0.05, y + h / 2, gap - 0.1);
  });
  return w;
}
function stat(s, x, y, w, big, label, colour) {
  T(s, big, { x, y, w, h: 0.9, fontSize: 44, bold: true, color: colour || BAND, align: "center", valign: "middle" });
  T(s, label, { x, y: y + 0.9, w, h: 0.7, fontSize: 17, color: GREY, align: "center" });
}


// ---------------------------------------------------------------- title
{ const s = divider("", "What Walrus looks like inside", "From six snapshots to the next one, and where we will record");
  s.addNotes("Walrus (McCabe et al., arXiv 2511.15684). Everything here is from the paper (Table 3, Appendix B) and checked in the released code. No results yet, only the inside of the model."); }

{ const s = base("", "Walrus in one picture", "Walrus sees the last 6 snapshots of a system and predicts the next one.",
    "It predicts the change from the last snapshot, not the new snapshot itself.",
    "Trained this way on 19 systems from The Well and FlowBench, 2D and 3D. For 2D it always takes 6 snapshots. At test time it can be rolled out step by step, each prediction becoming the newest input. We only look at one step.");
  const y = 3.3, h = 1.1;
  const w = chain(s, y, h, [["6 snapshots", GREY, "fields on a grid"], ["scale and encode", BAND, "each patch becomes 1,408 numbers"],
    ["40 blocks", TEAL, "the same shape 40 times"], ["decode and unscale", BAND, "back to fields, as a change"], ["next snapshot", GREY, "last snapshot plus the change"]], 19);
  const xl = 1.3 + w / 2, xr = 1.3 + 4 * (w + 0.4) + w / 2, top = 2.65;
  line(s, xl, top, 0, y - top, GREY, "dash"); line(s, xl, top, xr - xl, 0, GREY, "dash");
  s.addShape(pres.shapes.LINE, { x: xr, y: top, w: 0, h: y - top, line: { color: GREY, width: 1.5, dashType: "dash", endArrowType: "triangle" } });
  small(s, "the last snapshot is added back", xl + 2, top - 0.42, xr - xl - 4); }

{ const s = base("", "Encoder, processor, decoder", "The classic layout. The encoder shrinks the fields to a small grid of patches, the processor works there, the decoder blows it back up.",
    "Everything we measure lives in the middle, on the small grid.",
    "Example shear flow, 4 fields on 256 x 512 pixels, 6 snapshots. The encoder turns each snapshot into 32 x 32 patches of 1,408 numbers. The processor is the 40 blocks, all on that grid. The decoder mirrors the encoder and gives a change per field on 256 x 512 pixels. Unlike Poseidon (a U), there are no skips from the encoder side to the decoder side, so everything has to pass through the 40 blocks. All 2D systems share one encoder and one decoder; only the field slots differ.");
  pic(s, "edp.png", 1.3, 2.55, 10.7, 3.75); }

{ const s = base("", "How big", null, "About 60 times joint2, and nothing goes around the middle.",
    "From Walrus Table 3. 1.3e9 parameters, about 28 million per block. Hidden dimension 1,408. Table 3 says MLP dimension 5,632, but that is the width before the gate cuts it in half, so a block has 2,816 neurons (slides 18 to 23). 2D data gives a 32 x 32 grid of patches per snapshot. Trained on 96 H100 GPUs, 200 epochs. joint2 is 21 million parameters.");
  const w = 3.3, xs = [1.3, 5.0, 8.7];
  stat(s, xs[0], 1.9, w, "1.3 billion", "parameters"); stat(s, xs[1], 1.9, w, "40", "blocks, all the same shape"); stat(s, xs[2], 1.9, w, "19", "systems in training, 2D and 3D");
  stat(s, xs[0], 4.0, w, "1,408", "numbers per patch between blocks", TEAL); stat(s, xs[1], 4.0, w, "2,816", "neurons in each block's MLP", ORANGE);
  stat(s, xs[2], 4.0, w, "1,024", "patches per snapshot, 32 × 32", TEAL); }

// ---------------------------------------------------------------- 1 going in
divider("1", "Going in", "From fields on a grid to activations");

{ const s = base("1", "Each field gets its own scale", "A pressure can be thousands of times bigger than a velocity. So Walrus first divides every field by its typical size over the 6 snapshots.",
    "The model only sees numbers around 1, and gives back a change around 1.",
    "RMS = root mean square. Computed per example and per field, over the 6 snapshots and all grid points (the 'reversible normalisation', SamplewiseRevNormalization in the code, the RMS version). The output is scaled back with the RMS of the changes between the 6 snapshots, then added to the last snapshot. This happens outside the model, so the activations never see the real size of a field. Walrus paper Appendix B.1, Eq. 12-13.");
  pic(s, "f_rms.png", 2.3, 2.55, 8.7, 1.45);
  pic(s, "f_norm.png", 2.3, 4.15, 8.7, 1.1);
  sym(s, "U the 6 snapshots of one field, N grid points, M the model, ΔU the changes between snapshots", 5.55); }

{ const s = base("1", "One input slot per field name", "Walrus knows 67 field names. Each name has its own input weights, used by every system that has that field.",
    "Systems with the same fields share their input weights. Gray–Scott and Helmholtz share none.",
    "The first convolution of the encoder has one column of weights per field name (67 in the released model, plus two channels that mark the boundaries). A system only uses the columns of its own fields. So it is not one input layer per system, as we assumed in the handoff, but one per field name. Acoustics, shear flow and Rayleigh-Benard share pressure and velocity. Euler shares pressure only (it uses momentum, not velocity). Acoustics has a density field, but Walrus sets it to 0 and gives it its own slot. Consequence for Part A: the first blocks see shared inputs for some pairs and none for others, so compare against the random-weight copy and look deeper in.");
  const sh = { bold: true, color: TEAL };
  const rows = [
    ["acoustics, both", [["pressure", sh], [", "], ["velocity x", sh], [", "], ["velocity y", sh], [", speed of sound, density set to 0"]]],
    ["Euler, both", [["pressure", sh], [", density, energy, momentum x, momentum y"]]],
    ["shear flow", [["pressure", sh], [", "], ["velocity x", sh], [", "], ["velocity y", sh], [", tracer"]]],
    ["Rayleigh–Bénard", [["pressure", sh], [", "], ["velocity x", sh], [", "], ["velocity y", sh], [", buoyancy"]]],
    ["Gray–Scott", [["chemical A, chemical B"]]],
    ["Helmholtz staircase", [["pressure real part, pressure imaginary part, mask"]]],
  ];
  const cells = [[{ text: "system", options: { bold: true, color: "FFFFFF", fill: { color: BAND } } }, { text: "its fields (teal = shared with another equation)", options: { bold: true, color: "FFFFFF", fill: { color: BAND } } }]];
  rows.forEach(([sys, runs], i) => cells.push([
    { text: sys, options: { bold: true, fill: { color: i % 2 ? "FFFFFF" : CARD } } },
    { text: runs.map(([t, o]) => ({ text: t, options: o || {} })), options: { fill: { color: i % 2 ? "FFFFFF" : CARD } } }]));
  s.addTable(cells, { x: 1.3, y: 2.6, w: 10.7, colW: [3.0, 7.7], rowH: 0.5, fontFace: "Times New Roman", fontSize: 17, color: INK,
    border: { type: "solid", pt: 0.5, color: "D5DBE1" }, margin: [4, 8, 4, 8], valign: "middle" }); }

{ const s = base("1", "Cut into a 32 by 32 grid", "Every 2D system becomes 32 × 32 patches, whatever its resolution. The patch size changes instead.",
    "So one patch covers a very different piece of the field in different systems.",
    "Made-up fields, real resolutions. Orange = one patch. Walrus picks the encoder strides from the resolution ('stride modulation'). Our 8 systems: acoustics 256x256 -> 8x8 pixels per patch, Euler 512x512 -> 16x16, Gray-Scott 128x128 -> 4x4, shear flow 256x512 -> 8x16, Rayleigh-Benard 512x128 -> 16x4, Helmholtz 1024x256 -> 32x8. With walls instead of periodic edges the grid can get one extra row or column from padding (32 or 33).");
  pic(s, "grid.png", 1.3, 2.45, 10.7, 3.9); }

{ const s = base("1", "From patch to 1,408 activations", "The encoder is two small convolution steps, done for each of the 6 snapshots.",
    "After this every patch is a list of 1,408 numbers, in every system.",
    "hMLP encoder (Touvron et al. 2022) with stride modulation. Step 1 uses only the weight columns of this system's fields (previous slide), field slots -> 352 channels, then GroupNorm and SiLU. Step 2 is 352 -> 1,408, GroupNorm and SiLU. All 2D systems share this encoder; 3D has its own.");
  chain(s, 3.1, 1.3, [["one patch of each field", GREY, "only this system's fields"], ["step 1\nfields → 352", BAND, "picks the field slots"],
    ["step 2\n352 → 1,408", BAND, "same for every system"], ["1,408 activations", TEAL, "per patch, per snapshot"]], 19); }

// ---------------------------------------------------------------- 2 the blocks
divider("2", "The 40 blocks", "The same shape 40 times, and nothing goes around them");

{ const s = base("2", "What a block works on", "6 snapshots, each cut into 32 × 32 patches, each patch 1,408 numbers.",
    "Every block takes this stack and gives back a stack of the same size.",
    "6 x 1,024 x 1,408 = 8,650,752 numbers per example go in and out of every block. The blocks never change the grid or the width. This is why every block can be compared with every other, unlike joint2's U shape.");
  for (let i = 0; i < 6; i++) {
    const x = 1.6 + i * 0.42, y = 2.55 + i * 0.22;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.3, h: 2.3, fill: { color: i === 5 ? "DDF2F0" : CARD }, line: { color: i === 5 ? TEAL : GREY, width: 1.2 } });
  }
  const gx = 1.6 + 5 * 0.42, gy = 2.55 + 5 * 0.22;
  for (let k = 1; k < 8; k++) { line(s, gx + k * 2.3 / 8, gy, 0, 2.3, TEAL); line(s, gx, gy + k * 2.3 / 8, 2.3, 0, TEAL); }
  small(s, "oldest", 0.9, 2.2, 1.6); small(s, "newest", gx + 0.35, gy + 2.35, 1.6, TEAL);
  T(s, [{ text: "6 × 1,024 × 1,408", options: { bold: true, color: BAND, fontSize: 30, breakLine: true } },
        { text: "about 8.7 million numbers", options: { color: GREY, fontSize: 20, breakLine: true } },
        { text: " ", options: { fontSize: 12, breakLine: true } },
        { text: "a cartoon grid, the real one is 32 × 32", options: { color: GREY, fontSize: 15, italic: true } }],
    { x: 6.9, y: 3.2, w: 5.1, h: 2.6, align: "center", valign: "middle" }); }

{ const s = base("2", "One block, two steps", "First each patch looks back in time, then every patch looks at every other patch.",
    "Time first, then space. Then the next block.",
    "Time step = causal attention with 16 heads, per grid position, over the 6 snapshots, with relative position encoding. Space step = full attention over all 1,024 patches of one snapshot (axial RoPE for position) together with the MLP. Both steps add their output to their input (residual). joint2 (SwinV2) only let a patch see patches in a local window.");
  cards2(s, 2.65, 3.3, [
    [TEAL, "time step", "Each patch looks at the same patch in earlier snapshots.\n\nSnapshot 4 sees 1 to 4, never 5 or 6."],
    [ORANGE, "space step", "Within one snapshot, every patch looks at all 1,024 patches.\n\nAttention and MLP, side by side."]]);
  arrow(s, 6.45, 4.3, 0.4); }

{ const s = base("2", "The space step, attention and MLP side by side", "Both read the same normalised input, and both outputs are added back to it.",
    "joint2 did attention, then MLP. Walrus does them at once, from one shared input.",
    "'Parallel' block (Wang 2021, as in PaLM). Norm = RMSGroupNorm with 16 groups. In the code the first layer of the MLP and the Q, K, V of attention are one big linear layer (fused_ff_qkv), split afterwards. u = the 1,408 numbers of a patch coming in, v = going out.");
  pic(s, "f_block.png", 2.8, 2.3, 7.7, 0.7);
  const y = 4.55;
  box(s, 1.5, y, 1.1, 0.8, "u", GREY, 20);
  arrow(s, 2.65, y + 0.4, 0.55);
  box(s, 3.25, y, 1.7, 0.8, "Norm", BAND, 19);
  fork(s, 4.95, y + 0.4, [y - 0.35, y + 1.15], 0.8);
  box(s, 5.75, y - 0.75, 2.4, 0.8, "attention", TEAL, 19); box(s, 5.75, y + 0.75, 2.4, 0.8, "MLP", ORANGE, 19);
  join(s, 8.15, [y - 0.35, y + 1.15], y + 0.4, 1.05);
  s.addShape(pres.shapes.OVAL, { x: 9.2, y: y + 0.1, w: 0.6, h: 0.6, fill: { color: "FFFFFF" }, line: { color: GREY, width: 1.5 } });
  T(s, "+", { x: 9.2, y: y + 0.1, w: 0.6, h: 0.6, fontSize: 24, bold: true, align: "center", valign: "middle" });
  arrow(s, 9.85, y + 0.4, 0.6);
  box(s, 10.5, y, 1.1, 0.8, "v", GREY, 20);
  line(s, 2.05, y - 1.05, 0, 1.05, GREY, "dash"); line(s, 2.05, y - 1.05, 7.45, 0, GREY, "dash");
  s.addShape(pres.shapes.LINE, { x: 9.5, y: y - 1.05, w: 0, h: 1.13, line: { color: GREY, width: 1.5, dashType: "dash", endArrowType: "triangle" } });
  small(s, "u itself, added back", 3.5, y - 1.42, 3.0); }

{ const s = base("2", "Three parts, three jobs", "Inside the space step. One snapshot, 1,024 patches, each a list u of 1,408 numbers.",
    "The norm feeds both attention and the MLP, and both outputs are added back to u.",
    "Short version. Attention moves information between patches, the MLP computes on each patch by itself, and the norm keeps the numbers a steady size so 40 blocks in a row stay stable. Next three slides, one each.");
  cards3(s, 2.9, 2.3, [[BAND, "Norm", "keeps the numbers around size 1, block after block"],
                        [TEAL, "Attention", "patches talk to each other, the only place where they do"],
                        [ORANGE, "MLP", "each patch on its own, where our 2,816 neurons live"]]); }

{ const s = base("2", "Norm, keeping the numbers steady", "Cut each patch's 1,408 numbers into 16 groups of 88. Divide each group by its typical size over the whole snapshot.",
    "Unlike joint2, the scale is shared by the whole snapshot.",
    "RMSGroupNorm with 16 groups. p = the patch, i = one of the 1,408 numbers, g = the group that i belongs to (88 numbers). RMS = square, average over the group's 88 numbers in all 1,024 patches, take the root. gamma_i = a learned weight per number. No mean subtracted, no bias added. joint2's norm looked at each patch alone. This matters for removal: changing some patches shifts the scale of all of them a little.");
  pic(s, "f_gnorm.png", 1.8, 2.65, 9.7, 1.25);
  sym(s, "p the patch, i one of the 1,408 numbers, g its group of 88, γ a learned weight per number", 4.0);
  box(s, 2.8, 4.65, 7.7, 1.35, "Tiny example, 2 patches, a group of 2 numbers, values (3, 4) and (0, 0)\nRMS = √((9 + 16 + 0 + 0) / 4) = 2.5, so they become (1.2, 1.6) and (0, 0)", GREY, 17); }

{ const s = base("2", "Attention, patches talk to each other", "Each patch asks a question, every patch offers an answer, and each patch takes a weighted mix of the answers.",
    "Example. Shares 0.7, 0.2 and 0.1 give 0.7 × content 1 + 0.2 × content 2 + 0.1 × content 3.",
    "From its normalised list n_p every patch makes three lists with learned weights: question q_p = W_Q n_p, label k_p = W_K n_p, content v_p = W_V n_p. Score s_pr: a high score means r's label fits p's question. Softmax turns the scores into shares that add up to 1. The output is the mix of contents, then one more learned map W_O.");
  chain(s, 2.75, 1.0, [["question, label, content", BAND, "q, k, v from each patch"], ["score", TEAL, "does r's label fit p's question?"],
                       ["shares", TEAL, "add up to 1"], ["mix of contents", ORANGE, "the output for patch p"]], 17);
  pic(s, "f_attn1.png", 1.5, 4.3, 6.6, 1.2);
  pic(s, "f_attn2.png", 8.3, 4.3, 3.4, 1.2);
  sym(s, "p the patch that asks, r any patch, 88 numbers per question", 5.6); }

{ const s = base("2", "Attention, the details", null, "Every patch sees all 1,024 patches. joint2 only saw a local window.",
    "16 heads, each on 88 of the 1,408 numbers. Position: axial RoPE, q and k are rotated by the patch's place, so the score also depends on the offset between two patches. QK-norm (a LayerNorm on q and k) for stability. Time step: per grid position, over the 6 snapshots, with a learned bias per distance in time; future snapshots get minus infinity, checked in the code.");
  cards3(s, 2.2, 2.9, [[BAND, "16 heads", "All of this 16 times side by side, each on 88 of the numbers. So a patch asks 16 different questions."],
                       [TEAL, "Position", "q and k are turned according to where the patch sits. The score also depends on how far apart two patches are."],
                       [ORANGE, "Time step", "The same idea along time. One place looks at its own patch in the 6 snapshots. Later snapshots are blocked."]], 17); }

{ const s = base("2", "The MLP is a small classic network", "Up, a bend, down. One hidden layer, nothing more.",
    "Walrus changes only one thing about it, what a neuron does.",
    "A feed-forward network with one hidden layer, run on every patch separately, with the same weights for all 1,024 patches. Every block has its own weights. In joint2 (Poseidon-T) the MLP was exactly this with a GELU bend, e.g. 384 -> 1,536 -> 384 in the middle. Going wide gives the patch many different recipes (weighted sums) at once.");
  pic(s, "nn_classic.png", 1.0, 2.45, 6.4, 3.9);
  side(s, ["Every patch goes through it on its own.", "The same weights for all 1,024 patches.", "joint2's MLP was exactly this."], 7.7, 2.6, 4.6, 3.4); }

{ const s = base("2", "Walrus's neuron has a gate", "Each neuron reads all the inputs twice, with two sets of weights. That gives a value x and a gate g, which are multiplied.",
    "We record a, the 2,816 gated outputs per patch.",
    "SwiGLU. Two weight matrices from the input, W_x and W_g, each 2,816 x 1,408 (teal and orange lines). Neuron i: x_i and g_i, then a_i = SiLU(g_i) x_i. Then down, 1,408 x 2,816, back to the patch's 1,408 numbers, added to u. Why a gate: a weighted sum cannot multiply two things, the gate brings one multiplication per neuron. It is the standard choice in modern transformers because it trains better.");
  pic(s, "nn_gated.png", 1.3, 2.35, 10.7, 3.55);
  pic(s, "f_swiglu.png", 2.8, 5.85, 7.7, 0.55); }

{ const s = base("2", "A tiny example", "2 inputs, 2 neurons. Value and gate both read both inputs, each with its own weights.",
    "Neuron 1 is on, neuron 2 is nearly off.",
    "Input u = (1, 2). Neuron 1: x = 0.5 x 1 + 0 x 2 = 0.5, g = 1 x 1 + 1 x 2 = 3, SiLU(3) = 2.86, a = 1.43. Neuron 2: x = 1 x 1 - 1 x 2 = -1, g = -2 x 1 + 0 x 2 = -2, SiLU(-2) = -0.24, a = 0.24. The down matrix then mixes (1.43, 0.24) into the 2 outputs.");
  pic(s, "nn_tiny.png", 0.7, 2.4, 6.9, 3.95);
  table2(s, [["", "value weights", "gate weights"], ["neuron 1", "0.5 and 0", "1 and 1"], ["neuron 2", "1 and −1", "−2 and 0"]], 7.7, 2.7, 4.6);
  T(s, [{ text: "neuron 1", options: { bold: true, breakLine: true } },
        { text: "x = 0.5·1 + 0·2 = 0.5", options: { breakLine: true } }, { text: "g = 1·1 + 1·2 = 3", options: { breakLine: true } },
        { text: "a = SiLU(3) · 0.5 = 1.43" }], { x: 7.7, y: 4.45, w: 4.6, h: 1.8, fontSize: 17, align: "center" }); }

{ const s = base("2", "A neuron is a switch", "Each neuron is two weighted sums of the patch's numbers. The gate g decides how much of the value x passes.",
    "joint2's neuron was one sum through a bend. Here one sum switches another.",
    "a_i = SiLU(g_i) x_i. Example with x_i = 0.5. Gate -3: SiLU = -0.14, a = -0.07, nearly off. Gate 2: SiLU = 1.76, a = 0.88, on. SiLU is close to 0 for negative g and close to g for large g.");
  pic(s, "silu.png", 1.0, 2.5, 5.6, 3.85);
  cards2b(s); }

{ const s = base("2", "What the gate is for", "Value and gate both read all of the patch's numbers. Their own weights decide what each one picks out. Then the two are multiplied.",
    "A gated neuron can multiply, so products like ρ · u can appear in any block.",
    "Made-up neuron with 3 inputs, to show the idea. Bold line = weight 1, dashed = weight 0. The gate's weights pick out density, the value's weights pick out velocity, so a = SiLU(rho) u, about rho times u (momentum) when rho is clearly positive. In Walrus each neuron mixes all 1,408 numbers with learned weights, so x and g are usually mixtures, not single fields. A classic neuron (joint2, GELU of one sum) cannot make a product in one go. Why Walrus uses gates: they train better for the same compute (Shazeer 2020), not a deep theory. For Part B: our readouts are weighted sums, so a product is only readable if the model computed it; with gates any block can, so the input control and per-block readouts decide where it first appears.");
  pic(s, "gate_example.png", 1.3, 2.55, 10.7, 3.4);
  sym(s, "made-up, a real neuron mixes all 1,408 numbers with learned weights", 5.9); }

{ const s = base("2", "Why the paper says 5,632", "Two weight matrices, one for the values and one for the gates. The code stacks them to compute both in one go.",
    "The cut in half is only bookkeeping. Each block has 2,816 neurons.",
    "Walrus Table 3 lists MLP dimension 5,632. That is the stacked matrix. In the code it is even part of one bigger layer together with attention's Q, K and V (fused_ff_qkv), split right after. The model itself has W_x and W_g.");
  pic(s, "stacked.png", 1.3, 2.6, 10.7, 3.7); }

{ const s = base("2", "The grid moves in every block", "Some systems wrap around at the edges, what leaves on the right comes back on the left. For those, Walrus shifts the whole grid by a random amount before each block.",
    "Shifted back at the end. We fix the seed and undo the shift before comparing patches.",
    "Cartoon with 6 x 6 patches and made-up shifts; the real grid is 32 x 32. 'Patch jittering', meant to stop errors from piling up in long rollouts. It also happens at test time (isotropic_model.py, lines 371-383). Periodic in our set: shear flow, Gray-Scott, Euler periodic, Rayleigh-Benard (left-right). It does not matter for anything summed over all patches (neurons, directions, paths). It matters for anything tied to a place: probes on a patch, steering maps.");
  const shifts = [[0, 0], [2, 1], [5, 3]];
  shifts.forEach(([dx, dy], b) => {
    const x0 = 1.9 + b * 3.6, y0 = 2.75, c = 0.42;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const hit = i === (1 + dx) % 6 && j === (2 + dy) % 6;
      s.addShape(pres.shapes.RECTANGLE, { x: x0 + i * c, y: y0 + j * c, w: c, h: c, fill: { color: hit ? ORANGE : CARD }, line: { color: "C9D2DA", width: 0.75 } });
    }
    small(s, ["block 1, no shift", "block 2, shifted", "block 3, shifted again"][b], x0 - 0.3, y0 + 6 * c + 0.15, 6 * c + 0.6, BAND);
    if (b < 2) arrow(s, x0 + 6 * c + 0.2, y0 + 3 * c, 0.75);
  });
  small(s, "orange = the same piece of the field", 4.0, 5.85, 5.3, ORANGE); }

// ---------------------------------------------------------------- 3 coming out
divider("3", "Coming out", "Back to fields, and the change is added");

{ const s = base("3", "Back to fields", "The decoder mirrors the encoder. It turns each patch's 1,408 numbers back into pixels, one output slot per field.",
    "What comes out is a change. Scaled back and added to the last snapshot, it is the prediction.",
    "Two transposed convolutions with the same strides as the encoder; the grid shift is undone and padding is cut off. Like the input, the last layer has one slot per field name, so the system gets back exactly its own fields. Then the change is multiplied by the RMS of the changes in the input (slide 6) and added to the last snapshot.");
  chain(s, 3.1, 1.3, [["1,408 per patch", TEAL, "after block 40"], ["decoder\n2 steps up", BAND, "one slot per field"],
    ["change per field", GREY, "around 1"], ["× typical change", BAND, "undo the scale"], ["+ last snapshot", GREY, "= next snapshot"]], 18); }

// ---------------------------------------------------------------- 4 where we look
divider("4", "Where we look", "Walrus next to joint2, and where we record");

{ const s = base("4", "Walrus next to joint2", null, "Bigger, and simpler inside. A removal in the middle cannot be dodged.",
    "joint2 = our Poseidon-T design model (scOT, SwinV2). In joint2 Allen-Cahn, the waves and Navier-Stokes went around the middle through the skips, which made removal hard to read. Walrus has no skips around blocks, only the residual inside each block, which every model has.");
  const rows = [["", "joint2", "Walrus"], ["size", "21 million", "1.3 billion"], ["layers", "32, a U with skips", "40, all the same, no skips"],
    ["input", "1 snapshot, 4 fixed field slots", "6 snapshots, a slot per field name"], ["attention", "local windows", "all patches, and over time"], ["neurons per layer", "1,536 in the middle", "2,816"],
    ["neuron type", "GELU", "a gate (SwiGLU)"], ["systems", "8, trained by us", "19, released"]];
  const cells = rows.map((r, i) => r.map((t, j) => ({ text: t, options: { bold: i === 0 || j === 0, color: i === 0 ? "FFFFFF" : INK,
    fill: { color: i === 0 ? BAND : (i % 2 ? CARD : "FFFFFF") } } })));
  s.addTable(cells, { x: 1.3, y: 1.75, w: 10.7, colW: [3.0, 3.7, 4.0], rowH: 0.52, fontFace: "Times New Roman", fontSize: 18,
    border: { type: "solid", pt: 0.5, color: "D5DBE1" }, margin: [4, 8, 4, 8], valign: "middle" }); }

{ const s = base("4", "Where others looked, where we look", "Two papers looked inside Walrus, each at one block.",
    "We look at all 40 blocks, with 8 systems at once.",
    "Blocks numbered 0 to 39 as in the code. Sparse probes (Rosenfeld and Sonnewald 2026) = a sparse autoencoder on the MLP's 2,816 neurons in block 20, shear flow only. Physics Steering (Fear et al. 2025) = the output of the last block (1,408 per patch), directions from shear flow, pushed into 3 other systems. We record the 2,816 neurons in every block, and the block output at a few blocks so we can compare with Physics Steering.");
  const n = 40, x0 = 1.3, W = 10.7, gap = 0.04, c = (W - gap * (n - 1)) / n, y = 3.75;
  for (let i = 0; i < n; i++) {
    const col = i === 20 ? ORANGE : i === 39 ? PURPLE : TEAL;
    s.addShape(pres.shapes.RECTANGLE, { x: x0 + i * (c + gap), y, w: c, h: 0.75, fill: { color: i === 20 || i === 39 ? col : "DDF2F0" }, line: { color: col, width: 0.75 } });
  }
  T(s, "block 0", { x: x0, y: y + 0.82, w: 1.0, h: 0.4, fontSize: 14, color: GREY }); T(s, "block 39", { x: x0 + W - 1.3, y: y + 0.82, w: 1.1, h: 0.4, fontSize: 14, color: PURPLE, align: "right" });
  line(s, x0, 3.3, W, 0, TEAL); line(s, x0, 3.3, 0, 0.3, TEAL); line(s, x0 + W, 3.3, 0, 0.3, TEAL);
  T(s, "us, the 2,816 neurons in every block, 8 systems", { x: x0, y: 2.75, w: W, h: 0.45, fontSize: 18, bold: true, color: TEAL, align: "center" });
  const x20 = x0 + 20 * (c + gap) + c / 2;
  upArrow(s, x20, y + 0.8, 5.45, ORANGE);
  T(s, "Sparse probes\nblock 20, MLP neurons, shear flow only", { x: x20 - 2.6, y: 5.5, w: 5.2, h: 0.8, fontSize: 16, color: ORANGE, align: "center" });
  const x39 = x0 + 39 * (c + gap) + c / 2;
  upArrow(s, x39, y + 0.8, 5.45, PURPLE);
  T(s, "Physics Steering\nlast block, its output", { x: x39 - 2.9, y: 5.5, w: 3.1, h: 0.8, fontSize: 16, color: PURPLE, align: "right" }); }

{ const s = base("4", "What we record", "One test example, newest snapshot, all 40 blocks.",
    "Too much to keep it all, so we keep averages plus a sample of patches, as for joint2.",
    "1,024 x 2,816 x 40 = 115,343,360 numbers per example (about 230 MB in half precision). Per example we keep, per neuron and block, the mean and the mean |activation| over all 1,024 patches (2 x 2,816 x 40 = 225,280 numbers), plus 64 randomly chosen patches (7.2 million numbers). Newest snapshot only: it has seen all 6 snapshots, and it is the one the prediction comes from. The same for the random-weight copy.");
  const y = 2.7, w = 2.0;
  stat(s, 1.3, y, w, "1,024", "patches"); T(s, "×", { x: 3.3, y, w: 0.5, h: 0.9, fontSize: 36, color: GREY, align: "center", valign: "middle" });
  stat(s, 3.8, y, w, "2,816", "neurons", ORANGE); T(s, "×", { x: 5.8, y, w: 0.5, h: 0.9, fontSize: 36, color: GREY, align: "center", valign: "middle" });
  stat(s, 6.3, y, w, "40", "blocks"); T(s, "=", { x: 8.3, y, w: 0.5, h: 0.9, fontSize: 36, color: GREY, align: "center", valign: "middle" });
  stat(s, 8.8, y, 3.2, "115 million", "numbers per example", BAND);
  sym(s, "kept per example, each neuron's average over all patches, plus 64 patches in full", 4.85); }

{ const s = base("", "In short", null, null,
    "Corrections to what we assumed before. The neuron count is 2,816, not 5,632. The input layer is per field name, not per system. The grid shift needs handling for anything per patch.");
  plain(s, ["Walrus is one block shape, repeated 40 times", "Systems differ at the input only in which field slots they use",
            "Every 2D system becomes 32 × 32 patches, the patch size changes", "We record the 2,816 neurons after the gate, in every block"], 2.1, 24); }

pres.writeFile({ fileName: path.join(__dirname, "../../walrus_inside.pptx") }).then((f) => console.log("wrote", f));
