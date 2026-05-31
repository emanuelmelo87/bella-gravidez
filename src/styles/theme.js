export const PALETTES = {
  "rosa-bella": {
    vinho:  "#4e2b53",
    taupe:  "#ab9d95",
    bege:   "#eed1b8",
    rosa:   "#c38a97",
    verde:  "#9fb0a0",
    bg:     "#f7ece0",
  },
  "azul-serenidade": {
    vinho:  "#1e3a5f",
    taupe:  "#7a9ab5",
    bege:   "#b8d4e8",
    rosa:   "#6faacc",
    verde:  "#7fb0a0",
    bg:     "#e8f4f8",
  },
  "verde-natureza": {
    vinho:  "#2d4a3e",
    taupe:  "#7a9a88",
    bege:   "#b8d4c0",
    rosa:   "#7fb08a",
    verde:  "#9fb0a0",
    bg:     "#f0f5f0",
  },
  "dourado-suave": {
    vinho:  "#5c3d11",
    taupe:  "#a08060",
    bege:   "#e8d0a0",
    rosa:   "#d4a853",
    verde:  "#a0b080",
    bg:     "#fdf6e3",
  },
  "coral-vibrante": {
    vinho:  "#7d2c2c",
    taupe:  "#b08080",
    bege:   "#f0c0b0",
    rosa:   "#e07060",
    verde:  "#a0b090",
    bg:     "#fdf0ee",
  },
};

export const PALETTE_LABELS = {
  "rosa-bella":       "🌸 Rosa Bella",
  "azul-serenidade":  "🌊 Azul Serenidade",
  "verde-natureza":   "🌿 Verde Natureza",
  "dourado-suave":    "☀️ Dourado Suave",
  "coral-vibrante":   "🌺 Coral Vibrante",
};

export const SF = "'Cormorant Garamond',Georgia,serif";

export function getColors(paletteName = "rosa-bella") {
  return PALETTES[paletteName] ?? PALETTES["rosa-bella"];
}

