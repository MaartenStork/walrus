// Builds "Weekly 04_11_2026.pptx" (repo root), slide by slide as in the hull Maarten made (Weekly 04_11_2026.pdf).
// Style of the other decks. Figures are copies from poseidon/playground/research_plan/slides and slides/inside.
//   cd slides/weekly && NODE_PATH=/Users/maarten/node_modules node build.js
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
function divider(num, title) {
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  band(s, 3.25, num, title);
  return s;
}
const small = (s, text, x, y, w, colour, size) => T(s, text, { x, y, w, h: 0.5, fontSize: size || 15, color: colour || GREY, align: "center" });


// 1 ---------------------------------------------------------------- title
{ const s = pres.addSlide(); s.background = { color: BAND };
  T(s, "Weekly Progress Update", { x: 1.3, y: 2.75, w: 10.7, h: 0.9, fontSize: 40, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.03, y: 3.72, w: 3.27, h: 0.09, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
  T(s, "04/11/2026", { x: 1.3, y: 4.0, w: 10.7, h: 0.7, fontSize: 28, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle" }); }

// 2 ---------------------------------------------------------------- agenda
{ const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 3.47, h: 7.5, fill: { color: BAND }, line: { color: BAND } });
  [["1", "Plan recap"], ["2", "Shared?"], ["3", "Representation?"]].forEach(([n, t], i) => {
    const y = 2.03 + i * 1.19;
    s.addShape(pres.shapes.OVAL, { x: 1.44, y, w: 1.05, h: 1.05, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
    T(s, n, { x: 1.44, y, w: 1.05, h: 1.05, fontSize: 28, bold: true, align: "center", valign: "middle" });
    T(s, t, { x: 4.6, y, w: 6.0, h: 1.05, fontSize: 26, align: "center", valign: "middle" });
  }); }

// 3-6 ---------------------------------------------------------------- plan recap
divider("1", "Plan recap");

{ const s = base("1", "Plan recap", null, null,
    "The question from last week's meeting, and what it means. Part A (shared?) comes first; Part B (a picture of physics?) only where Part A finds sharing.");
  T(s, "Last week we arrived at these questions", { x: 1.3, y: 2.6, w: 10.7, h: 0.5, fontSize: 22, align: "center" });
  T(s, "Do different PDEs share the inside of a PDE foundation model? And if so, is there some shared representation of physics?",
    { x: 1.6, y: 3.25, w: 10.1, h: 1.0, fontSize: 23, bold: true, align: "center" });
  T(s, "First we check whether a foundation model is worth it over a set of separate models, so whether it combines something inside that separate models could not. Then we check whether that combined thing is a picture of the physics.",
    { x: 1.6, y: 4.65, w: 10.1, h: 1.5, fontSize: 21, italic: true, align: "center" }); }

{ const s = base("1", "Plan recap", "Two models. A small one we trained ourselves, and a real foundation model.",
    "joint2 first, because we can retrain it. Walrus next, because it is a real foundation model.",
    "joint2: Poseidon-T design (scOT, SwinV2 in a U shape), trained from scratch with Poseidon's recipe, 40 epochs, 8 datasets from Poseidon's collection. Test errors 0.9-11.8%. Walrus: Polymathic AI 2025, arXiv 2511.15684, weights and code public, trained on 96 H100 GPUs, so we only run it.");
  card(s, 1.3, 2.65, 5.1, 3.5, TEAL, "Poseidon design, joint2", "21 million parameters\n\n32 layers in a U, with skips\n\n8 PDEs, trained by us", 20);
  card(s, 6.9, 2.65, 5.1, 3.5, PURPLE, "Walrus", "1.3 billion parameters\n\n40 blocks, no skips\n\n19 systems, released", 20); }

{ const s = base("1", "Plan recap", "PDE types. You can read the type off the PDE, from how time comes in.",
    "Story 1 would group PDEs by type inside. Story 2 would keep every PDE apart.",
    "Made-up 1D pictures, the field along a line, darker = later. Elliptic: no time at all, a steady state, every point depends on all others (Poisson, Helmholtz). Parabolic: one time derivative, it spreads and smooths (heat, Allen-Cahn, Gray-Scott). Hyperbolic: two time derivatives, it travels at a finite speed and stays sharp (waves, Euler). Navier-Stokes is mixed. Formally the type follows from the sign of the determinant of the second-order coefficients (b^2 - 4ac), but for these equations it is the same as reading how t appears.");
  [[TEAL, "elliptic", "no time"], [ORANGE, "parabolic", "one time derivative"], [PURPLE, "hyperbolic", "two time derivatives"]].forEach(([c, name, sub], i) => {
    const x = 1.3 + i * 3.65;
    T(s, name, { x, y: 2.45, w: 3.4, h: 0.45, fontSize: 22, bold: true, color: c, align: "center" });
    T(s, sub, { x, y: 5.85, w: 3.4, h: 0.4, fontSize: 18, color: c, align: "center" });
  });
  pic(s, "pde_types.png", 1.1, 2.95, 11.1, 2.85); }

{ const s = base("1", "Plan recap", "PDE types, as pictures of the whole field.",
    "Elliptic has no time. The other two change over time.",
    "Alternative to the previous slide, same message. Made-up fields, shaped like the real solutions. Elliptic (Poisson): left the heat source f, right the temperature u once everything has settled, cold walls. No time; one answer for each f, and every point of u depends on all of f. Parabolic (heat): a hot spot spreads out and fades (square-root colour scale so later pictures stay visible). Hyperbolic (wave): a bump becomes a ring that travels out at a fixed speed and stays sharp.");
  pic(s, "pde_snapshots.png", 1.0, 2.2, 7.0, 3.95);
  [[TEAL, "no time", 2.75], [ORANGE, "one time derivative", 4.1], [PURPLE, "two time derivatives", 5.45]].forEach(([c, text, y]) =>
    T(s, text, { x: 8.4, y, w: 3.8, h: 0.9, fontSize: 22, color: c, valign: "middle" }));
}

{ const s = base("1", "Plan recap", "Our 8 PDEs", null,
    "All 8 from Poseidon's collection, real test examples, each picture its own colour scale. Steady (Poisson, Helmholtz): input to solution (heaters to temperature, material to wave field). The others: a field at the start and later. Poisson: heat from heaters (Poisson-Gauss). Helmholtz: steady waves in a material. Allen-Cahn: two phases separating. NS: incompressible flow from sine-wave starts. Wave G: waves from bumps. Wave L: waves through a layered material. Euler G: compressible gas from bumps (CE-Gauss). Euler R: compressible gas from four quadrants (CE-RP).");
  const cells = [["poisson", "Poisson", "elliptic", "heat"], ["helmholtz", "Helmholtz", "elliptic", "steady waves"],
                 ["allen_cahn", "Allen\u2013Cahn", "parabolic", "phases separating"], ["ns_sines", "Navier\u2013Stokes", "mixed", "swirling fluid"],
                 ["wave_gauss", "wave G", "hyperbolic", "waves"], ["wave_layer", "wave L", "hyperbolic", "layered waves"],
                 ["euler_gauss", "Euler G", "hyperbolic", "gas"], ["euler_riemann", "Euler R", "hyperbolic", "gas, quadrants"]];
  const TC = { elliptic: TEAL, parabolic: ORANGE, hyperbolic: PURPLE, mixed: GREY };
  cells.forEach(([file, name, type, line], i) => {
    const x = 0.55 + (i % 4) * 3.1, y = 2.2 + Math.floor(i / 4) * 2.1;
    T(s, name, { x, y, w: 3.0, h: 0.4, fontSize: 20, bold: true, color: TC[type], align: "center" });
    pic(s, `pde_${file}.png`, x, y + 0.42, 3.0, 1.3);
    T(s, line, { x, y: y + 1.72, w: 3.0, h: 0.32, fontSize: 16, color: GREY, align: "center" });
  });
  T(s, [{ text: "elliptic", options: { color: TEAL, bold: true } }, { text: "     " }, { text: "parabolic", options: { color: ORANGE, bold: true } },
        { text: "     " }, { text: "hyperbolic", options: { color: PURPLE, bold: true } }, { text: "     " }, { text: "mixed", options: { color: GREY, bold: true } }],
    { x: 1.3, y: 6.55, w: 10.7, h: 0.4, fontSize: 17, align: "center" }); }

// 7-12 ---------------------------------------------------------------- shared?
divider("2", "Shared?");

{ const s = base("2", "Shared?", "To look inside, three measures that make sense. Directions come from the paper I sent in Teams, Chang, Tu and Bergen 2022.",
    "Each looks at a trained model as it is.",
    "Neurons: share of neurons each PDE uses (fires = activation above 0). Paths: top 10% of neurons by activation times gradient (Molchanov et al. 2017). Directions: per PDE mean-centre the activations, PCA, compare the subspaces (Chang, Tu and Bergen 2022), overlap phi (Hu et al. 2021).");
  const items = [[TEAL, "1. Neurons", "What share of the neurons does each PDE use?"], [ORANGE, "2. Paths", "Which neurons does each prediction depend on?"],
                 [PURPLE, "3. Directions", "In which directions do each PDE\u2019s activations spread out?"]];
  const icons = ["icon_neurons.png", "icon_paths.png", "icon_directions.png"];
  items.forEach(([c, h, b], i) => {
    const x = 1.3 + i * 3.65, y = 2.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.4, h: 3.5, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: c, width: 1.5 } });
    T(s, h, { x: x + 0.15, y: y + 0.15, w: 3.1, h: 0.45, fontSize: 20, bold: true, color: c, align: "center" });
    pic(s, icons[i], x + 0.4, y + 0.7, 2.6, 1.3);
    T(s, b, { x: x + 0.2, y: y + 2.15, w: 3.0, h: 1.2, fontSize: 17, align: "center" });
  });
  }

{ const s = base("2", "Shared?", "And one experiment, based on what the measures show.",
    null,
    "Squeezing changes the model: retrain it with fewer neurons in one layer, same design otherwise. Train A alone, B alone, A and B together at several sizes; find the smallest size that still works. Then run the three measures on each squeezed model.");
  T(s, "Squeezing, a bottleneck", { x: 1.3, y: 2.35, w: 10.7, h: 0.45, fontSize: 22, bold: true, color: BAND, align: "center" });
  pic(s, "icon_squeeze.png", 5.4, 2.85, 2.5, 1.15);
  T(s, "Retrain the model with fewer neurons in one layer. Then ask two things.", { x: 1.3, y: 4.05, w: 10.7, h: 0.4, fontSize: 19, align: "center" });
  [[TEAL, "A. How small can it get?", "Do A and B together need about the sum of A alone and B alone (separate), or about the bigger one (shared)?"],
   [PURPLE, "B. Do the measures change?", "If the overlap goes up as the room shrinks, the PDEs can share. They just don\u2019t when there is room to spare."]]
    .forEach(([c, h, b], i) => {
      const x = 1.3 + i * 5.6, y = 4.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.1, h: 1.95, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: c, width: 1.5 } });
      T(s, h, { x: x + 0.2, y: y + 0.15, w: 4.7, h: 0.45, fontSize: 19, bold: true, color: c, align: "center" });
      T(s, b, { x: x + 0.25, y: y + 0.65, w: 4.6, h: 1.2, fontSize: 16, align: "center" });
    }); }

