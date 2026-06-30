const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');

function walk(dir, predicate) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, predicate));
    } else if (!predicate || predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function cleanText(text) {
  let next = text;

  // Drop badly decoded box-drawing/diagram lines instead of rendering noise.
  next = next
    .split(/\r?\n/)
    .filter((line) => (line.match(/�/g) || []).length < 3)
    .join('\n');

  const replacements = [
    ['XML�?�O-', 'XML'],
    ['�?�O-', ''],
    ['�?"', '—'],
    ['�?\'', '→'],
    ['�o.', 'OK'],
    ['�s�️', 'Revisar'],
    ['�s', 'Revisar'],
    ['�O', 'Repetir'],
    ['�Y"�', '-'],
    ['�Y"~', '-'],
    ['�YO�', '-'],
    ['�Y��', '-'],
    ['�Y"<', '-'],
    ['�YZ�', '-'],
    ['�Y""', '-'],
    ['�"', '—'],
    ['-"', '—'],
  ];

  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }

  next = next
    .replace(/XML\?+O-/g, 'XML')
    .replace(/\s+\?+"\s+/g, ' — ')
    .replace(/�/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  return next;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) {
    return { attrs: {}, body: text, hasFrontmatter: false };
  }
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) {
    return { attrs: {}, body: text, hasFrontmatter: false };
  }
  const raw = text.slice(4, end).trim();
  const body = text.slice(end + 5);
  const attrs = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) attrs[match[1]] = match[2];
  }
  return { attrs, body, hasFrontmatter: true };
}

function stringifyFrontmatter(attrs, body) {
  const lines = Object.entries(attrs).map(([key, value]) => `${key}: ${value}`);
  return `---\n${lines.join('\n')}\n---\n${body.startsWith('\n') ? body : `\n${body}`}`;
}

function sidebarLabelFor(file) {
  const name = path.basename(file).toLowerCase();
  if (name === 'plan-accion.md') return 'Plan de Acción';
  if (name === 'temario.md') return 'Temario';
  if (name === 'libros.md') return 'Libros';
  if (name === 'clase.md') return 'Clase';
  if (name === 'ejercicio.md') return 'Ejercicio';
  if (name === 'cuestionario.md') return 'Cuestionario';
  if (name === 'respuesta.md') return 'Soluciones';
  return null;
}

let cleaned = 0;
let labeled = 0;

for (const file of walk(docs, (f) => f.endsWith('.md'))) {
  const original = fs.readFileSync(file, 'utf8');
  let text = cleanText(original);

  const label = sidebarLabelFor(file);
  if (label) {
    const parsed = parseFrontmatter(text);
    const before = parsed.attrs.sidebar_label;
    parsed.attrs.sidebar_label = JSON.stringify(label);
    text = stringifyFrontmatter(parsed.attrs, parsed.body);
    if (before !== parsed.attrs.sidebar_label) labeled++;
  }

  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    cleaned++;
  }
}

console.log(`Files rewritten: ${cleaned}`);
console.log(`Sidebar labels updated: ${labeled}`);
