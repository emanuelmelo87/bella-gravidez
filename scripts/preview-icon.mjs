import sharp from "sharp";

const C = { vinho:"#4e2b53", bege:"#eed1b8", rosa:"#c38a97" };

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${C.vinho}"/>
  <g transform="translate(14,6)">
    <!-- cabelo solto pelas costas -->
    <path fill="${C.bege}" d="
      M236,96 C198,98 178,128 182,166 C166,214 164,290 182,346
      C188,362 204,366 214,356 C200,318 196,260 208,210
      C214,180 226,160 244,158 C242,128 240,110 236,96 Z"/>
    <!-- cabeça -->
    <circle cx="236" cy="132" r="38" fill="${C.bege}"/>
    <!-- corpo + barriga -->
    <path fill="${C.bege}" d="
      M226,168 C204,192 196,236 204,284 C209,322 205,352 228,372
      L228,424 Q228,438 243,438 L300,438 Q313,438 313,424 L313,360
      C352,349 365,310 350,268 C342,244 322,232 305,224
      C291,214 282,196 278,180 Q274,168 260,168 Z"/>
    <!-- coração (mãos) em rosa, emoldurado pelos braços -->
    <path fill="${C.rosa}" d="
      M300,252 C293,235 268,235 268,256 C268,274 290,290 300,302
      C310,290 332,274 332,256 C332,235 307,235 300,252 Z"/>
    <!-- braço de trás contornando o lobo esquerdo do coração -->
    <path fill="none" stroke="${C.bege}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
      d="M236,196 C254,206 264,228 266,250 C268,272 284,290 300,303"/>
    <!-- braço da frente contornando o lobo direito -->
    <path fill="none" stroke="${C.bege}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
      d="M338,212 C340,232 337,247 333,253 C326,270 313,289 300,303"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("scripts/_preview-icon.png");
console.log("ok");