{ const s = base("2", "Poseidon or Walrus", "I did the three measures on Poseidon. But its U gets in the way. The middle can be dodged through the skips, and real paths are hard to trace.",
    "So I am moving to Walrus. A straight stack of 40 blocks, nothing goes around them.",
    "Each box in the U is 4 blocks, 32 blocks in all. Poseidon (left): encoder, middle, decoder, with skip connections from each encoder stage straight to the decoder. A squeezed middle can be bypassed: Allen-Cahn, the waves and NS already barely used the middle. Removing the skips to force it changes the model we wanted to test (and that run crashed). Walrus (right): encoder, 40 blocks of the same shape on a 32 x 32 grid, decoder. No skips around the blocks, so a removal or squeeze cannot be dodged. Second reason: tracing real paths (connections from block to block) is messy in the U, with skips, patch merging and window attention; in Walrus it is one residual stream through 40 equal blocks. Walrus itself is too big to retrain (96 GPUs), so the squeezing runs on a small model with Walrus's own design, trained with Walrus's code; the three measures run on Walrus itself. The next slides show what the measures gave on Poseidon.");
  T(s, "Poseidon, a U", { x: 0.7, y: 2.65, w: 5.9, h: 0.45, fontSize: 20, bold: true, color: TEAL, align: "center" });
  pic(s, "poseidon_u.png", 0.7, 3.15, 5.9, 3.1);
  T(s, "Walrus, a straight stack", { x: 6.8, y: 2.65, w: 5.9, h: 0.45, fontSize: 20, bold: true, color: PURPLE, align: "center" });
  pic(s, "edp_big.png", 6.8, 3.15, 5.9, 3.1); }

