// Builds forward_pass_explained.pptx (repo root): what happens in one forward pass of Walrus, following one patch.
// Same style as the other decks.
//   ~/Documents/GitHub/poseidon/.venv/bin/python slides/forward/figures.py
//   cd slides/forward && NODE_PATH=/Users/maarten/node_modules node build.js
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
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: colour, width: 1.5 } });
  T(s, head, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.5, fontSize: 20, bold: true, color: colour, align: "center" });
  T(s, body, { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: h - 0.95, fontSize: size || 18, align: "center" });
}
const cards2 = (s, y, h, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 5.6, y, 5.1, h, c, hd, b, size));
const cards3 = (s, y, h, items, size) => items.forEach(([c, hd, b], i) => card(s, 1.3 + i * 3.65, y, 3.4, h, c, hd, b, size));
function box(s, x, y, w, h, text, colour, size) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: colour || GREY, width: 1.5 } });
  T(s, text, { x: x + 0.06, y, w: w - 0.12, h, fontSize: size || 17, align: "center", valign: "middle" });
}
const arrow = (s, x, y, w) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: GREY, width: 2, endArrowType: "triangle" } });
function chain(s, y, h, items, size) {
  const n = items.length, gap = 0.3, w = (10.7 - gap * (n - 1)) / n;
  items.forEach(([text, colour], i) => { const x = 1.3 + i * (w + gap); box(s, x, y, w, h, text, colour, size); if (i < n - 1) arrow(s, x + w + 0.03, y + h / 2, gap - 0.06); });
}
function plain(s, ls, y, size) {
  T(s, ls.map((l, i) => ({ text: l, options: Object.assign({ breakLine: i < ls.length - 1 }, i === 0 ? { bold: true, color: BAND } : {}) })),
    { x: 1.8, y: y || 2.2, w: 9.7, h: 4.0, fontSize: size || 24, align: "center", paraSpaceAfter: 22 });
}
const sym = (s, text, y) => T(s, text, { x: 1.3, y, w: 10.7, h: 0.5, fontSize: 16, color: GREY, align: "center" });


{ const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  band(s, 3.0, "", "One forward pass through Walrus");
  T(s, "Following one patch, from the fields in to the prediction out", { x: 1.3, y: 4.3, w: 10.7, h: 0.6, fontSize: 20, color: GREY, align: "center" });
  s.addNotes("Example system: shear flow, 4 fields on 256 x 512 pixels, 6 snapshots in. Pictures are cartoons; the sizes are Walrus's."); }

{ const s = base("1", "What a forward pass is", "Running the model once. The data goes in at the start, through every part in order, and a prediction comes out.",
    "The encoder, the 40 blocks and the decoder all happen inside it.",
    "Forward pass = one run of the model. The backward pass only happens in training (and for our path test): the error flows back to find out how each weight or neuron affected the result.");
  chain(s, 2.85, 0.95, [["input", GREY], ["encoder", BAND], ["block 1", TEAL], ["block 2", TEAL], ["…", TEAL], ["block 40", TEAL], ["decoder", BAND], ["output", GREY]], 17);
  cards2(s, 4.25, 1.9, [[BAND, "forward pass", "always. Data flows in, a prediction comes out."],
                        [GREY, "backward pass", "only in training. The error flows back, to adjust the weights."]], 17); }

{ const s = base("1", "The data is just numbers", "Every layer does the same kind of thing. Multiply the numbers by learned weights, add them up, sometimes bend.",
    "What differs between steps is which numbers get combined with which.",
    "A layer: each output is a weighted sum of inputs, then often a bend (an activation function). The weights are what training learned.");
  pic(s, "nn_classic.png", 2.8, 2.55, 7.7, 3.8); }

{ const s = base("2", "The encoder writes a notebook", "Take one patch, a square of 8 × 16 pixels with 4 fields. The encoder turns it into a list of 1,408 numbers.",
    "From here on, that list is the patch. Think of it as the patch's notebook.",
    "Shear flow: 256 x 512 pixels cut into 32 x 32 patches of 8 x 16 pixels. 4 x 8 x 16 = 512 raw numbers become 1,408. Done for every patch and every snapshot separately. Nothing is compared between patches yet.");
  pic(s, "encode.png", 1.3, 2.6, 10.7, 3.7); }

