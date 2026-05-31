import sharp from "sharp";

// Ícone: fundo vinho com flor/coração em bege (identidade do app)
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#4e2b53"/>
  <g transform="translate(256,268)">
    <path d="M0,70 C-60,20 -110,-30 -70,-78 C-46,-106 -10,-96 0,-60 C10,-96 46,-106 70,-78 C110,-30 60,20 0,70 Z"
          fill="#c38a97"/>
    <circle cx="0" cy="-86" r="26" fill="#eed1b8"/>
  </g>
  <text x="256" y="430" font-family="Georgia, serif" font-size="58" fill="#eed1b8"
        text-anchor="middle" font-style="italic">Bella</text>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(buf).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(buf).resize(180, 180).png().toFile("public/apple-touch-icon.png");

console.log("✅ Ícones gerados: icon-192, icon-512, apple-touch-icon");