{ const s = base("2", "Neuron activations, how", "Take one neuron. Each dot is one patch, at the height of the number the neuron gives there. Above 0, it fires.",
    "A neuron is silent for a PDE if it (almost) never fires on that PDE\u2019s patches.",
    "Made-up dots. A GELU neuron gives about 0 or a small negative number when it is off, and a positive number when it is on, so above 0 is the natural on/off. Firing rate = the share of a PDE's patches where the neuron fires, over all its test patches. Silent = firing rate below 1%.");
  pic(s, "x_fire.png", 1.3, 2.55, 10.7, 3.8); }

{ const s = base("2", "Neuron activations, Poseidon", "Per layer, the share of neurons that are silent for each PDE. One line per PDE, coloured by type.",
    "In the middle, Allen\u2013Cahn, the waves and NS leave 60 to 80% silent. Poisson and Helmholtz the fewest.",
    "joint2 epoch 40, 128 test examples per PDE (records/joint2_fire_epoch40.npz, 11_firing.py). Middle layers 13-20, silent per PDE: Poisson 45%, Helmholtz 32%, Allen-Cahn 66%, wave G 59%, wave L 60%, Euler G 43%, Euler R 52%, NS 65%. Layers 1-12 and 25-32 mostly below 10%, except Poisson and Helmholtz in the first layers (up to 55%). It flips: at the start the elliptic PDEs leave the most silent, in the middle the fewest. This matches removal and pruning: Allen-Cahn, the waves and NS barely needed the middle (+8-14% error when removed, fine with 90% pruned), they go around it through the skips; Poisson, Helmholtz and Euler use more of the middle and broke when it was removed (+102%, +207%, +279%, +185%). Possible reason (hypothesis): elliptic problems are global, and the middle of the U, with the coarsest patches, is where the whole field is seen at once.");
  pic(s, "fire_silent.png", 1.8, 2.5, 9.7, 3.85); }

