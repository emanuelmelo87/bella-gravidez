import sharp from "sharp";
import { existsSync } from "fs";
import { ICON_SVG } from "./icon-svg.mjs";

// Se existir a imagem do Recraft em scripts/icon-source.(png|jpg), usa ela.
// Senão, cai para o SVG desenhado.
const candidates = ["scripts/icon-source.png", "scripts/icon-source.jpg", "scripts/icon-source.jpeg"];
const src = candidates.find(existsSync);
const input = src ? src : Buffer.from(ICON_SVG);
console.log(src ? `Usando imagem: ${src}` : "Usando SVG desenhado (nenhuma imagem encontrada)");

// Ícones do app (PWA / tela inicial / Android / iOS) + favicon PNG da aba
await sharp(input).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(input).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(input).resize(180, 180).png().toFile("public/apple-touch-icon.png");
await sharp(input).resize(64, 64).png().toFile("public/favicon.png");

console.log("✅ Gerados: favicon.png, icon-192, icon-512, apple-touch-icon");
