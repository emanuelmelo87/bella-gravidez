import { useState, useEffect, useRef } from "react";

const C = { vinho:"#4e2b53", taupe:"#ab9d95", bege:"#eed1b8", rosa:"#c38a97", verde:"#9fb0a0", bg:"#f7ece0" };
const SF = "'Cormorant Garamond',Georgia,serif";

const WEEKS = {
  4:{e:"🫐",f:"Mirtilo",o:"grão de pimenta",s:"2mm",d:"Implantação completa. Coração começa a se formar. Saco amniótico presente."},
  5:{e:"🌱",f:"Semente de maçã",o:"feijão",s:"4mm",d:"Sistema nervoso em desenvolvimento. Pequenas aletas das mãos surgem."},
  6:{e:"🫒",f:"Azeitona",o:"comprimido",s:"6mm",d:"Coração bate ~105x/min. Olhos e ouvidos começam a aparecer."},
  7:{e:"🍇",f:"Uva",o:"clipe de papel",s:"1cm",d:"Mãos e pés surgem como aletas. Cérebro cresce rapidamente."},
  8:{e:"🍓",f:"Morango",o:"azeitona grande",s:"1.6cm",d:"Dedos se formam. Movimentos espontâneos iniciam. Nariz aparece."},
  9:{e:"🍒",f:"Cereja",o:"uva grande",s:"2.3cm",d:"Agora é chamado de feto! Órgãos internos quase completos."},
  10:{e:"🫐",f:"Amora",o:"mini ovo",s:"3.1cm",d:"Unhas começam a crescer. Reflexos primitivos aparecem."},
  11:{e:"🍑",f:"Pêssego mini",o:"metade de bola de golfe",s:"4.1cm",d:"Bebê pode abrir e fechar os punhos. Ossos endurecem."},
  12:{e:"🍋",f:"Limão",o:"bola de golfe ⛳",s:"5.4cm",d:"Fim do 1° trimestre! Rins funcionam. Bebê pode chupar o polegar."},
  13:{e:"🍊",f:"Tangerina",o:"ovo de galinha",s:"7.4cm",d:"Impressões digitais únicas se formam."},
  14:{e:"🍎",f:"Maçã pequena",o:"mini celular",s:"8.7cm",d:"Bebê faz caretas. Sexo começa a ser identificado."},
  15:{e:"🍐",f:"Pera",o:"laranja",s:"10.1cm",d:"Cabelo e sobrancelhas crescem. Bebê ouve sons externos."},
  16:{e:"🥑",f:"Abacate",o:"cebola média",s:"11.6cm",d:"Você já pode sentir os movimentos! Olhos começam a se mover."},
  17:{e:"🍠",f:"Batata-doce",o:"batata grande",s:"13cm",d:"Gordura começa a acumular. Bebê dorme e acorda regularmente."},
  18:{e:"🫑",f:"Pimentão",o:"pimentão",s:"14.2cm",d:"Sistema nervoso amadurece. Bebê reage a sons e luz."},
  19:{e:"🥭",f:"Manga",o:"régua 15cm",s:"15.3cm",d:"Todos os sentidos se desenvolvem. Movimentos mais frequentes."},
  20:{e:"🍌",f:"Banana",o:"banana",s:"16.4cm",d:"Metade da gravidez! Semana do ultrassom morfológico."},
  21:{e:"🥕",f:"Cenoura",o:"cenoura grande",s:"26.7cm",d:"Bebê engole líquido amniótico. Sobrancelhas visíveis."},
  22:{e:"🌽",f:"Milho pequeno",o:"esquadro escolar",s:"27.8cm",d:"Pele translúcida. Lábios e pálpebras bem definidos."},
  23:{e:"🍆",f:"Berinjela mini",o:"frasco de shampoo",s:"28.9cm",d:"Soluços frequentes. Bebê reage a músicas e vozes."},
  24:{e:"🌽",f:"Espiga de milho",o:"livro fino",s:"30cm",d:"Pulmões praticam respiração. Papilas gustativas formadas."},
  25:{e:"🥦",f:"Brócolis",o:"bola de tênis 🎾",s:"34.6cm",d:"Capilares sanguíneos se formam."},
  26:{e:"🥒",f:"Pepino grande",o:"rolo de papel",s:"35.6cm",d:"Olhos se abrem pela primeira vez! Ciclo sono-vigília definido."},
  27:{e:"🥬",f:"Couve-flor",o:"caixa de suco",s:"36.6cm",d:"Início do 3° trimestre! Pulmões amadurecendo."},
  28:{e:"🍆",f:"Berinjela",o:"tijolo pequeno",s:"37.6cm",d:"Bebê tem sonhos! Movimentos fortes e bem perceptíveis."},
  29:{e:"🍍",f:"Abacaxi mini",o:"tênis infantil 👟",s:"38.6cm",d:"Músculo e gordura acumulam. Cabeça vira para baixo."},
  30:{e:"🥬",f:"Repolho",o:"abóbora média",s:"39.9cm",d:"Medula óssea produz células vermelhas."},
  31:{e:"🥥",f:"Coco",o:"coco",s:"41.1cm",d:"Todos os sentidos ativos. Ritmo de sono bem definido."},
  32:{e:"🍈",f:"Melão pequeno",o:"livro grosso",s:"42.4cm",d:"Pulmões quase prontos. Cabeça posicionada para baixo."},
  33:{e:"🍍",f:"Abacaxi",o:"abacaxi",s:"43.7cm",d:"Ossos do crânio flexíveis para o parto."},
  34:{e:"🎃",f:"Abóbora baby",o:"bola de rugby 🏈",s:"45cm",d:"Sistema nervoso central quase maduro."},
  35:{e:"🍈",f:"Melão mel",o:"mochila infantil 🎒",s:"46.2cm",d:"Rins totalmente desenvolvidos."},
  36:{e:"🥬",f:"Alface romana",o:"caderno grande",s:"47.4cm",d:"Quase pronto! Seios produzem colostro."},
  37:{e:"🫛",f:"Acelga grande",o:"beterraba grande",s:"48.6cm",d:"A termo! Qualquer dia pode ser o grande dia. 🌟"},
  38:{e:"🧅",f:"Alho-poró",o:"bola de futebol ⚽",s:"49.8cm",d:"Gordura protetora cobre o corpo."},
  39:{e:"🍉",f:"Melancia mini",o:"mochila pequena",s:"50.7cm",d:"Tudo pronto! O sinal de parto pode vir a qualquer hora."},
  40:{e:"🎃",f:"Abóbora",o:"abóbora grande",s:"51.2cm",d:"Bebê completamente desenvolvido. Aguardando o grande dia! ✨"},
};

