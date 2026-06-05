import sharp from "sharp";

// Casinha flat com coração — combina com o ícone do diário
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- telhado -->
  <path d="M256,70 L470,250 a18,18 0 0 1 -11,32 L53,282 a18,18 0 0 1 -11,-32 Z" fill="#c3667f"/>
  <!-- parede -->
  <rect x="98" y="250" width="316" height="208" rx="30" fill="#f7d9bf"/>
  <!-- porta -->
  <rect x="210" y="330" width="92" height="128" rx="22" fill="#4e2b53"/>
  <!-- coração na porta -->
  <path d="M256,372
    c-10,-17 -34,-11 -34,8
    c0,15 19,27 34,40
    c15,-13 34,-25 34,-40
    c0,-19 -24,-25 -34,-8 Z" fill="#f7d9bf"/>
  <!-- janelinhas -->
  <circle cx="150" cy="350" r="20" fill="#f7e06a"/>
  <circle cx="362" cy="350" r="20" fill="#f7e06a"/>
</svg>`;

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icon-home.png");
console.log("ok");