{ const s = base("2", "Elliptic against hyperbolic", "The same plot, averaged per type. Elliptic is Poisson and Helmholtz, hyperbolic the two waves and the two Euler sets.",
    "At the start the elliptic PDEs leave many neurons silent, in the middle the hyperbolic ones do.",
    "Average share of silent neurons (firing on under 1% of the PDE's patches). Elliptic: start (layers 1-4) 48%, middle (13-20) 39%, end (29-32) 17%. Hyperbolic: start 2%, middle 54%, end 0%. Allen-Cahn (parabolic) and NS (mixed) are left out here; both behave like the hyperbolic group (middle 66% and 65%).");
  pic(s, "fire_groups.png", 1.8, 2.5, 9.7, 3.85); }

{ const s = base("2", "Are they the same neurons?", "Per pair of PDEs, middle layers. Of the neurons that fire for either, the share that fires for both. Random neurons would give 0.30.",
    "The same equation shares most. Poisson and Helmholtz lean together, wave and Euler do not.",
    "Overlap = |fires for A and fires for B| / |fires for A or fires for B| (Jaccard), fires = firing rate at least 1%, averaged over layers 13-20. Chance (same numbers of neurons, picked at random): 0.30. By kind of pair: same equation 0.76, same type other equation 0.51, different type 0.47. Wave G-wave L 0.91, Euler G-Euler R 0.60, Poisson-Helmholtz 0.59, wave-Euler 0.46-0.52. Allen-Cahn with the waves 0.68 (they also broke together in pruning). Start and end layers: 0.7-0.99 for every pair.");
  pic(s, "fire_pairs.png", 2.3, 2.4, 6.0, 4.0);
  T(s, [{ text: "elliptic", options: { breakLine: true, color: "13A89E", bold: true } },
        { text: "parabolic", options: { breakLine: true, color: "E05A2B", bold: true } },
        { text: "hyperbolic", options: { breakLine: true, color: "9B7FC0", bold: true } },
        { text: "mixed", options: { color: "5A6B7B", bold: true } }],
    { x: 8.7, y: 3.1, w: 3.6, h: 2.4, fontSize: 19, valign: "middle", paraSpaceAfter: 8 }); }

{ const s = base("2", "Paths, what I wanted", "The easy idea. Follow the route the information takes through the network, from the input to the prediction.",
    "In Poseidon\u2019s U that route is hard to follow. So on Poseidon I did a simpler version.",
    "A real route = a chain of connections from layer to layer that the prediction depends on. Methods: edge attribution patching (Syed, Rager and Conmy 2023), ACDC (Conmy et al. 2023). In Poseidon the U skips carry information from the down side straight to the up side, patch merging changes the grid and width between stages, and window attention only connects neighbours, so there is no single route to follow. In Walrus it is one stream through 40 equal blocks, where this works.");
  pic(s, "x_route.png", 1.3, 2.45, 10.7, 3.9); }