const MOODS=[{e:"😊",l:"Bem"},{e:"🥰",l:"Feliz"},{e:"😴",l:"Cansada"},{e:"🤢",l:"Enjoada"},{e:"😰",l:"Ansiosa"},{e:"😢",l:"Emotiva"},{e:"💪",l:"Disposta"},{e:"🤩",l:"Radiante"}];
const SYMPTOMS=["Enjoo","Vômito","Azia","Dor nas costas","Inchaço","Câimbras","Insônia","Cansaço","Dor de cabeça","Falta de ar","Contrações","Corrimento","Dor pélvica","Tontura","Hemorroidas"];
const CTYPES=["Pré-natal","Ultrassom","Exame de sangue","Cardiológico","Odontológico","Nutricionista","Outro"];
const DEF_ENV=[
  {id:1,cat:"🛏️ Quarto",n:"Berço ou bassinet",done:false},{id:2,cat:"🛏️ Quarto",n:"Colchão de berço",done:false},
  {id:3,cat:"🛏️ Quarto",n:"Trocador",done:false},{id:4,cat:"🛏️ Quarto",n:"Fraldas RN (pacote)",done:false},
  {id:5,cat:"🛁 Banho",n:"Banheira de bebê",done:false},{id:6,cat:"🛁 Banho",n:"Toalhas macias",done:false},
  {id:7,cat:"🛁 Banho",n:"Sabonete bebê",done:false},{id:8,cat:"🛁 Banho",n:"Algodão e álcool",done:false},
  {id:9,cat:"🍼 Alimentação",n:"Mamadeiras",done:false},{id:10,cat:"🍼 Alimentação",n:"Bomba de leite",done:false},
  {id:11,cat:"🍼 Alimentação",n:"Esterilizador",done:false},{id:12,cat:"🍼 Alimentação",n:"Capa de amamentação",done:false},
  {id:13,cat:"🚗 Saída",n:"Carrinho de bebê",done:false},{id:14,cat:"🚗 Saída",n:"Bebê conforto",done:false},
  {id:15,cat:"🚗 Saída",n:"Bolsa maternidade",done:false},
  {id:16,cat:"👕 Roupinhas",n:"Macacões RN (6 un.)",done:false},{id:17,cat:"👕 Roupinhas",n:"Bodies manga longa",done:false},
  {id:18,cat:"👕 Roupinhas",n:"Meias e luvinhas",done:false},
  {id:19,cat:"💊 Saúde",n:"Termômetro digital",done:false},{id:20,cat:"💊 Saúde",n:"Aspirador nasal",done:false},
  {id:21,cat:"💊 Saúde",n:"Kit primeiros socorros",done:false},
];

const tod=()=>new Date().toISOString().split("T")[0];
const uid=()=>Math.random().toString(36).slice(2,9);
const fmtD=s=>{if(!s)return"—";const[y,m,d]=s.split("-");return`${d}/${m}/${y}`;};
const shortD=s=>["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][new Date(s+"T12:00:00").getDay()];
const calcWeek=lmp=>{if(!lmp)return null;return Math.max(1,Math.min(42,Math.floor((Date.now()-new Date(lmp+"T12:00:00"))/6048e5)));};
const calcDPP=lmp=>{const d=new Date(lmp+"T12:00:00");d.setDate(d.getDate()+280);return d.toISOString().split("T")[0];};
const calcLMP=dpp=>{const d=new Date(dpp+"T12:00:00");d.setDate(d.getDate()-280);return d.toISOString().split("T")[0];};
const dLeft=dpp=>{if(!dpp)return null;return Math.max(0,Math.ceil((new Date(dpp+"T12:00:00")-Date.now())/864e5));};
const getWD=w=>{const ks=Object.keys(WEEKS).map(Number).sort((a,b)=>a-b);return WEEKS[ks.reduce((a,k)=>w>=k?k:a,ks[0])];};
const getTri=w=>{if(w<=13)return{l:"1° Trimestre",c:C.verde};if(w<=27)return{l:"2° Trimestre",c:C.rosa};return{l:"3° Trimestre",c:C.vinho};};
const last7=()=>Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().split("T")[0];});

