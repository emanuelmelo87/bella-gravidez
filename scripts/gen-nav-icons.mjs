import sharp from "sharp";

const ROSA = "#c38a97";
const S = (inner) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"
  fill="none" stroke="${ROSA}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  ${inner}
</svg>`;

const ICONS = {
  // Contrações — cronômetro
  "icon-contractions": `
    <line x1="12" y1="2.5" x2="12" y2="5"/>
    <line x1="9.5" y1="2.5" x2="14.5" y2="2.5"/>
    <line x1="19" y1="5.5" x2="20.5" y2="4"/>
    <circle cx="12" cy="13" r="8"/>
    <line x1="12" y1="13" x2="12" y2="8.5"/>
    <line x1="12" y1="13" x2="15" y2="14.5"/>`,
  // Parto — estrela
  "icon-birth": `
    <polygon points="12 2.5 14.85 8.4 21.3 9.3 16.6 13.85 17.75 20.3 12 17.25 6.25 20.3 7.4 13.85 2.7 9.3 9.15 8.4"/>`,
  // Bebê — mamadeira
  "icon-baby": `
    <rect x="8" y="8.5" width="8" height="12.5" rx="2.2"/>
    <path d="M10 8.5 V6.2 a2 2 0 0 1 4 0 V8.5"/>
    <line x1="8.3" y1="12" x2="15.7" y2="12"/>
    <line x1="10" y1="15" x2="14" y2="15"/>`,
  // Saúde — cruz médica
  "icon-health": `
    <circle cx="12" cy="12" r="9"/>
    <line x1="12" y1="7.5" x2="12" y2="16.5"/>
    <line x1="7.5" y1="12" x2="16.5" y2="12"/>`,
};

for (const [name, inner] of Object.entries(ICONS)) {
  await sharp(Buffer.from(S(inner))).resize(512, 512).png().toFile(`public/${name}.png`);
}
console.log("✅ ícones de nav gerados:", Object.keys(ICONS).join(", "));