{ const s = base("2", "Paths, what I did instead", "Switch one neuron off. Does the prediction change? If it changes a lot, the PDE depends on that neuron.",
    "A PDE\u2019s path is the 10% of neurons it depends on most. Then compare two paths.",
    "Simple idea: switch a neuron off and see how much the prediction changes. Doing that one neuron at a time would take tens of thousands of runs, so we use a shortcut that estimates the same thing for every neuron in one go: importance = |sum over patches of activation x gradient|, the Taylor criterion of Molchanov, Tyree, Karras, Aila and Kautz (ICLR 2017, Pruning convolutional neural networks for resource efficient inference); they use the loss, we use a measure of the PDE prediction. Conductance (Dhamdhere et al. 2019) is the integrated version of the same idea: how much the neuron actually moves this PDE's prediction. The gradient comes from a backward pass. Path = top 10% per layer. Share = |top_A and top_B| / |top_A|. Two unrelated lists of 10% overlap by 10% by chance. Note: this picks important neurons per layer, it does not trace which neuron feeds which. Methods that trace real routes: ACDC (Conmy et al. 2023), edge attribution patching (Syed, Rager and Conmy 2023). In Poseidon the route is hard to follow: the U skips carry information around the middle, patch merging changes grid and width between stages, and window attention only connects neighbours. Walrus has one residual stream of the same width and grid through all 40 blocks, close to the GPT-style models edge attribution patching was built for. Then count how many of these neurons two PDEs share (in the picture they share one).");
  pic(s, "x_switch.png", 1.3, 2.5, 10.7, 3.4);
  }

{ const s = base("2", "Paths, Poseidon", "Left, per layer, how much of their paths two PDEs share, against the same model before training. Right, every pair, in the middle layers.", "Two PDEs share 20% of their paths, 44% before training. Training pulled them apart.",
    "Path = a PDE's top 10% of neurons by importance (activation times gradient). Left: mean over all pairs per layer, trained model vs untrained copy (the same model with its random starting weights, never trained). The untrained copy shows how much sharing the design alone gives; only the difference comes from training. Right: every pair, layers 13-20. Wave G with wave L 71%; Poisson-Helmholtz 27%, Euler G-NS 27%; the rest 14-24%. Unrelated lists: 10%.");
  pic(s, "paths3_layers.png", 0.8, 2.5, 6.5, 3.85);
  pic(s, "paths3_pairs.png", 7.5, 2.45, 5.0, 3.95); }

{ const s = base("2", "Directions, how", "Every patch of a PDE is a point, one axis per neuron. Its points form a cloud, and the cloud spreads out in some directions.",
    "If two PDEs spread along the same directions, they share that part of the layer.",
    "Made-up clouds in 2 neurons; a real layer has 1,536 neurons and a PDE spreads along many directions. Per PDE and layer: subtract the PDE's mean (Chang, Tu and Bergen 2022), PCA, keep the directions that hold 90% of the spread. Overlap phi between two PDEs, 0 to 1 (Hu et al. 2021).");
  pic(s, "x_directions.png", 1.3, 2.5, 10.7, 3.85); }

{ const s = base("2", "Directions, Poseidon", "Left, per layer, how much two PDEs\u2019 directions overlap, 1 the same, 0 at right angles. Right, every pair, in the middle.",
    "Only the two waves share their directions. Wave and Euler, both hyperbolic, barely overlap.",
    "Left: overlap phi of the directions (principal components, 90% of variance) per layer, mean over 28 pairs; middle 0.14-0.22, start and end about 0.6. Right: phi per pair, mean over layers 13-20, names coloured by type, the same format as the neuron heatmap. Wave G-wave L 0.79, Allen-Cahn with the waves 0.26-0.28, Poisson-Helmholtz 0.24, Euler G-Euler R 0.20, wave with Euler 0.08-0.09. By kind of pair: same equation 0.49, same type other equation 0.12, different type 0.15. Removal agrees: Poisson, Helmholtz and Euler break most when their own directions are removed (+102%, +207%, +279%, +185%).");
  pic(s, "c1_overlap.png", 0.8, 2.5, 5.6, 3.85);
  pic(s, "dir_pairs.png", 6.9, 2.4, 5.6, 4.0); }

// 13-14 ---------------------------------------------------------------- internal representation
divider("3", "Internal representation");

base("3", "Internal representation", null, null, "Placeholder. Paste your own slides on internal representation here.");

// 15 ---------------------------------------------------------------- thanks
{ const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 6.2, h: 7.5, fill: { color: BAND }, line: { color: BAND } });
  T(s, "Thank you for listening!", { x: 7.4, y: 2.4, w: 5.3, h: 2.6, fontSize: 54, bold: true, align: "center", valign: "middle" }); }

pres.writeFile({ fileName: path.join(__dirname, "../../Weekly 04_11_2026.pptx") }).then((f) => console.log("wrote", f));