function usePersisted(key,def){
  const[v,sv]=useState(()=>{try{const s=localStorage.getItem(key);return s!=null?JSON.parse(s):def;}catch{return def;}});
  const set=val=>sv(prev=>{const next=typeof val==="function"?val(prev):val;try{localStorage.setItem(key,JSON.stringify(next));}catch{}return next;});
  return[v,set];
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans','Segoe UI',sans-serif;background:${C.bg};-webkit-font-smoothing:antialiased}
.R{max-width:480px;margin:0 auto;min-height:100vh;background:${C.bg};position:relative}
@media(min-width:481px){.R{border-left:1px solid ${C.bege};border-right:1px solid ${C.bege};box-shadow:0 0 60px rgba(78,43,83,.1)}}
.HDR{background:${C.vinho};position:relative;overflow:hidden}
.HDR::after{content:'';position:absolute;bottom:-1px;left:-5%;width:110%;height:36px;background:${C.bg};border-radius:50% 50% 0 0/100% 100% 0 0}
.HT{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0}
.brand{font-family:${SF};font-size:20px;font-weight:300;color:${C.bege};letter-spacing:.5px}
.brand em{font-style:italic;color:${C.rosa}}
.hcfg{width:34px;height:34px;border-radius:50%;background:rgba(238,209,184,.12);border:none;cursor:pointer;color:${C.bege};font-size:15px;display:flex;align-items:center;justify-content:center}
.WHO{text-align:center;padding:20px 20px 46px}
.wey{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(238,209,184,.55);margin-bottom:3px}
.wbig{font-family:${SF};font-size:84px;font-weight:300;color:${C.bege};line-height:1}
.wunit{font-family:${SF};font-size:22px;font-style:italic;color:${C.rosa}}
.wmeta{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px}
.tribadge{font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;padding:3px 11px;border-radius:20px;border:1px solid}
.wdays{font-size:12px;color:rgba(238,209,184,.5)}
.SCR{padding:0 16px 100px;display:flex;flex-direction:column;gap:14px}
.card{background:white;border-radius:20px;padding:18px;box-shadow:0 2px 14px rgba(78,43,83,.07);border:1px solid rgba(195,138,151,.08)}
.ctit{font-family:${SF};font-size:18px;font-weight:400;color:${C.vinho};margin-bottom:12px;display:flex;align-items:center;gap:8px}
.pbar{height:7px;background:${C.bege};border-radius:99px;overflow:hidden;margin:6px 0}
.pfill{height:100%;background:linear-gradient(90deg,${C.rosa},${C.vinho});border-radius:99px;transition:width 1s ease}
.srow{display:flex;gap:10px;margin-top:12px}
.sbox{flex:1;text-align:center;background:rgba(238,209,184,.3);border-radius:12px;padding:10px 6px}
.sn{font-family:${SF};font-size:24px;color:${C.vinho};display:block;line-height:1}
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
.mt{font-family:${SF};font-size:24px;color:${C.vinho};margin-bottom:4px}
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
.WSCRN{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;background:linear-gradient(160deg,${C.bege} 0%,#f5e2d0 100%)}
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

function Mdl({title,sub,onClose,children}){
  return(
    <div className="OVL" onClick={onClose}>
      <div className="MDL" onClick={e=>e.stopPropagation()}>
        <div className="mh"/>
        <div className="mt">{title}</div>
        {sub&&<div className="ms">{sub}</div>}
        {children}
      </div>
    </div>
  );
}

function DateForm({initial,onSave,onCancel}){
  const[dt,setDt]=useState("lmp");
  const[date,setDate]=useState(initial?.lmp||"");
  function save(){
    if(!date)return;
    const lmp=dt==="lmp"?date:calcLMP(date);
    const dpp=dt==="dpp"?date:calcDPP(date);
    onSave({lmp,dpp});
  }
  return(
    <div>
      <div className="fg">
        <div className="lbl">Tipo de data</div>
        <div className="tbns">
          {[{v:"lmp",l:"Última menstruação"},{v:"dpp",l:"Parto previsto"}].map(o=>(
            <button key={o.v} className="tbtn" onClick={()=>setDt(o.v)} style={{
              border:`1.5px solid ${dt===o.v?C.rosa:C.bege}`,
              background:dt===o.v?"rgba(195,138,151,.15)":"transparent",
              color:dt===o.v?C.vinho:C.taupe
            }}>{o.l}</button>
          ))}
        </div>
        <div className="lbl">{dt==="lmp"?"Data da última menstruação":"Data provável do parto"}</div>
        <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)}/>
      </div>
      <button className="btnp" onClick={save} disabled={!date} style={{marginBottom:8}}>Salvar</button>
      {onCancel&&<button className="skip" onClick={onCancel}>Cancelar</button>}
    </div>
  );
}

function Welcome({onDone}){
  const[dt,setDt]=useState("lmp");
  const[date,setDate]=useState("");
  function go(){
    const lmp=dt==="lmp"?date:calcLMP(date);
    const dpp=dt==="dpp"?date:calcDPP(date);
    onDone({lmp,dpp});
  }
  return(
    <div className="WSCRN">
      <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:C.taupe,marginBottom:8}}>✦ seu diário de gestação</div>
      <h1 style={{fontFamily:SF,fontSize:52,fontWeight:300,color:C.vinho,textAlign:"center",lineHeight:1.05,marginBottom:6}}>
        Bella<br/><em style={{fontStyle:"italic",color:C.rosa}}>Gravidez</em>
      </h1>
      <p style={{fontSize:14,color:C.taupe,textAlign:"center",marginBottom:36}}>acompanhe cada momento especial</p>
      <div style={{fontSize:28,marginBottom:24,opacity:.65}}>🌸</div>
      <div className="wcrd fu">
        <div style={{fontFamily:SF,fontSize:22,color:C.vinho,marginBottom:4}}>Quando começou?</div>
        <p style={{fontSize:13,color:C.taupe,marginBottom:20,lineHeight:1.5}}>Informe a data para calcularmos sua semana atual. Pode pular e adicionar depois.</p>
        <div className="fg">
          <div className="lbl">Tipo de data</div>
          <div className="tbns">
            {[{v:"lmp",l:"Última menstruação"},{v:"dpp",l:"Parto previsto"}].map(o=>(
              <button key={o.v} className="tbtn" onClick={()=>setDt(o.v)} style={{
                border:`1.5px solid ${dt===o.v?C.rosa:C.bege}`,
                background:dt===o.v?"rgba(195,138,151,.15)":"transparent",
                color:dt===o.v?C.vinho:C.taupe
              }}>{o.l}</button>
            ))}
          </div>
          <div className="lbl">{dt==="lmp"?"Data da última menstruação":"Data provável do parto"}</div>
          <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
        <button className="btnp" onClick={go} disabled={!date}>Começar minha jornada ✨</button>
        <button className="skip" onClick={()=>onDone(null)}>Pular por enquanto</button>
      </div>
    </div>
  );
}

