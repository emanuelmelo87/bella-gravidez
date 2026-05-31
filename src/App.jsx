import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";
import { usePregnancy } from "./contexts/PregnancyContext";
import { useData } from "./contexts/DataContext";
import Login from "./screens/Login";
import CreatePregnancy from "./screens/CreatePregnancy";
import Members from "./screens/Members";
import InviteAccept from "./screens/InviteAccept";
import Contractions from "./screens/Contractions";
import Personalization from "./screens/Personalization";
import Tips from "./screens/Tips";
import Legal from "./screens/Legal";
import { buildCSS, getColors } from "./styles/theme";

// Telas pesadas / menos usadas — carregadas sob demanda (code-splitting)
const BirthPlan    = lazy(() => import("./screens/BirthPlan"));
const BirthTracker = lazy(() => import("./screens/BirthTracker"));
const Admin        = lazy(() => import("./screens/Admin"));

function Loading() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#ab9d95", fontFamily: "'DM Sans',sans-serif" }}>
      Carregando…
    </div>
  );
}

const SF = "'Cormorant Garamond',Georgia,serif";

// Cores padrão (rosa-bella) usadas pelos componentes inline.
// O App sobrescreve o CSS dinamicamente pelo tema da gestação.
let C = getColors("rosa-bella");

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
      <Tips compact={true}/>
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

