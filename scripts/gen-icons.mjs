import sharp from "sharp";
import { writeFileSync } from "fs";
import { ICON_SVG } from "./icon-svg.mjs";

const buf = Buffer.from(ICON_SVG);

// Ícones PNG do app (PWA / tela inicial / Android / iOS)
await sharp(buf).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(buf).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(buf).resize(180, 180).png().toFile("public/apple-touch-icon.png");

// Favicon da aba (SVG escalável)
writeFileSync("public/favicon.svg", ICON_SVG.trim() + "\n");

console.log("✅ Ícones gerados: favicon.svg, icon-192, icon-512, apple-touch-icon");