function Home({preg,week,onCfg}){
  const wd=week?getWD(week):null;
  const tri=week?getTri(week):null;
  const dl=preg?dLeft(preg.dpp):null;
  const prog=week?Math.min(100,(week/40)*100):0;
  return(
    <div className="SCR">
      {!preg&&(
        <div className="ndb fu" onClick={onCfg}>
          <span style={{fontSize:24}}>📅</span>
          <div>
            <div style={{fontSize:14,fontWeight:500,color:C.vinho,marginBottom:2}}>Adicione a data de início</div>
            <div style={{fontSize:12,color:C.taupe}}>Toque para calcular a semana atual</div>
          </div>
        </div>
      )}
      <div className="card fu">
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:13,color:C.taupe}}>Progresso da gestação</span>
          <span style={{fontSize:13,color:C.vinho,fontWeight:500}}>{week?`${Math.round(prog)}%`:"—"}</span>
        </div>
        <div className="pbar"><div className="pfill" style={{width:`${prog}%`}}/></div>
        <div className="srow">
          {[{n:week??"—",l:"semanas"},{n:week?Math.max(0,40-week):"—",l:"restantes"},{n:dl??"—",l:"dias p/ parto"}].map((s,i)=>(
            <div key={i} className="sbox"><span className="sn">{s.n}</span><span className="sl">{s.l}</span></div>
          ))}
        </div>
      </div>
      {wd&&(
        <div className="card fu">
          <div className="ctit"><span>🌱</span>Semana {week} do bebê</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:54,flexShrink:0}}>{wd.e}</span>
            <div>
              <div style={{fontFamily:SF,fontSize:20,color:C.vinho}}>{wd.f}</div>
              <div style={{fontSize:13,color:C.taupe,marginTop:3}}>aprox. <strong>{wd.s}</strong></div>
            </div>
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(159,176,160,.15)",border:"1px solid rgba(159,176,160,.3)",borderRadius:20,padding:"5px 12px",fontSize:12,color:C.verde,marginTop:10}}>
            🏠 Comparável a: {wd.o}
          </div>
          <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginTop:10}}>{wd.d}</p>
        </div>
      )}
      {preg&&(
        <div className="card fu">
          <div className="ctit"><span>📅</span>Datas importantes</div>
          {[{ic:"🗓️",l:"Última menstruação",v:fmtD(preg.lmp)},{ic:"👶",l:"Parto previsto (DPP)",v:fmtD(preg.dpp)},{ic:"🔢",l:"Trimestre",v:tri?.l}].map((r,i,a)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<a.length-1?`1px solid ${C.bege}`:"none"}}>
              <span style={{fontSize:13,color:C.taupe}}>{r.ic} {r.l}</span>
              <span style={{fontFamily:SF,fontSize:16,color:C.vinho}}>{r.v}</span>
            </div>
          ))}
        </div>
      )}
      <div className="card fu">
        <div className="ctit"><span>💡</span>Dica da semana</div>
        <p style={{fontSize:13,color:"#555",lineHeight:1.7}}>
          {!week&&"Configure sua data para ver dicas personalizadas de cada fase da gravidez."}
          {week&&week<=12&&"O primeiro trimestre é fundamental. Procure fazer o pré-natal o quanto antes, evite medicamentos sem orientação e fique atenta aos primeiros exames."}
          {week&&week>12&&week<=27&&"O segundo trimestre é o 'lua de mel' da gravidez! Aproveite a energia extra, comece o enxoval e conheça o sexo do bebê no morfológico."}
          {week&&week>27&&"Estamos na reta final! Prepare a bolsa da maternidade, escreva o plano de parto e descanse bastante. O grande dia está chegando! 🌟"}
        </p>
      </div>
    </div>
  );
}

function Diary({entries,setEntries,week}){
  const[open,setOpen]=useState(false);
  const[mood,setMood]=useState(null);
  const[text,setText]=useState("");
  function add(){
    if(!text.trim()&&!mood)return;
    setEntries(p=>[{id:uid(),date:tod(),week:week||"—",mood,text:text.trim()},...p]);
    setOpen(false);setMood(null);setText("");
  }
  const Btn=({onClick})=><button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:16,padding:4}} onClick={onClick}>🗑️</button>;
  return(
    <div className="SCR">
      <button className="btnp fu" onClick={()=>setOpen(true)} style={{marginTop:4}}>✍️ Nova anotação do dia</button>
      {entries.length===0?(
        <div className="emp">
          <div style={{fontSize:40,marginBottom:10}}>📖</div>
          <div style={{fontFamily:SF,fontSize:20,color:C.vinho,marginBottom:6}}>Diário vazio</div>
          <div style={{fontSize:13,color:C.taupe}}>Registre sentimentos, sintomas e momentos especiais</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {entries.map(e=>(
            <div key={e.id} className="dcard fu">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,color:C.vinho,fontWeight:500}}>{fmtD(e.date)}</div>
                  <div style={{fontSize:11,color:C.taupe}}>{shortD(e.date)} · Sem. {e.week}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {e.mood&&<span style={{fontSize:22}}>{e.mood}</span>}
                  <Btn onClick={()=>setEntries(p=>p.filter(x=>x.id!==e.id))}/>
                </div>
              </div>
              {e.text&&<div style={{fontSize:13,color:"#444",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{e.text}</div>}
            </div>
          ))}
        </div>
      )}
      {open&&(
        <Mdl title="Nova anotação" sub="Como você está hoje?" onClose={()=>setOpen(false)}>
          <div className="lbl">Humor do dia</div>
          <div className="mgrid">
            {MOODS.map(m=>(
              <button key={m.e} className={`mbe ${mood===m.e?"S":""}`} onClick={()=>setMood(m.e)}>
                <span style={{fontSize:22}}>{m.e}</span>
                <span style={{fontSize:10,color:C.taupe,marginTop:4}}>{m.l}</span>
              </button>
            ))}
          </div>
          <div className="fg">
            <div className="lbl">Anotação</div>
            <textarea className="inp" rows={4} placeholder="Como foi seu dia? Como você está se sentindo?"
              value={text} onChange={e=>setText(e.target.value)} style={{resize:"vertical",lineHeight:1.6}}/>
          </div>
          <button className="btnp" onClick={add} disabled={!text.trim()&&!mood}>Salvar</button>
        </Mdl>
      )}
    </div>
  );
}