{ const s = base("3", "Each block adds to the notebook", "A block reads the notebook and adds to it. It never throws the old content away.",
    "40 blocks in a row, each adding its notes.",
    "This is the residual stream: new = old + additions. The time step and the space step each add their result. In Walrus attention and MLP in the space step read the same normalised input and both add their output.");
  pic(s, "f_add.png", 1.8, 2.65, 9.7, 0.8);
  cards3(s, 3.75, 2.4, [[PURPLE, "time", "the same patch, in the earlier snapshots. What was happening here before?"],
                        [TEAL, "attention", "the other patches, now. What is going on around me?"],
                        [ORANGE, "MLP", "the patch on its own. Given all that, what follows?"]], 17); }

{ const s = base("3", "Where the notes come from", "For the orange patch, in one block.",
    "Only the time and space steps share information between patches.",
    "Time step: causal attention over the same grid position in the 6 snapshots (never later ones). Space step: attention over all 1,024 patches of the snapshot, the weights say how relevant each patch is. MLP: the 2,816 gated neurons, per patch.");
  pic(s, "sources.png", 1.3, 2.45, 10.7, 3.9); }

{ const s = base("3", "The notebook gets richer", "Block after block, more of the past, the neighbours and its own calculations end up in it.",
    "The list stays 1,408 numbers long. What the numbers mean keeps changing.",
    "Cartoon, not measured. In reality every number is a mix of everything; the colours only show the idea. Early blocks mostly describe the local picture, later blocks what is about to happen.");
  pic(s, "grow.png", 1.3, 2.4, 10.7, 3.95); }

{ const s = base("4", "The decoder reads it out", "For the newest snapshot, the decoder turns each final notebook back into 8 × 16 pixels for each field.",
    "That is the change. Added to the last snapshot, it is the prediction.",
    "The change is scaled back to real units (the scaling from the start, undone), then added to the last snapshot. For a longer forecast, that prediction becomes the newest input and the whole pass runs again.");
  pic(s, "decode.png", 1.3, 2.55, 10.7, 3.75); }

{ const s = base("4", "Where we record", "Inside each block, the MLP computes 2,816 numbers per patch before it adds its notes.",
    "We copy those 2,816 numbers, in every block, while the data passes through.",
    "Recording does not change anything; it only copies. Removal and pruning change those numbers during the pass and look at the output. Paths also need a backward pass, for activation x gradient.");
  box(s, 1.3, 3.55, 1.9, 1.0, "notebook in", GREY, 18);
  arrow(s, 3.25, 4.05, 0.5);
  box(s, 3.8, 3.55, 1.9, 1.0, "time step", PURPLE, 18);
  arrow(s, 5.75, 4.05, 0.5);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 2.55, w: 3.0, h: 3.0, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: BAND, width: 1.5, dashType: "dash" } });
  T(s, "space step, side by side", { x: 6.3, y: 2.62, w: 3.0, h: 0.4, fontSize: 15, color: BAND, align: "center" });
  box(s, 6.55, 3.1, 2.5, 0.9, "attention", TEAL, 18);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.55, y: 4.25, w: 2.5, h: 1.05, rectRadius: 0.08, fill: { color: "FBE7DF" }, line: { color: ORANGE, width: 2.5 } });
  T(s, "MLP\n2,816 neurons", { x: 6.6, y: 4.25, w: 2.4, h: 1.05, fontSize: 18, align: "center", valign: "middle" });
  arrow(s, 9.35, 4.05, 0.5);
  box(s, 9.9, 3.55, 2.1, 1.0, "notebook out", GREY, 18);
  sym(s, "we copy the numbers in the orange box", 5.75); }

{ const s = base("", "In short", null, null, "");
  plain(s, ["The encoder writes a notebook per patch", "40 blocks add notes from the past, the neighbours and their own calculations",
            "The decoder reads the notebook out as a change", "We copy what the MLP writes, in every block"], 2.0, 22); }

pres.writeFile({ fileName: path.join(__dirname, "../../forward_pass_explained.pptx") }).then((f) => console.log("wrote", f));
