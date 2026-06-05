import sharp from "sharp";

// Caderninho/diário rosa com coração branco e abas amarelas
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- página de trás (sombra clara) -->
  <rect x="150" y="70" width="320" height="400" rx="40" fill="#f3f1ef"/>
  <!-- capa do diário -->
  <rect x="120" y="40" width="320" height="430" rx="40" fill="#f79ac0"/>
  <!-- lombada (faixa mais escura à esquerda) -->
  <path d="M120,80 a40,40 0 0 1 40,-40 h20 v430 h-20 a40,40 0 0 1 -40,-40 Z" fill="#f37bac"/>
  <!-- abas amarelas -->
  <rect x="40" y="95"  width="95" height="70" rx="22" fill="#f7e06a"/>
  <rect x="40" y="220" width="95" height="70" rx="22" fill="#f7e06a"/>
  <rect x="40" y="345" width="95" height="70" rx="22" fill="#f7e06a"/>
  <!-- coração branco -->
  <path d="M300,200
    c-18,-34 -70,-22 -70,16
    c0,30 38,54 70,82
    c32,-28 70,-52 70,-82
    c0,-38 -52,-50 -70,-16 Z" fill="#ffffff"/>
</svg>`;

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icon-diary.png");
console.log("ok");
