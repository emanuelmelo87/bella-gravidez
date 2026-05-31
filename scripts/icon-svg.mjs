// Ícone Bella Gravidez — silhueta de grávida de perfil com as mãos
// formando um coração na frente da barriga. Cores da identidade.
const C = { vinho: "#4e2b53", bege: "#eed1b8", rosa: "#c38a97" };

export const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${C.vinho}"/>
  <g transform="translate(12,4)">
    <!-- cabelo solto pelas costas -->
    <path fill="${C.bege}" d="
      M238,92 C198,94 177,126 181,166 C164,216 162,294 181,352
      C187,369 204,373 215,362 C200,322 196,262 209,210
      C215,179 228,158 247,156 C245,126 242,108 238,92 Z"/>
    <!-- cabeça -->
    <circle cx="238" cy="130" r="39" fill="${C.bege}"/>
    <!-- corpo + barriga -->
    <path fill="${C.bege}" d="
      M228,166 C205,191 197,236 205,286 C210,325 206,355 230,375
      L230,426 Q230,440 245,440 L304,440 Q317,440 317,426 L317,360
      C357,349 371,308 355,266 C346,241 325,229 308,221
      C293,210 284,192 280,176 Q276,166 262,166 Z"/>
    <!-- braços (com leve contorno vinho p/ separar do corpo) formando o coração -->
    <path fill="${C.bege}" stroke="${C.vinho}" stroke-width="5" stroke-linejoin="round" d="
      M250,200
      C228,210 214,232 226,250
      C234,262 250,262 262,256
      C300,272 318,256 318,232
      C318,214 300,206 288,216
      C282,206 268,196 250,200 Z"/>
    <!-- coração (mãos) em rosa -->
    <path fill="${C.rosa}" d="
      M300,256 C294,242 272,244 272,261 C272,276 290,289 300,300
      C310,289 328,276 328,261 C328,244 306,242 300,256 Z"/>
  </g>
</svg>`;