function Baby({week,kicks,setKicks}){
  const[sw,setSw]=useState(week||12);
  const GOAL=10;
  const todK=kicks[tod()]||0;
  const days=last7();
  const maxK=Math.max(...days.map(d=>kicks[d]||0),1);
  const wd=getWD(sw);
  const prog=Math.min(100,(todK/GOAL)*100);
  const allW=Object.keys(WEEKS).map(Number).sort((a,b)=>a-b);
  return(
    <div className="SCR">
      <div className="card fu">
        <div className="ctit"><span>👣</span>Contador de Chutes</div>
        <p style={{fontSize:13,color:C.taupe,marginBottom:20,lineHeight:1.5}}>Toque cada vez que sentir o bebê se mexer. Meta: {GOAL} chutes por dia.</p>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
          <div>
            <button className={`kbtn ${todK>0?"kP":""}`} onClick={()=>setKicks(p=>({...p,[tod()]:(p[tod()]||0)+1}))}>
              <span style={{fontFamily:SF,fontSize:56,color:"white",lineHeight:1,fontWeight:300}}>{todK}</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,.75)",letterSpacing:1}}>CHUTES</span>
            </button>
            <div style={{textAlign:"center",marginTop:10,fontSize:12,color:C.taupe}}>Toque para registrar</div>
          </div>
          <div style={{width:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.taupe}}>Meta diária</span>
              <span style={{fontSize:12,color:C.vinho,fontWeight:500}}>{todK}/{GOAL} {todK>=GOAL?"✅":""}</span>
            </div>
            <div className="pbar" style={{height:10}}><div className="pfill" style={{width:`${prog}%`}}/></div>
            {todK>=GOAL&&<div style={{textAlign:"center",marginTop:8,fontSize:13,color:C.verde,fontWeight:500}}>🎉 Meta atingida! Bebê está ativo!</div>}
          </div>
          <button className="btno" style={{width:"100%"}} onClick={()=>setKicks(p=>({...p,[tod()]:0}))}>Zerar contador de hoje</button>
        </div>
      </div>
      <div className="card fu">
        <div className="ctit"><span>📊</span>Histórico — 7 dias</div>
        {days.map(d=>{
          const n=kicks[d]||0;
          const isT=d===tod();
          return(
            <div key={d} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:isT?C.vinho:C.taupe,width:30,textAlign:"right",fontWeight:isT?500:400}}>{shortD(d)}</span>
              <div style={{flex:1,height:10,background:`${C.bege}44`,borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",background:`linear-gradient(90deg,${C.rosa},${C.vinho})`,borderRadius:99,width:maxK>0?`${(n/maxK)*100}%`:"0%"}}/>
              </div>
              <span style={{fontSize:11,color:C.vinho,width:24,fontWeight:500}}>{n}</span>
            </div>
          );
        })}
      </div>
      <div className="card fu">
        <div className="ctit"><span>📏</span>Tamanho por Semana</div>
        <div className="wchips" style={{marginBottom:14}}>
          {allW.map(w=>(
            <button key={w} className={`wchip ${sw===w?"A":""}`} onClick={()=>setSw(w)}>Sem. {w}</button>
          ))}
        </div>
        <div style={{background:`${C.bege}33`,borderRadius:16,padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:52}}>{wd.e}</span>
            <div>
              <div style={{fontFamily:SF,fontSize:20,color:C.vinho}}>{wd.f}</div>
              <div style={{fontSize:13,color:C.taupe,marginTop:3}}>~{wd.s}</div>
            </div>
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(159,176,160,.15)",border:"1px solid rgba(159,176,160,.3)",borderRadius:20,padding:"5px 12px",fontSize:12,color:C.verde,marginTop:10}}>
            🏠 Comparável a: {wd.o}
          </div>
          <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginTop:10}}>{wd.d}</p>
        </div>
      </div>
    </div>
  );
}