export function buildCSS(C) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans','Segoe UI',sans-serif;background:${C.bg};-webkit-font-smoothing:antialiased}
.R{max-width:480px;margin:0 auto;min-height:100dvh;background:${C.bg};position:relative}
@media(min-width:481px){.R{border-left:1px solid ${C.bege};border-right:1px solid ${C.bege};box-shadow:0 0 60px rgba(78,43,83,.1)}}
.HDR{background:${C.vinho};position:relative;overflow:hidden}
.HDR::after{content:'';position:absolute;bottom:-1px;left:-5%;width:110%;height:36px;background:${C.bg};border-radius:50% 50% 0 0/100% 100% 0 0}
.HT{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0}
.brand{font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:300;color:${C.bege};letter-spacing:.5px}
.brand em{font-style:italic;color:${C.rosa}}
.hcfg{width:34px;height:34px;border-radius:50%;background:rgba(238,209,184,.12);border:none;cursor:pointer;color:${C.bege};font-size:15px;display:flex;align-items:center;justify-content:center}
.WHO{text-align:center;padding:20px 20px 46px}
.wey{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(238,209,184,.55);margin-bottom:3px}
.wbig{font-family:'Cormorant Garamond',Georgia,serif;font-size:84px;font-weight:300;color:${C.bege};line-height:1}
.wunit{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:${C.rosa}}
.wmeta{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px}
.tribadge{font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;padding:3px 11px;border-radius:20px;border:1px solid}
.wdays{font-size:12px;color:rgba(238,209,184,.5)}
.SCR{padding:0 16px 100px;display:flex;flex-direction:column;gap:14px}
.card{background:white;border-radius:20px;padding:18px;box-shadow:0 2px 14px rgba(78,43,83,.07);border:1px solid rgba(195,138,151,.08)}
.ctit{font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:400;color:${C.vinho};margin-bottom:12px;display:flex;align-items:center;gap:8px}
.pbar{height:7px;background:${C.bege};border-radius:99px;overflow:hidden;margin:6px 0}
.pfill{height:100%;background:linear-gradient(90deg,${C.rosa},${C.vinho});border-radius:99px;transition:width 1s ease}
.srow{display:flex;gap:10px;margin-top:12px}
.sbox{flex:1;text-align:center;background:rgba(238,209,184,.3);border-radius:12px;padding:10px 6px}
.sn{font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;color:${C.vinho};display:block;line-height:1}
.sl{font-size:9px;color:${C.taupe};text-transform:uppercase;letter-spacing:1px;margin-top:3px;display:block}
.NAV{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:white;border-top:1px solid ${C.bege};display:flex;padding:8px 0 14px;z-index:100;box-shadow:0 -4px 20px rgba(78,43,83,.08)}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:4px 0}
.ni{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;transition:all .2s}
.nb.A .ni{background:${C.vinho}}
.nl{font-size:9px;font-weight:500;color:${C.taupe};letter-spacing:.3px}
.nb.A .nl{color:${C.vinho}}
.inp{width:100%;padding:12px 14px;border:1.5px solid ${C.bege};border-radius:12px;background:rgba(238,209,184,.15);font-family:'DM Sans',sans-serif;font-size:14px;color:${C.vinho};outline:none;transition:border-color .2s}
.inp:focus{border-color:${C.rosa}}
.inp::placeholder{color:${C.taupe};opacity:.7}
.lbl{display:block;font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:${C.taupe};margin-bottom:6px}
.fg{margin-bottom:14px}
.btnp{width:100%;padding:14px;background:${C.vinho};color:${C.bege};border:none;border-radius:14px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer}
.btnp:disabled{opacity:.35;cursor:not-allowed}
.btno{padding:10px 16px;background:transparent;color:${C.taupe};border:1.5px solid ${C.bege};border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer}
.skip{width:100%;padding:12px;background:transparent;color:${C.taupe};border:1.5px solid ${C.bege};border-radius:14px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:8px}
.OVL{position:fixed;inset:0;background:rgba(78,43,83,.45);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end}
.MDL{background:white;border-radius:24px 24px 0 0;padding:20px 20px 40px;width:100%;max-width:480px;margin:0 auto;animation:su .3s ease;max-height:88vh;overflow-y:auto}
.mh{width:36px;height:4px;background:${C.bege};border-radius:2px;margin:0 auto 18px}
.mt{font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;color:${C.vinho};margin-bottom:4px}
.ms{font-size:13px;color:${C.taupe};margin-bottom:18px;line-height:1.5}
@keyframes su{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
.mgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
.mbe{display:flex;flex-direction:column;align-items:center;padding:10px 4px;border-radius:14px;border:1.5px solid transparent;background:${C.bege}33;cursor:pointer;transition:all .2s}
.mbe.S{background:rgba(195,138,151,.15);border-color:${C.rosa}}
.stabs{display:flex;background:${C.bege}44;border-radius:12px;padding:4px;gap:4px;margin-bottom:16px}
.stab{flex:1;padding:9px 4px;background:transparent;border:none;border-radius:10px;font-size:11px;font-family:'DM Sans',sans-serif;color:${C.taupe};cursor:pointer;font-weight:500}
.stab.A{background:${C.vinho};color:white}
.LI{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid ${C.bege}55}
.LI:last-child{border-bottom:none}
.liic{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;background:${C.bege}55}
.dcard{background:white;border-radius:18px;padding:16px;border:1px solid rgba(195,138,151,.1);box-shadow:0 2px 10px rgba(78,43,83,.06)}
.kbtn{width:150px;height:150px;border-radius:50%;background:linear-gradient(135deg,${C.rosa},${C.vinho});border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(78,43,83,.28);transition:all .12s;margin:0 auto}
.kbtn:active{transform:scale(.92)}
.wchips{display:flex;gap:8px;overflow-x:auto;padding:4px 0;scrollbar-width:none}
.wchips::-webkit-scrollbar{display:none}
.wchip{flex-shrink:0;padding:7px 13px;border-radius:20px;font-size:12px;border:1.5px solid ${C.bege};background:transparent;cursor:pointer;color:${C.taupe}}
.wchip.A{background:${C.vinho};color:white;border-color:${C.vinho}}
.cki{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid ${C.bege}33}
.cki:last-child{border-bottom:none}
.cb{width:20px;height:20px;border-radius:6px;border:2px solid ${C.bege};background:transparent;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.cb.C{background:${C.verde};border-color:${C.verde}}
.chip{display:inline-flex;padding:6px 12px;border-radius:20px;border:1.5px solid ${C.bege};font-size:12px;cursor:pointer;background:transparent;color:${C.taupe}}
.chip.S{background:${C.rosa}22;border-color:${C.rosa};color:${C.vinho}}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pthumb{aspect-ratio:1;border-radius:14px;overflow:hidden;background:${C.bege}33;display:flex;align-items:center;justify-content:center;border:1.5px solid ${C.bege};cursor:pointer;position:relative}
.pthumb img{width:100%;height:100%;object-fit:cover}
.padd{aspect-ratio:1;border-radius:14px;border:1.5px dashed ${C.rosa}66;background:rgba(195,138,151,.06);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:4px;font-size:22px;color:${C.rosa}}
.emp{text-align:center;padding:36px 16px}
.WSCRN{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;background:linear-gradient(160deg,${C.bege} 0%,#f5e2d0 100%)}
.wcrd{background:rgba(255,255,255,.8);backdrop-filter:blur(12px);border:1px solid rgba(195,138,151,.18);border-radius:24px;padding:28px 22px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(78,43,83,.1)}
.tbns{display:flex;gap:8px;margin-bottom:16px}
.tbtn{flex:1;padding:10px 6px;border-radius:10px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500}
.ndb{background:linear-gradient(135deg,${C.rosa}18,${C.bege}44);border:1.5px dashed ${C.rosa}55;border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer}
.toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:${C.vinho};color:${C.bege};padding:10px 20px;border-radius:20px;font-size:13px;z-index:400;animation:ta 2.3s ease forwards;white-space:nowrap}
@keyframes ta{0%{opacity:0;transform:translateX(-50%) translateY(8px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}75%{opacity:1}100%{opacity:0}}
@keyframes kp{0%,100%{box-shadow:0 8px 32px rgba(78,43,83,.28)}50%{box-shadow:0 8px 48px rgba(78,43,83,.4),0 0 0 14px rgba(195,138,151,.12)}}
.kP{animation:kp 1.8s ease infinite}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .35s ease both}
`;
}
