// Isolate ink while excluding camera letterboxing and paper edges.
function segmentInk(rgba, size, sensitivity = 140) {
  const gray = new Uint8Array(size * size), hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) {
    // The darkest channel retains colored marker strokes as well as black ink.
    gray[i] = Math.min(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]);
    if (gray[i] > 35) hist[gray[i]]++;
  }
  let total = 0, sum = 0;
  for (let v = 36; v < 256; v++) { total += hist[v]; sum += v * hist[v]; }
  let n = 0, partial = 0, best = -1, cutoff = 140;
  for (let v = 36; v < 255; v++) {
    n += hist[v]; partial += v * hist[v];
    if (!n || n === total) continue;
    const d = partial / n - (sum - partial) / (total - n);
    const score = n * (total - n) * d * d;
    if (score > best) { best = score; cutoff = (partial / n + (sum - partial) / (total - n)) / 2; }
  }
  cutoff = Math.max(40, Math.min(230, cutoff + (sensitivity - 140) * .4));
  const mask = Uint8Array.from(gray, v => v <= cutoff ? 1 : 0);
  const seen = new Uint8Array(mask.length), candidates = [];
  for (let seed = 0; seed < mask.length; seed++) {
    if (!mask[seed] || seen[seed]) continue;
    const pixels = [seed]; seen[seed] = 1;
    let x0 = size, y0 = size, x1 = 0, y1 = 0, border = false;
    for (let j = 0; j < pixels.length; j++) {
      const p = pixels[j], x = p % size, y = Math.floor(p / size);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      if (x < 2 || y < 2 || x >= size - 2 || y >= size - 2) border = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, q = ny * size + nx;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || seen[q] || !mask[q]) continue;
        seen[q] = 1; pixels.push(q);
      }
    }
    if (!border && pixels.length >= 35 && y1 - y0 >= 10 && pixels.length < size * size * .55)
      candidates.push({ pixels, x0, y0, x1, y1 });
  }
  candidates.sort((a, b) => b.pixels.length - a.pixels.length);
  const digit = candidates[0];
  if (!digit) return null;
  // Reject essentially uniform regions rather than confidently classifying a shadow.
  let inside = 0;
  for (const p of digit.pixels) inside += gray[p];
  const paper = total ? sum / total : 0;
  if (paper - inside / digit.pixels.length < 15) return null;
  const clean = new Uint8ClampedArray(rgba.length);
  for (let i = 3; i < clean.length; i += 4) clean[i] = 255;
  for (const p of digit.pixels) clean[p * 4] = clean[p * 4 + 1] = clean[p * 4 + 2] = 255;
  return { ...digit, data: clean };
}
if (typeof module !== 'undefined') module.exports = segmentInk;