function Health({cons,setCons,meds,setMeds,syms,setSyms}){
  const[sub,setSub]=useState("c");
  const[modal,setModal]=useState(null);
  const[cDt,setCDt]=useState(tod());const[cDc,setCDc]=useState("");const[cTp,setCTp]=useState(CTYPES[0]);const[cNt,setCNt]=useState("");
  const[mN,setMN]=useState("");const[mD,setMD]=useState("");const[mT,setMT]=useState("");
  const[sCh,setSCh]=useState([]);const[sNt,setSNt]=useState("");
  const tg=c=>setSCh(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const D=({fn})=><button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:16,padding:4}} onClick={fn}>🗑️</button>;
  function addC(){if(!cDc.trim())return;setCons(p=>[...p,{id:uid(),date:cDt,doc:cDc,type:cTp,notes:cNt}].sort((a,b)=>b.date.localeCompare(a.date)));setModal(null);setCDc("");setCNt("");}
  function addM(){if(!mN.trim())return;setMeds(p=>[...p,{id:uid(),name:mN,dose:mD,time:mT}]);setModal(null);setMN("");setMD("");setMT("");}
  function addS(){if(!sCh.length&&!sNt.trim())return;setSyms(p=>[{id:uid(),date:tod(),items:sCh,notes:sNt},...p]);setModal(null);setSCh([]);setSNt("");}
  return(
    <div className="SCR">
      <div className="stabs fu">
        {[{k:"c",l:"🩺 Consultas"},{k:"m",l:"💊 Medicamentos"},{k:"s",l:"📋 Sintomas"}].map(t=>(
          <button key={t.k} className={`stab ${sub===t.k?"A":""}`} onClick={()=>setSub(t.k)}>{t.l}</button>
        ))}
      </div>
      {sub==="c"&&<>
        <button className="btnp fu" onClick={()=>setModal("c")}>+ Adicionar consulta</button>
        <div className="card fu" style={{marginTop:12}}>
          {cons.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>🩺</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Nenhuma consulta</div><div style={{fontSize:13,color:C.taupe}}>Registre suas consultas de pré-natal</div></div>:
          cons.map(c=>(
            <div key={c.id} className="LI">
              <div className="liic">🩺</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.vinho}}>{c.type} — {c.doc}</div><div style={{fontSize:12,color:C.taupe,marginTop:2}}>{fmtD(c.date)}{c.notes?` · ${c.notes}`:""}</div></div>
              <D fn={()=>setCons(p=>p.filter(x=>x.id!==c.id))}/>
            </div>
          ))}
        </div>
      </>}
      {sub==="m"&&<>
        <button className="btnp fu" onClick={()=>setModal("m")}>+ Adicionar medicamento</button>
        <div className="card fu" style={{marginTop:12}}>
          {meds.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>💊</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Nenhum medicamento</div><div style={{fontSize:13,color:C.taupe}}>Vitaminas, suplementos e remédios</div></div>:
          meds.map(m=>(
            <div key={m.id} className="LI">
              <div className="liic">💊</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.vinho}}>{m.name}</div><div style={{fontSize:12,color:C.taupe,marginTop:2}}>{[m.dose,m.time].filter(Boolean).join(" · ")}</div></div>
              <D fn={()=>setMeds(p=>p.filter(x=>x.id!==m.id))}/>
            </div>
          ))}
        </div>
      </>}
      {sub==="s"&&<>
        <button className="btnp fu" onClick={()=>setModal("s")}>+ Registrar sintomas</button>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {syms.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>📋</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Nenhum registro</div><div style={{fontSize:13,color:C.taupe}}>Acompanhe seus sintomas diários</div></div>:
          syms.map(s=>(
            <div key={s.id} className="dcard fu">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,color:C.taupe}}>{fmtD(s.date)} — {shortD(s.date)}</span>
                <D fn={()=>setSyms(p=>p.filter(x=>x.id!==s.id))}/>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:s.notes?8:0}}>
                {s.items.map(i=><span key={i} style={{background:`${C.rosa}22`,color:C.vinho,border:`1px solid ${C.rosa}44`,borderRadius:20,fontSize:11,padding:"3px 10px"}}>{i}</span>)}
              </div>
              {s.notes&&<div style={{fontSize:13,color:"#555",lineHeight:1.5}}>{s.notes}</div>}
            </div>
          ))}
        </div>
      </>}
      {modal==="c"&&<Mdl title="Nova consulta" onClose={()=>setModal(null)}>
        <div className="fg"><div className="lbl">Data</div><input type="date" className="inp" value={cDt} onChange={e=>setCDt(e.target.value)}/></div>
        <div className="fg"><div className="lbl">Médico</div><input className="inp" placeholder="Dra. Ana — Obstetra" value={cDc} onChange={e=>setCDc(e.target.value)}/></div>
        <div className="fg"><div className="lbl">Tipo</div><select className="inp" value={cTp} onChange={e=>setCTp(e.target.value)}>{CTYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="fg"><div className="lbl">Notas</div><textarea className="inp" rows={3} placeholder="Resultados, observações..." value={cNt} onChange={e=>setCNt(e.target.value)} style={{resize:"vertical"}}/></div>
        <button className="btnp" onClick={addC} disabled={!cDc.trim()}>Salvar consulta</button>
      </Mdl>}
      {modal==="m"&&<Mdl title="Novo medicamento" sub="Vitaminas, suplementos e remédios prescritos" onClose={()=>setModal(null)}>
        <div className="fg"><div className="lbl">Nome</div><input className="inp" placeholder="Ácido fólico, Ferro..." value={mN} onChange={e=>setMN(e.target.value)}/></div>
        <div className="fg"><div className="lbl">Dose</div><input className="inp" placeholder="1 comprimido, 5mg..." value={mD} onChange={e=>setMD(e.target.value)}/></div>
        <div className="fg"><div className="lbl">Horário</div><input className="inp" placeholder="Manhã, 08h..." value={mT} onChange={e=>setMT(e.target.value)}/></div>
        <button className="btnp" onClick={addM} disabled={!mN.trim()}>Salvar</button>
      </Mdl>}
      {modal==="s"&&<Mdl title="Registrar sintomas" sub="O que você está sentindo hoje?" onClose={()=>setModal(null)}>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
          {SYMPTOMS.map(s=><button key={s} className={`chip ${sCh.includes(s)?"S":""}`} onClick={()=>tg(s)}>{s}</button>)}
        </div>
        <div className="fg"><div className="lbl">Observações</div><textarea className="inp" rows={3} placeholder="Intensidade, horário, o que ajudou..." value={sNt} onChange={e=>setSNt(e.target.value)} style={{resize:"vertical"}}/></div>
        <button className="btnp" onClick={addS} disabled={!sCh.length&&!sNt.trim()}>Salvar</button>
      </Mdl>}
    </div>
  );
}