function Diary({entries,addEntry,deleteEntry,week}){
  const{can}=usePregnancy();
  const canEdit=can("diary","edit");
  const[open,setOpen]=useState(false);
  const[mood,setMood]=useState(null);
  const[text,setText]=useState("");
  async function add(){
    if(!text.trim()&&!mood)return;
    await addEntry({mood,text:text.trim(),week});
    setOpen(false);setMood(null);setText("");
  }
  const Btn=({onClick})=><button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:16,padding:4}} onClick={onClick}>🗑️</button>;
  return(
    <div className="SCR">
      {canEdit&&<button className="btnp fu" onClick={()=>setOpen(true)} style={{marginTop:4}}>✍️ Nova anotação do dia</button>}
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
                  {canEdit&&<Btn onClick={()=>deleteEntry(e.id)}/>}
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

function Baby({week}){
  const{kicks,addKick,resetKicks}=useData();
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
            <button className={`kbtn ${todK>0?"kP":""}`} onClick={()=>addKick(tod())}>
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
          <button className="btno" style={{width:"100%"}} onClick={()=>resetKicks(tod())}>Zerar contador de hoje</button>
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

function Health({appointments,addAppointment,deleteAppointment,medications,addMedication,deleteMedication,symptoms,addSymptom,deleteSymptom}){
  const{can}=usePregnancy();
  const canEdit=can("health","edit");
  const[sub,setSub]=useState("c");
  const[modal,setModal]=useState(null);
  const[cDt,setCDt]=useState(tod());const[cDc,setCDc]=useState("");const[cTp,setCTp]=useState(CTYPES[0]);const[cNt,setCNt]=useState("");
  const[mN,setMN]=useState("");const[mD,setMD]=useState("");const[mT,setMT]=useState("");
  const[sCh,setSCh]=useState([]);const[sNt,setSNt]=useState("");
  const tg=c=>setSCh(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const D=({fn})=><button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:16,padding:4}} onClick={fn}>🗑️</button>;
  async function addC(){if(!cDc.trim())return;await addAppointment({date:cDt,doctor:cDc,type:cTp,notes:cNt});setModal(null);setCDc("");setCNt("");}
  async function addM(){if(!mN.trim())return;await addMedication({name:mN,dose:mD,time:mT});setModal(null);setMN("");setMD("");setMT("");}
  async function addS(){if(!sCh.length&&!sNt.trim())return;await addSymptom({items:sCh,notes:sNt});setModal(null);setSCh([]);setSNt("");}
  return(
    <div className="SCR">
      <div className="stabs fu">
        {[{k:"c",l:"🩺 Consultas"},{k:"m",l:"💊 Medicamentos"},{k:"s",l:"📋 Sintomas"}].map(t=>(
          <button key={t.k} className={`stab ${sub===t.k?"A":""}`} onClick={()=>setSub(t.k)}>{t.l}</button>
        ))}
      </div>
      {sub==="c"&&<>
        {canEdit&&<button className="btnp fu" onClick={()=>setModal("c")}>+ Adicionar consulta</button>}
        <div className="card fu" style={{marginTop:12}}>
          {appointments.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>🩺</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Nenhuma consulta</div><div style={{fontSize:13,color:C.taupe}}>Registre suas consultas de pré-natal</div></div>:
          appointments.map(c=>(
            <div key={c.id} className="LI">
              <div className="liic">🩺</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.vinho}}>{c.type} — {c.doctor}</div><div style={{fontSize:12,color:C.taupe,marginTop:2}}>{fmtD(c.date)}{c.notes?` · ${c.notes}`:""}</div></div>
              {canEdit&&<D fn={()=>deleteAppointment(c.id)}/>}
            </div>
          ))}
        </div>
      </>}
      {sub==="m"&&<>
        {canEdit&&<button className="btnp fu" onClick={()=>setModal("m")}>+ Adicionar medicamento</button>}
        <div className="card fu" style={{marginTop:12}}>
          {medications.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>💊</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Nenhum medicamento</div><div style={{fontSize:13,color:C.taupe}}>Vitaminas, suplementos e remédios</div></div>:
          medications.map(m=>(
            <div key={m.id} className="LI">
              <div className="liic">💊</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.vinho}}>{m.name}</div><div style={{fontSize:12,color:C.taupe,marginTop:2}}>{[m.dose,m.time].filter(Boolean).join(" · ")}</div></div>
              {canEdit&&<D fn={()=>deleteMedication(m.id)}/>}
            </div>
          ))}
        </div>
      </>}
      {sub==="s"&&<>
        {canEdit&&<button className="btnp fu" onClick={()=>setModal("s")}>+ Registrar sintomas</button>}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {symptoms.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>📋</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Nenhum registro</div><div style={{fontSize:13,color:C.taupe}}>Acompanhe seus sintomas diários</div></div>:
          symptoms.map(s=>(
            <div key={s.id} className="dcard fu">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,color:C.taupe}}>{fmtD(s.date)} — {shortD(s.date)}</span>
                {canEdit&&<D fn={()=>deleteSymptom(s.id)}/>}
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

function More({layette,addLayetteItem,toggleLayetteItem,deleteLayetteItem,songs,addSong,deleteSong,photos,addPhoto,deletePhoto,week}){
  const{can}=usePregnancy();
  const canLayette=can("layette","edit");
  const canSongs=can("songs","edit");
  const canPhotos=can("photos","edit");
  const[sub,setSub]=useState("e");
  const[modal,setModal]=useState(null);
  const[sT,setST]=useState("");const[sA,setSA]=useState("");
  const[pU,setPU]=useState("");const[pC,setPC]=useState("");
  const[ni,setNi]=useState("");const[nc,setNc]=useState("👕 Roupinhas");
  const cats=[...new Set(layette.map(i=>i.cat))];
  const done=layette.filter(i=>i.done).length;
  const D=({fn})=><button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:13,padding:4}} onClick={fn}>✕</button>;
  async function addE(){if(!ni.trim())return;await addLayetteItem({cat:nc,n:ni.trim()});setNi("");setModal(null);}
  async function addS(){if(!sT.trim())return;await addSong({title:sT.trim(),artist:sA.trim()});setModal(null);setST("");setSA("");}
  async function addP(){if(!pU.trim())return;await addPhoto({url:pU.trim(),week:week||"—",caption:pC.trim()});setModal(null);setPU("");setPC("");}
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
            <span style={{fontSize:12,color:C.taupe}}>{done}/{layette.length}</span>
          </div>
          <div className="pbar"><div className="pfill" style={{width:layette.length?`${(done/layette.length)*100}%`:"0%"}}/></div>
        </div>
        {canLayette&&<button className="btnp fu" onClick={()=>setModal("e")} style={{marginBottom:12}}>+ Adicionar item</button>}
        <div className="card fu">
          {cats.map(cat=>(
            <div key={cat}>
              <div style={{fontSize:12,fontWeight:600,color:C.vinho,margin:"14px 0 6px",paddingBottom:6,borderBottom:`1px solid ${C.bege}`}}>{cat}</div>
              {layette.filter(i=>i.cat===cat).map(item=>(
                <div key={item.id} className="cki">
                  <div className={`cb ${item.done?"C":""}`} onClick={()=>canLayette&&toggleLayetteItem(item.id,!item.done)} style={{cursor:canLayette?"pointer":"default"}}>
                    {item.done&&<span style={{fontSize:12,color:"white"}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:item.done?C.taupe:C.vinho,textDecoration:item.done?"line-through":"none",flex:1}}>{item.n}</span>
                  {canLayette&&<D fn={()=>deleteLayetteItem(item.id)}/>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </>}
      {sub==="s"&&<>
        {canSongs&&<button className="btnp fu" onClick={()=>setModal("s")}>+ Adicionar música</button>}
        <div className="card fu" style={{marginTop:12}}>
          {songs.length===0?<div className="emp"><div style={{fontSize:36,marginBottom:8}}>🎵</div><div style={{fontFamily:SF,fontSize:18,color:C.vinho,marginBottom:4}}>Playlist vazia</div><div style={{fontSize:13,color:C.taupe}}>Crie uma playlist especial para o bebê</div></div>:
          songs.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.bege}33`}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:`${C.rosa}22`,border:`1.5px solid ${C.rosa}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🎵</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:C.vinho}}>{s.title}</div>
                {s.artist&&<div style={{fontSize:11,color:C.taupe}}>{s.artist}</div>}
              </div>
              {canSongs&&<button style={{background:"none",border:"none",cursor:"pointer",color:C.taupe,fontSize:16}} onClick={()=>deleteSong(s.id)}>🗑️</button>}
            </div>
          ))}
        </div>
      </>}
      {sub==="p"&&(
        <div className="card fu">
          <div className="ctit"><span>📸</span>Fotos da Barriga</div>
          <p style={{fontSize:12,color:C.taupe,marginBottom:14,lineHeight:1.5}}>Cole o link de uma foto (Google Fotos, Drive) para guardar na timeline da gestação.</p>
          <div className="pgrid">
            {canPhotos&&<div className="padd" onClick={()=>setModal("p")}><span>+</span><span style={{fontSize:10,color:C.taupe}}>Nova foto</span></div>}
            {photos.map(p=>(
              <div key={p.id} className="pthumb" onClick={()=>canPhotos&&deletePhoto(p.id)} style={{cursor:canPhotos?"pointer":"default"}}>
                <img src={p.url} alt={`Sem ${p.week}`} onError={e=>e.target.style.display="none"}/>
                <span style={{position:"absolute",bottom:5,left:0,right:0,textAlign:"center",fontSize:9,color:"white",textShadow:"0 1px 4px rgba(0,0,0,.5)"}}>Sem. {p.week}</span>
              </div>
            ))}
          </div>
          {canPhotos&&photos.length>0&&<p style={{fontSize:11,color:C.taupe,textAlign:"center",marginTop:8}}>Toque em uma foto para remover</p>}
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
  const { user, loading: authLoading } = useAuth();
  const { pregnancy, pregnancies, myRole, loading: pregLoading, updatePregnancy, selectPregnancy } = usePregnancy();
  const {
    diary, addDiaryEntry, deleteDiaryEntry,
    kicks, addKick, resetKicks,
    appointments, addAppointment, deleteAppointment,
    medications, addMedication, deleteMedication,
    symptoms, addSymptom, deleteSymptom,
    layette, addLayetteItem, toggleLayetteItem, deleteLayetteItem,
    songs, addSong, deleteSong,
    photos, addPhoto, deletePhoto,
  } = useData();
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const tRef = useRef(null);

  // Detecta convite na URL (?invite=ID)
  const inviteId = new URLSearchParams(window.location.search).get("invite");

  const palette = pregnancy?.theme?.palette ?? "rosa-bella";
  C = getColors(palette); // atualiza o C do módulo para que os sub-componentes usem o tema correto
  const CSS = buildCSS(C);

  const week = pregnancy ? calcWeek(pregnancy.lmp) : null;
  const tri  = week ? getTri(week) : null;
  const dl   = pregnancy ? dLeft(pregnancy.dpp) : null;

  function showT(msg){ clearTimeout(tRef.current); setToast(msg); tRef.current = setTimeout(()=>setToast(null), 2300); }

  // Loading inicial
  if (authLoading || pregLoading) return (
    <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f7ece0"}}>
      <span style={{fontFamily:SF,fontSize:32,color:"#4e2b53"}}>Bella <em style={{fontStyle:"italic",color:"#c38a97"}}>Gravidez</em></span>
    </div>
  );

  // Rota admin
  if (window.location.pathname.includes("/admin")) return <Suspense fallback={<Loading/>}><Admin /></Suspense>;

  // Convite na URL → tela de aceitar convite
  if (inviteId) return <InviteAccept inviteId={inviteId} onDone={() => {
    window.history.replaceState({}, "", "/bella-gravidez/");
    window.location.reload();
  }} />;

  // Não autenticada → tela de login
  if (!user) return <Login />;

  // Autenticada mas sem gestação → criar gestação
  if (!pregnancy) return <CreatePregnancy />;

  const NAV=[{id:"home",ic:"🏠",l:"Início"},{id:"diary",ic:"📖",l:"Diário"},{id:"contractions",ic:"⏱️",l:"Contrações"},{id:"birth",ic:"🌟",l:"Parto"},{id:"more",ic:"☰",l:"Mais"}];

  return(
    <>
      <style>{CSS}</style>
      <div className="R">
        <div className="HDR">
          <div className="HT">
            <span className="brand">
              {pregnancy.babyNickname
                ? <>Bella <em>{pregnancy.babyNickname}</em></>
                : <>Bella <em>Gravidez</em></>
              }
            </span>
            <button className="hcfg" onClick={()=>setModal("cfg")}>⚙️</button>
          </div>

          {/* Seletor de gestação (pai/doula/obstetra com mais de uma) + selo do perfil */}
          {(pregnancies.length>1 || myRole!=="mae") && (
            <div style={{padding:"4px 20px 0",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {myRole!=="mae" && (
                <span style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:"rgba(238,209,184,.7)",background:"rgba(238,209,184,.12)",padding:"3px 10px",borderRadius:20}}>
                  {myRole==="pai"?"👨‍👩‍👧 Pai":myRole==="doula"?"🤱 Doula":"👩‍⚕️ Obstetra"}
                </span>
              )}
              {pregnancies.length>1 && (
                <select
                  value={pregnancy.id}
                  onChange={e=>selectPregnancy(e.target.value)}
                  style={{
                    flex:1,minWidth:140,background:"rgba(238,209,184,.12)",color:"#eed1b8",
                    border:"1px solid rgba(238,209,184,.25)",borderRadius:10,padding:"6px 10px",
                    fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",
                  }}
                >
                  {pregnancies.map(p=>(
                    <option key={p.id} value={p.id} style={{color:"#4e2b53"}}>
                      {p.babyNickname ? `Bebê ${p.babyNickname}` : "Gestação"}{p.role!=="mae"?` · ${p.role}`:""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

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

        {tab==="home"&&<Home preg={pregnancy} week={week} onCfg={()=>setModal("cfg")}/>}
        {tab==="diary"&&<Diary entries={diary} addEntry={addDiaryEntry} deleteEntry={deleteDiaryEntry} week={week}/>}
        {tab==="contractions"&&<Contractions/>}
        {tab==="tips"&&<Tips/>}
        {tab==="birthplan"&&<Suspense fallback={<Loading/>}><BirthPlan/></Suspense>}
        {tab==="birth"&&<Suspense fallback={<Loading/>}><BirthTracker/></Suspense>}
        {tab==="health"&&<Health
          appointments={appointments} addAppointment={addAppointment} deleteAppointment={deleteAppointment}
          medications={medications} addMedication={addMedication} deleteMedication={deleteMedication}
          symptoms={symptoms} addSymptom={addSymptom} deleteSymptom={deleteSymptom}
        />}
        {tab==="more"&&<More
          layette={layette} addLayetteItem={addLayetteItem} toggleLayetteItem={toggleLayetteItem} deleteLayetteItem={deleteLayetteItem}
          songs={songs} addSong={addSong} deleteSong={deleteSong}
          photos={photos} addPhoto={addPhoto} deletePhoto={deletePhoto}
          week={week}
        />}

        <div className="NAV">
          {NAV.map(n=>(
            <button key={n.id} className={`nb ${tab===n.id?"A":""}`} onClick={()=>setTab(n.id)}>
              <div className="ni">{n.ic}</div>
              <span className="nl">{n.l}</span>
            </button>
          ))}
        </div>

        {modal==="cfg"&&(
          <Mdl title="Configurações" onClose={()=>setModal(null)}>
            <div style={{marginBottom:20,display:"flex",flexDirection:"column",gap:8}}>
              {[
                {id:"members",   ic:"👥", t:"Membros e convites",    s:"Pai, doula, obstetra e permissões"},
                {id:"personal",  ic:"🎨", t:"Personalização",        s:"Cores e apelido do bebê"},
                {id:"legal",     ic:"🔒", t:"Conta e privacidade",   s:"Termos, privacidade e excluir conta"},
                {id:"admin",     ic:"👑", t:"Painel Admin",          s:"Acesso master — gestão da plataforma"},
              ].map(btn=>(
                <button key={btn.id} onClick={()=>btn.id==="admin"?window.location.href="/bella-gravidez/admin":setModal(btn.id)} style={{
                  width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
                  background:`rgba(238,209,184,.2)`,border:`1.5px solid ${C.bege}`,borderRadius:14,
                  cursor:"pointer",
                }}>
                  <span style={{fontSize:22}}>{btn.ic}</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:14,fontWeight:500,color:C.vinho}}>{btn.t}</div>
                    <div style={{fontSize:12,color:C.taupe}}>{btn.s}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:C.rosa}}>→</span>
                </button>
              ))}
            </div>
            <DateForm
              initial={pregnancy}
              onSave={d=>{ updatePregnancy(d); setModal(null); showT("📅 Data atualizada!"); }}
              onCancel={()=>setModal(null)}
            />
          </Mdl>
        )}

        {modal==="members"&&(
          <Mdl title="Membros" sub="Gerencie quem acompanha sua gestação" onClose={()=>setModal(null)}>
            <Members onClose={()=>setModal(null)}/>
          </Mdl>
        )}

        {modal==="personal"&&(
          <Mdl title="Personalização" sub="Deixe o app com a sua cara 🎨" onClose={()=>setModal(null)}>
            <Personalization onClose={()=>setModal(null)}/>
          </Mdl>
        )}

        {modal==="legal"&&(
          <Mdl title="Conta e privacidade" onClose={()=>setModal(null)}>
            <Legal onClose={()=>setModal(null)}/>
          </Mdl>
        )}

        {toast&&<div className="toast">{toast}</div>}
      </div>
    </>
  );
}
