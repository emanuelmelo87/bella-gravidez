import sharp from "sharp";
import { ICON_SVG } from "./icon-svg.mjs";

await sharp(Buffer.from(ICON_SVG)).resize(512, 512).png().toFile("scripts/_preview-icon.png");
console.log("ok");