function More({env,setEnv,songs,setSongs,photos,setPhotos,week}){
  const[sub,setSub]=useState("e");
  const[modal,setModal]=useState(null);
  const[sT,setST]=useState("");const[sA,setSA]=useState("");
  const[pU,setPU]=useState("");const[pC,setPC]=useState("");
  const[ni,setNi]=useState("");const[nc,setNc]=useState("👕 Roupinhas");
  const cats=[...new Set(env.map(i=>i.cat))];
  const done=env.filter(i=>i.done).length;
  const D=({fn})=><button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:13,padding:4}} onClick={fn}>✕</button>;
  function addE(){if(!ni.trim())return;setEnv(p=>[...p,{id:uid(),cat:nc,n:ni.trim(),done:false}]);setNi("");setModal(null);}
  function addS(){if(!sT.trim())return;setSongs(p=>[...p,{id:uid(),title:sT.trim(),artist:sA.trim()}]);setModal(null);setST("");setSA("");}
  function addP(){if(!pU.trim())return;setPhotos(p=>[...p,{id:uid(),url:pU.trim(),week:week||"—",date:tod()}]);setModal(null);setPU("");setPC("");}
  return(
    <div className="SCR">
      <div className="stabs fu">
        {[{k:"e",l:"🛍️ Enxoval"},{k:"s",l:"🎵 Músicas"},{k:"p",l:"📸 Fotos"}].map(t=>(
          <button key={t.k} className={`stab ${sub===t.k?"A":""}`} onClick={()=>setSub(t.k)}>{t.l}</button>
        ))}
      </div>
      {sub==="e"&&<>
        <div className="card fu" style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontFamily:SF,fontSize:17,color:C.vinho}}>Lista do Enxoval</span>
            <span style={{fontSize:12,color:C.taupe}}>{done}/{env.length}</span>
          </div>
          <div className="pbar"><div className="pfill" style={{width:env.length?`${(done/env.length)*100}%`:"0%"}}/></div>
        </div>
        <button className="btnp fu" onClick={()=>setModal("e")} style={{marginBottom:12}}>+ Adicionar item</button>
        <div className="card fu">
          {cats.map(cat=>(
            <div key={cat}>
              <div style={{fontSize:12,fontWeight:600,color:C.vinho,margin:"14px 0 6px",paddingBottom:6,borderBottom:`1px solid ${C.bege}`}}>{cat}</div>
              {env.filter(i=>i.cat===cat).map(item=>(
                <div key={item.id} className="cki">
                  <div className={`cb ${item.done?"C":""}`} onClick={()=>setEnv(p=>p.map(i=>i.id===item.id?{...i,done:!i.done}:i))}>
                    {item.done&&<span style={{fontSize:12,color:"white"}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:item.done?C.taupe:C.vinho,textDecoration:item.done?"line-through":"none",flex:1}}>{item.n}</span>
                  <D fn={()=>setEnv(p=>p.filter(x=>x.id!==item.id))}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>}
      {sub==="s"&&<>
        <button className="btnp fu" onClick={()=>setModal("s")}>+ Adicionar música</button>
        <div className="card fu" style={{marginTop:12}}>
          {songs.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>🎵</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Playlist vazia</div><div style={{fontSize:13,color:C.taupe}}>Crie uma playlist especial para o bebê</div></div>:
          songs.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.bege}33`}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:`${C.rosa}22`,border:`1.5px solid ${C.rosa}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🎵</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:C.vinho}}>{s.title}</div>
                {s.artist&&<div style={{fontSize:11,color:C.taupe}}>{s.artist}</div>}
              </div>
              <button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:16}} onClick={()=>setSongs(p=>p.filter(x=>x.id!==s.id))}>🗑️</button>
            </div>
          ))}
        </div>
      </>}
      {sub==="p"&&(
        <div className="card fu">
          <div className="ctit"><span>📸</span>Fotos da Barriga</div>
          <p style={{fontSize:12,color:C.taupe,marginBottom:14,lineHeight:1.5}}>Cole o link de uma foto (Google Fotos, Drive) para guardar na timeline da gestação.</p>
          <div className="pgrid">
            <div className="padd" onClick={()=>setModal("p")}><span>+</span><span style={{fontSize:10,color:C.taupe}}>Nova foto</span></div>
            {photos.map(p=>(
              <div key={p.id} className="pthumb" onClick={()=>setPhotos(pr=>pr.filter(x=>x.id!==p.id))}>
                <img src={p.url} alt={`Sem ${p.week}`} onError={e=>e.target.style.display="none"}/>
                <span style={{position:"absolute",bottom:5,left:0,right:0,textAlign:"center",fontSize:9,color:"white",textShadow:"0 1px 4px rgba(0,0,0,.5)"}}>Sem. {p.week}</span>
              </div>
            ))}
          </div>
          {photos.length>0&&<p style={{fontSize:11,color:C.taupe,textAlign:"center",marginTop:8}}>Toque em uma foto para remover</p>}
        </div>
      )}
      {modal==="e"&&<Mdl title="Novo item" sub="Adicione ao enxoval" onClose={()=>setModal(null)}>
        <div className="fg"><div className="lbl">Categoria</div><select className="inp" value={nc} onChange={e=>setNc(e.target.value)}>{[...cats,"✨ Outros"].map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fg"><div className="lbl">Item</div><input className="inp" placeholder="Nome do item..." value={ni} onChange={e=>setNi(e.target.value)}/></div>
        <button className="btnp" onClick={addE} disabled={!ni.trim()}>Adicionar</button>
      </Mdl>}
      {modal==="s"&&<Mdl title="Nova música" sub="Para a playlist do bebê 🎵" onClose={()=>setModal(null)}>
        <div className="fg"><div className="lbl">Título</div><input className="inp" placeholder="You Are My Sunshine..." value={sT} onChange={e=>setST(e.target.value)}/></div>
        <div className="fg"><div className="lbl">Artista</div><input className="inp" placeholder="Nome do artista..." value={sA} onChange={e=>setSA(e.target.value)}/></div>
        <button className="btnp" onClick={addS} disabled={!sT.trim()}>Adicionar</button>
      </Mdl>}
      {modal==="p"&&<Mdl title="Nova foto" sub="Cole o link da foto" onClose={()=>setModal(null)}>
        <div className="fg"><div className="lbl">URL da foto</div><input className="inp" placeholder="https://..." value={pU} onChange={e=>setPU(e.target.value)}/></div>
        <div className="fg"><div className="lbl">Legenda</div><input className="inp" placeholder="28 semanas! Barrigão crescendo..." value={pC} onChange={e=>setPC(e.target.value)}/></div>
        <button className="btnp" onClick={addP} disabled={!pU.trim()}>Salvar</button>
      </Mdl>}
    </div>
  );
}

