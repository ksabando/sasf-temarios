const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');

function walk(dir, predicate) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (!predicate || predicate(full)) out.push(full);
  }
  return out;
}

// ─── 1. orden-recomendado → private ─────────────────────────
{
  const f = path.join(docs, 'orden-recomendado.md');
  let t = fs.readFileSync(f, 'utf8');
  if (!t.startsWith('---\n')) t = '---\n' + t;
  const lines = t.split('\n');
  // Find index of second '---' (end of frontmatter)
  let fmEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { fmEnd = i; break; }
  }
  if (fmEnd > 0) {
    const fm = lines.slice(1, fmEnd);
    const hasPrivate = fm.some(l => l.startsWith('private:'));
    if (!hasPrivate) {
      fm.splice(1, 0, 'private: true');
      fm.splice(2, 0, 'sidebar_class_name: private');
    }
    const body = lines.slice(fmEnd + 1).join('\n');
    t = '---\n' + fm.join('\n') + '\n---\n' + body;
    fs.writeFileSync(f, t, 'utf8');
    console.log('1. orden-recomendado → private: true');
  }
}

// ─── 2. Remove "de Cero a Experto" from _category_.json ─────
{
  const categories = walk(docs, f => f.endsWith('_category_.json'));
  let n = 0;
  for (const f of categories) {
    let t = fs.readFileSync(f, 'utf8');
    const orig = t;
    t = t
      .replace(/"label":\s*"(.+?)(?: de Cero a Experto)?"/g, (m, name) =>
        `"label": "${name.replace(/ de Cero a Experto$/, '')}"`
      )
      .replace(/"title":\s*"(.+?)(?: de Cero a Experto)?"/g, (m, name) =>
        `"title": "${name.replace(/ de Cero a Experto$/, '')}"`
      );
    if (t !== orig) { fs.writeFileSync(f, t, 'utf8'); n++; }
  }
  console.log(`2. "de Cero a Experto" eliminado de ${n} _category_.json`);
}

// ─── 3. Remove "M01 — " prefix from module _category_.json ──
{
  const modules = walk(docs, f => f.includes(path.sep + 'modulos' + path.sep) && f.endsWith('_category_.json'));
  let n = 0;
  for (const f of modules) {
    let t = fs.readFileSync(f, 'utf8');
    const orig = t;
    t = t.replace(/"label":\s*"M\d+\s*[—–-]\s*/g, '"label": "');
    if (t !== orig) { fs.writeFileSync(f, t, 'utf8'); n++; }
  }
  console.log(`3. "M01 — " eliminado de ${n} _category_.json de módulos`);
}

// ─── 4. Capitalize first letter of module labels ────────────
{
  const modules = walk(docs, f => f.includes(path.sep + 'modulos' + path.sep) && f.endsWith('_category_.json'));
  let n = 0;
  for (const f of modules) {
    let t = fs.readFileSync(f, 'utf8');
    const orig = t;
    t = t.replace(/"label":\s*"([a-z])/g, (_, c) => `"label": "${c.toUpperCase()}`);
    if (t !== orig) { fs.writeFileSync(f, t, 'utf8'); n++; }
  }
  console.log(`4. Capitalización corregida en ${n} archivos`);
}

// ─── 5. Set libros position to 3, modulos position to 4 ────
{
  // libros.md → position 3
  for (const f of walk(docs, f => f.endsWith('libros.md'))) {
    let t = fs.readFileSync(f, 'utf8');
    t = t.replace(/sidebar_position:\s*\d+/, 'sidebar_position: 3');
    if (!/\bsidebar_position:/.test(t)) {
      const lines = t.split('\n');
      // Add after first ---
      const idx = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
      if (idx > 0) {
        lines.splice(idx, 0, 'sidebar_position: 3');
        t = lines.join('\n');
      }
    }
    fs.writeFileSync(f, t, 'utf8');
  }

  // modulos/ _category_.json → position: 4
  for (const f of walk(docs, f => f.endsWith(path.sep + 'modulos' + path.sep + '_category_.json'))) {
    let t = fs.readFileSync(f, 'utf8');
    if (!t.includes('"position"')) {
      t = t.replace(/"label"/, '"position": 4,\n  "label"');
      fs.writeFileSync(f, t, 'utf8');
    }
  }
  console.log('5. Sidebar positions actualizadas');
}

// ─── 6. Fix duplicated frontmatter ──────────────────────────
{
  for (const f of walk(docs, f => f.endsWith('.md'))) {
    let t = fs.readFileSync(f, 'utf8');
    // Check for multiple --- blocks at the start
    const idx1 = t.indexOf('---\n', 1);
    if (idx1 === -1) continue;
    const idx2 = t.indexOf('---\n', idx1 + 4);
    if (idx2 === -1) continue;
    const idx3 = t.indexOf('---\n', idx2 + 4);
    if (idx3 === -1) continue;

    // Found pattern: --- fm --- body --- something ---
    // Take only the first frontmatter block
    const fm = t.slice(4, idx1).trim();
    const body = t.slice(idx3 + 4);
    const newT = `---\n${fm}\n---\n${body}`;
    if (newT !== t) {
      fs.writeFileSync(f, newT, 'utf8');
      console.log('6. Frontmatter duplicado corregido: ' + path.relative(docs, f));
    }
  }
}

console.log('\n✓ Todos los cambios aplicados');