export default function App(){
  const[screen,setScreen]=useState("loading");
  const[tab,setTab]=useState("home");
  const[showCfg,setShowCfg]=useState(false);
  const[toast,setToast]=useState(null);
  const tRef=useRef(null);
  const[preg,setPreg]=usePersisted("bg-preg",null);
  const[diary,setDiary]=usePersisted("bg-diary",[]);
  const[kicks,setKicks]=usePersisted("bg-kicks",{});
  const[cons,setCons]=usePersisted("bg-cons",[]);
  const[meds,setMeds]=usePersisted("bg-meds",[]);
  const[syms,setSyms]=usePersisted("bg-syms",[]);
  const[env,setEnv]=usePersisted("bg-env",DEF_ENV);
  const[songs,setSongs]=usePersisted("bg-songs",[]);
  const[photos,setPhotos]=usePersisted("bg-photos",[]);

  useEffect(()=>{
    try{const r=localStorage.getItem("bg-preg");setScreen(r?"main":"welcome");}
    catch{setScreen("welcome");}
  },[]);

  const week=preg?calcWeek(preg.lmp):null;
  const tri=week?getTri(week):null;
  const dl=preg?dLeft(preg.dpp):null;

  function showT(msg){clearTimeout(tRef.current);setToast(msg);tRef.current=setTimeout(()=>setToast(null),2300);}
  function wDone(data){if(data){setPreg(data);showT("🌸 Gestação configurada!");}setScreen("main");}

  const NAV=[{id:"home",ic:"🏠",l:"Início"},{id:"diary",ic:"📖",l:"Diário"},{id:"baby",ic:"👶",l:"Bebê"},{id:"health",ic:"🩺",l:"Saúde"},{id:"more",ic:"☰",l:"Mais"}];

  if(screen==="loading") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <style>{CSS}</style>
      <span style={{fontFamily:SF,fontSize:32,color:C.vinho}}>Bella <em style={{fontStyle:"italic",color:C.rosa}}>Gravidez</em></span>
    </div>
  );

  if(screen==="welcome") return(<><style>{CSS}</style><div className="R"><Welcome onDone={wDone}/></div></>);

  return(
    <>
      <style>{CSS}</style>
      <div className="R">
        <div className="HDR">
          <div className="HT">
            <span className="brand">Bella <em>Gravidez</em></span>
            <button className="hcfg" onClick={()=>setShowCfg(true)}>⚙️</button>
          </div>
          <div className="WHO">
            <div className="wey">semana atual</div>
            <span className="wbig">{week??"—"}</span>
            <span className="wunit">{week?"semanas":"configure a data"}</span>
            {week&&(
              <div className="wmeta">
                <span className="tribadge" style={{color:tri.c,borderColor:`${tri.c}44`,background:`${tri.c}18`}}>{tri.l}</span>
                {dl!==null&&<span className="wdays">· {dl} dias para o parto</span>}
              </div>
            )}
          </div>
        </div>

        {tab==="home"&&<Home preg={preg} week={week} onCfg={()=>setShowCfg(true)}/>}
        {tab==="diary"&&<Diary entries={diary} setEntries={setDiary} week={week}/>}
        {tab==="baby"&&<Baby week={week} kicks={kicks} setKicks={setKicks}/>}
        {tab==="health"&&<Health cons={cons} setCons={setCons} meds={meds} setMeds={setMeds} syms={syms} setSyms={setSyms}/>}
        {tab==="more"&&<More env={env} setEnv={setEnv} songs={songs} setSongs={setSongs} photos={photos} setPhotos={setPhotos} week={week}/>}

        <div className="NAV">
          {NAV.map(n=>(
            <button key={n.id} className={`nb ${tab===n.id?"A":""}`} onClick={()=>setTab(n.id)}>
              <div className="ni">{n.ic}</div>
              <span className="nl">{n.l}</span>
            </button>
          ))}
        </div>

        {showCfg&&(
          <Mdl title="Configurar gestação" sub="Atualize as datas da sua gravidez" onClose={()=>setShowCfg(false)}>
            <DateForm initial={preg} onSave={d=>{setPreg(d);setShowCfg(false);showT("📅 Data atualizada!");}} onCancel={()=>setShowCfg(false)}/>
          </Mdl>
        )}

        {toast&&<div className="toast">{toast}</div>}
      </div>
    </>
  );
}
