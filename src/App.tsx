import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// SHARED UTILS
// ═══════════════════════════════════════════════════════
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=rand(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function speak(text,rate=0.85){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=rate;u.pitch=1.1;window.speechSynthesis.speak(u);}

const YOUNG_AGES=["유치원 (5~7세)","초등학생 (8~12세)"];
const EMOJI_MAP={apple:"🍎",banana:"🍌",orange:"🍊",grape:"🍇",strawberry:"🍓",watermelon:"🍉",lemon:"🍋",peach:"🍑",cherry:"🍒",pear:"🍐",cat:"🐱",dog:"🐶",rabbit:"🐰",bear:"🐻",fox:"🦊",lion:"🦁",tiger:"🐯",elephant:"🐘",monkey:"🐵",bird:"🐦",fish:"🐟",duck:"🦆",cow:"🐄",pig:"🐷",horse:"🐴",sheep:"🐑",chicken:"🐔",frog:"🐸",turtle:"🐢",sun:"☀️",moon:"🌙",star:"⭐",cloud:"☁️",rain:"🌧️",snow:"❄️",flower:"🌸",tree:"🌲",leaf:"🍃",house:"🏠",school:"🏫",car:"🚗",bus:"🚌",bike:"🚲",train:"🚂",plane:"✈️",boat:"⛵",book:"📚",pencil:"✏️",pen:"🖊️",bag:"🎒",ball:"⚽",toy:"🧸",red:"🔴",blue:"🔵",green:"🟢",yellow:"🟡",purple:"🟣",happy:"😊",sad:"😢",angry:"😠",surprised:"😲",scared:"😨",water:"💧",milk:"🥛",juice:"🍹",bread:"🍞",rice:"🍚",cake:"🎂",cookie:"🍪",hot:"🔥",cold:"🧊",big:"🦣",small:"🐭",fast:"⚡",slow:"🐢",mother:"👩",father:"👨",baby:"👶",friend:"👫",teacher:"👩‍🏫"};
function getEmoji(w){return EMOJI_MAP[(w||"").toLowerCase().replace(/[^a-z]/g,"")]||"";}
function parseInput(wi,si){return{words:wi.split(/[\n,]+/).map(w=>w.trim()).filter(Boolean),sentences:si.split(/\n+/).map(s=>s.trim()).filter(Boolean)};}
const FALLBACK_EMOJIS=["🌀","💠","🔷","🟦","🟨","🟩","🟪","🟥"];

// ═══════════════════════════════════════════════════════
// SVG AVATARS
// ═══════════════════════════════════════════════════════
const AvatarA=({size=44})=><svg width={size} height={size} viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2"/><ellipse cx="22" cy="13" rx="12" ry="9" fill="#92400e"/><rect x="10" y="13" width="4" height="12" rx="2" fill="#92400e"/><rect x="30" y="13" width="4" height="12" rx="2" fill="#92400e"/><ellipse cx="22" cy="24" rx="10" ry="11" fill="#fde8d0"/><ellipse cx="18" cy="22" rx="2" ry="2.2" fill="#1f2937"/><ellipse cx="26" cy="22" rx="2" ry="2.2" fill="#1f2937"/><circle cx="18.7" cy="21.3" r="0.7" fill="white"/><circle cx="26.7" cy="21.3" r="0.7" fill="white"/><ellipse cx="15" cy="25" rx="2.5" ry="1.5" fill="#fca5a5" opacity="0.5"/><ellipse cx="29" cy="25" rx="2.5" ry="1.5" fill="#fca5a5" opacity="0.5"/><path d="M17 27 Q22 31 27 27" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/><rect x="10" y="11" width="24" height="4" rx="2" fill="#ec4899" opacity="0.7"/></svg>;
const AvatarB=({size=44})=><svg width={size} height={size} viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2"/><ellipse cx="22" cy="13" rx="11" ry="7" fill="#1f2937"/><rect x="11" y="12" width="22" height="5" fill="#1f2937"/><ellipse cx="22" cy="25" rx="10" ry="11" fill="#fde8d0"/><ellipse cx="18" cy="23" rx="2" ry="2.2" fill="#1f2937"/><ellipse cx="26" cy="23" rx="2" ry="2.2" fill="#1f2937"/><circle cx="18.7" cy="22.3" r="0.7" fill="white"/><circle cx="26.7" cy="22.3" r="0.7" fill="white"/><ellipse cx="15" cy="26" rx="2.5" ry="1.5" fill="#fca5a5" opacity="0.4"/><ellipse cx="29" cy="26" rx="2.5" ry="1.5" fill="#fca5a5" opacity="0.4"/><path d="M17 28 Q22 32 27 28" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>;

// ═══════════════════════════════════════════════════════
// OX QUIZ CARD
// ═══════════════════════════════════════════════════════
function OXQuizCard({item,i,isYoung}){
  const[revealed,setRevealed]=useState(false);
  const isO=item.answer===true||item.answer==="true"||item.answer==="O";
  const emoji=getEmoji(item.word)||item.emoji||"🖼️";
  const bgs=["#fce7f3","#dbeafe","#d1fae5","#fef3c7","#ede9fe","#ffedd5"];
  const bds=["#f9a8d4","#93c5fd","#6ee7b7","#fcd34d","#c4b5fd","#fdba74"];
  return(
    <div style={{border:`3px solid ${bds[i%6]}`,borderRadius:20,padding:20,background:bgs[i%6],textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10,boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
      <div style={{fontSize:isYoung?64:48}}>{emoji}</div>
      <div style={{fontWeight:700,fontSize:isYoung?16:14,color:"#1f2937",lineHeight:1.5}}>Q{i+1}. {item.question}</div>
      {item.word&&<span style={{background:"rgba(255,255,255,0.7)",borderRadius:10,padding:"2px 10px",fontSize:12,color:"#6b7280",fontWeight:600}}>🔑 {item.word}</span>}
      <div style={{display:"flex",gap:16}}>
        <div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #ef4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#ef4444",background:"white"}}>✕</div>
        <div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:900,color:"#22c55e",background:"white"}}>○</div>
      </div>
      <button onClick={()=>setRevealed(r=>!r)} className="no-print" style={{border:"none",borderRadius:10,padding:"6px 18px",background:revealed?"#e5e7eb":"#4f46e5",color:revealed?"#374151":"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>{revealed?"숨기기":"정답 확인"}</button>
      {revealed&&<div style={{fontSize:20,fontWeight:800,color:isO?"#16a34a":"#dc2626",background:"white",borderRadius:12,padding:"6px 24px",border:`2px solid ${isO?"#86efac":"#fca5a5"}`}}>{isO?"⭕ 맞아요!":"✕ 아니에요!"}{item.explanation&&<div style={{fontSize:12,color:"#6b7280",fontWeight:400,marginTop:4}}>{item.explanation}</div>}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WORD QUIZ
// ═══════════════════════════════════════════════════════
function WordQuiz({words,onCoin}){
  const[quizWord,setQuizWord]=useState(null);
  const[clues,setClues]=useState([]);
  const[revealed,setRevealed]=useState(0);
  const[input,setInput]=useState("");
  const[result,setResult]=useState(null);
  const[loading,setLoading]=useState(false);
  const[history,setHistory]=useState([]);
  const[usedWords,setUsedWords]=useState([]);
  const inputRef=useRef();

  async function fetchClues(word){
    setLoading(true);setClues([]);setRevealed(0);setInput("");setResult(null);
    const prompt=`Give exactly 6 English clues for the word "${word}" for very young learners (kindergarten, age 5-7).
Use EXTREMELY simple words. Very short sentences (max 5 words). Start very vague, get more specific.
Example: "It is a food.", "It is sweet.", "It is red.", "You eat it.", "It grows on trees.", "It is an apple."
Return ONLY a JSON array of 6 strings, no markdown: ["clue1","clue2","clue3","clue4","clue5","clue6"]`;
    try{
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-3-5-sonnet-20241022",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"[]";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setClues(parsed);setRevealed(1);
    }catch(e){setClues(["Sorry, could not load clues."]);setRevealed(1);}
    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  }

  function startNew(){
    const available=words.filter(w=>!usedWords.includes(w));
    const pool=available.length>0?available:words;
    const w=pool[rand(0,pool.length-1)];
    setQuizWord(w);setUsedWords(u=>[...u,w]);fetchClues(w);
  }

  function submit(){
    const guess=input.trim().toLowerCase();
    if(!guess)return;
    if(guess===quizWord.toLowerCase()){
      setResult({type:"correct",cluesUsed:revealed});
      setHistory(h=>[{word:quizWord,cluesUsed:revealed},...h.slice(0,9)]);
      onCoin(3);
    }else{
      setResult({type:"wrong",guess});
    }
  }

  return(
    <div>
      <h2 style={{color:"#4f46e5",marginTop:0}}>🧩 단어 퀴즈</h2>
      <p style={{color:"#6b7280",fontSize:13,marginBottom:20}}>영어 설명을 읽고 단어를 맞춰보세요! 맞추면 🪙 코인 3개!</p>

      {!quizWord&&!loading&&(
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:64,marginBottom:12}}>🧩</div>
          <button onClick={startNew} style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:16,padding:"14px 36px",fontSize:18,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 20px rgba(79,70,229,0.4)"}}>🎮 퀴즈 시작!</button>
        </div>
      )}

      {loading&&(
        <div style={{textAlign:"center",padding:"32px 0",color:"#9ca3af"}}>
          <div style={{fontSize:48,marginBottom:8,animation:"spin 1s linear infinite",display:"inline-block"}}>🌀</div>
          <div style={{fontSize:15,fontWeight:600}}>힌트를 만드는 중...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {quizWord&&!loading&&clues.length>0&&(
        <div>
          <div style={{background:"#f8fafc",borderRadius:20,padding:24,marginBottom:16,border:"2px solid #e0e7ff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontWeight:800,fontSize:14,color:"#4f46e5"}}>📋 힌트 ({revealed}/{clues.length})</div>
              <div style={{display:"flex",gap:6}}>
                {Array.from({length:clues.length},(_,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<revealed?"#4f46e5":"#e5e7eb",transition:"background 0.3s"}}/>)}
              </div>
            </div>
            {clues.slice(0,revealed).map((clue,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:16,alignItems:"flex-start",animation:"fadeIn 0.4s ease"}}>
                <div style={{flexShrink:0,width:34,height:34,borderRadius:"50%",background:i===revealed-1?"#4f46e5":"#e0e7ff",color:i===revealed-1?"white":"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15}}>{i+1}</div>
                <div style={{fontSize:i===revealed-1?28:20,color:i===revealed-1?"#1f2937":"#9ca3af",lineHeight:1.5,fontWeight:i===revealed-1?800:500,transition:"all 0.3s"}}>{clue}</div>
              </div>
            ))}
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
          </div>

          {result?.type==="correct"&&(
            <div style={{background:"#d1fae5",borderRadius:16,padding:16,marginBottom:16,border:"2px solid #6ee7b7",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:4}}>🎉</div>
              <div style={{fontWeight:900,fontSize:20,color:"#065f46"}}>정답! "{quizWord}"</div>
              <div style={{fontSize:14,color:"#047857",marginTop:4}}>힌트 {result.cluesUsed}개 사용 · 🪙 코인 3개 획득!</div>
              <button onClick={startNew} style={{marginTop:12,background:"#10b981",color:"white",border:"none",borderRadius:12,padding:"10px 28px",fontWeight:800,cursor:"pointer",fontSize:15}}>다음 단어 ▶</button>
            </div>
          )}
          {result?.type==="wrong"&&(
            <div style={{background:"#fee2e2",borderRadius:12,padding:"10px 16px",marginBottom:12,border:"2px solid #fca5a5",fontSize:13,fontWeight:600,color:"#dc2626"}}>❌ "{result.guess}" 는 아니에요! 다시 시도해봐요.</div>
          )}

          {result?.type!=="correct"&&(
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="단어를 영어로 입력하세요..." style={{flex:1,border:"2px solid #c7d2fe",borderRadius:12,padding:"10px 14px",fontSize:15,outline:"none",fontFamily:"inherit"}}/>
              <button onClick={submit} style={{background:"#4f46e5",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:800,cursor:"pointer",fontSize:15}}>✓</button>
            </div>
          )}

          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {result?.type!=="correct"&&revealed<clues.length&&(
              <button onClick={()=>setRevealed(r=>r+1)} style={{background:"#fef3c7",border:"2px solid #fcd34d",borderRadius:12,padding:"8px 18px",fontWeight:700,cursor:"pointer",fontSize:13,color:"#92400e"}}>💡 힌트 더 보기 ({revealed}/{clues.length})</button>
            )}
            {result?.type!=="correct"&&(
              <button onClick={()=>{setResult({type:"correct",cluesUsed:revealed,skipped:true});setHistory(h=>[{word:quizWord,cluesUsed:revealed,skipped:true},...h.slice(0,9)]);}} style={{background:"#f3f4f6",border:"2px solid #e5e7eb",borderRadius:12,padding:"8px 18px",fontWeight:700,cursor:"pointer",fontSize:13,color:"#6b7280"}}>🏳️ 포기</button>
            )}
          </div>
          {result?.type==="correct"&&result.skipped&&(
            <div style={{marginTop:10,background:"#e0e7ff",borderRadius:12,padding:"10px 16px",fontWeight:700,color:"#4f46e5",fontSize:16}}>정답: {quizWord} {getEmoji(quizWord)}</div>
          )}
        </div>
      )}

      {history.length>0&&(
        <div style={{marginTop:20,background:"white",borderRadius:16,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>📊 기록</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {history.map((h,i)=>(
              <div key={i} style={{background:h.skipped?"#f3f4f6":"#d1fae5",borderRadius:10,padding:"5px 12px",fontSize:12,fontWeight:700,color:h.skipped?"#6b7280":"#065f46",display:"flex",alignItems:"center",gap:5}}>
                {getEmoji(h.word)||"📝"} {h.word}
                {!h.skipped&&<span style={{color:"#f59e0b"}}>🪙×3</span>}
                <span style={{color:"#9ca3af",fontWeight:400}}>힌트{h.cluesUsed}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WORD POP (Bubble)
// ═══════════════════════════════════════════════════════
const BUBBLE_COLORS=["#a78bfa","#60a5fa","#34d399","#f472b6","#fb923c","#fbbf24","#f87171","#818cf8"];
const SPEED_PRESETS=[{label:"🐢 느림",interval:2200,duration:26},{label:"🐇 보통",interval:1400,duration:18},{label:"⚡ 빠름",interval:850,duration:12}];
const COLS_COUNT=5;
const BSIZE=84;

function useParticles(){
  const[particles,setParticles]=useState([]);
  function burst(x,y){
    const np=Array.from({length:16},(_,i)=>({id:Date.now()+i,x,y,color:BUBBLE_COLORS[rand(0,BUBBLE_COLORS.length-1)],size:rand(6,13)}));
    setParticles(p=>[...p,...np]);
    setTimeout(()=>setParticles(p=>p.filter(pp=>!np.find(n=>n.id===pp.id))),800);
  }
  return{particles,burst};
}

function WordPop({words,onScore}){
  const[bubbles,setBubbles]=useState([]);
  const[target,setTarget]=useState(null);
  const[score,setScore]=useState(0);
  const[miss,setMiss]=useState(0);
  const[started,setStarted]=useState(false);
  const[gameOver,setGameOver]=useState(false);
  const[flash,setFlash]=useState(null);
  const[speedIdx,setSpeedIdx]=useState(1);
  const{particles,burst}=useParticles();
  const intervalRef=useRef();
  const idRef=useRef(0);
  const bubblesRef=useRef([]);
  const targetRef=useRef(null);
  const scoreRef=useRef(0);

  useEffect(()=>{bubblesRef.current=bubbles;},[bubbles]);
  useEffect(()=>{scoreRef.current=score;},[score]);
  useEffect(()=>{targetRef.current=target;},[target]);

  function pickTarget(ws){const w=ws[rand(0,ws.length-1)];setTarget(w);targetRef.current=w;setTimeout(()=>speak(w),350);return w;}
  function findLane(cur){const laneW=100/COLS_COUNT;const centers=Array.from({length:COLS_COUNT},(_,i)=>Math.round(laneW/2+i*laneW));const shuffled=shuffle([...centers]);for(const cx of shuffled){if(!cur.some(b=>Math.abs(b.x-cx)<15))return cx;}return centers[rand(0,COLS_COUNT-1)];}

  function startGame(){
    clearInterval(intervalRef.current);
    setBubbles([]);bubblesRef.current=[];setScore(0);scoreRef.current=0;setMiss(0);setGameOver(false);
    pickTarget(words);
    const preset=SPEED_PRESETS[speedIdx];
    intervalRef.current=setInterval(()=>{
      const w=words[rand(0,words.length-1)];const id=idRef.current++;
      const lane=findLane(bubblesRef.current);
      const nb={id,word:w,x:lane,color:BUBBLE_COLORS[rand(0,BUBBLE_COLORS.length-1)],duration:preset.duration};
      setBubbles(prev=>{const next=[...prev,nb];bubblesRef.current=next;return next;});
      setTimeout(()=>setBubbles(prev=>{const next=prev.filter(b=>b.id!==id);bubblesRef.current=next;return next;}),preset.duration*1000);
    },preset.interval);
    setStarted(true);
  }
  function stopGame(){clearInterval(intervalRef.current);setStarted(false);setGameOver(true);}
  useEffect(()=>()=>clearInterval(intervalRef.current),[]);

  function popBubble(id,word,e){
    if(!started||!targetRef.current)return;
    const rect=e.currentTarget.getBoundingClientRect();
    burst(rect.left+rect.width/2,rect.top+rect.height/2);
    if(word===targetRef.current){
      setFlash("good");const next=scoreRef.current+1;setScore(next);scoreRef.current=next;
      setBubbles(b=>{const nb=b.filter(bb=>bb.id!==id);bubblesRef.current=nb;return nb;});
      setTimeout(()=>setFlash(null),400);
      if(next%4===0)onScore(1);
      setTimeout(()=>pickTarget(words),600);
    }else{setFlash("bad");setMiss(m=>m+1);setTimeout(()=>setFlash(null),400);}
  }

  return(
    <div style={{position:"relative",userSelect:"none"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
        {particles.map(p=><div key={p.id} style={{position:"absolute",left:p.x,top:p.y,width:p.size,height:p.size,borderRadius:"50%",background:p.color,animation:"particlePop 0.8s ease-out forwards",transform:"translate(-50%,-50%)"}}/>)}
        <style>{`@keyframes particlePop{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(calc(-50% + ${rand(-50,50)}px),calc(-50% - 70px)) scale(0)}}`}</style>
      </div>
      {flash==="good"&&<div style={{position:"fixed",inset:0,background:"rgba(110,231,183,0.25)",zIndex:100,pointerEvents:"none"}}/>}
      {flash==="bad"&&<div style={{position:"fixed",inset:0,background:"rgba(252,165,165,0.25)",zIndex:100,pointerEvents:"none"}}/>}

      {!started&&!gameOver&&(
        <div style={{textAlign:"center",padding:"28px 16px"}}>
          <div style={{fontSize:60,marginBottom:8}}>🫧</div>
          <div style={{fontSize:22,fontWeight:900,color:"#4f46e5",marginBottom:6}}>Word Pop!</div>
          <div style={{fontSize:13,color:"#6b7280",marginBottom:18,lineHeight:1.8}}>소리를 듣고 맞는 그림 비눗방울을 터뜨려요!<br/>4개 맞추면 코인 🪙 획득!</div>
          <div style={{marginBottom:20}}><div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:8}}>⚙️ 속도</div><div style={{display:"flex",gap:8,justifyContent:"center"}}>{SPEED_PRESETS.map((p,i)=><button key={i} onClick={()=>setSpeedIdx(i)} style={{border:`2px solid ${speedIdx===i?"#4f46e5":"#c7d2fe"}`,background:speedIdx===i?"#4f46e5":"white",color:speedIdx===i?"white":"#4f46e5",borderRadius:12,padding:"6px 14px",fontWeight:700,cursor:"pointer",fontSize:13}}>{p.label}</button>)}</div></div>
          <button onClick={startGame} style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:18,padding:"14px 36px",fontSize:20,fontWeight:900,cursor:"pointer",boxShadow:"0 6px 20px rgba(79,70,229,0.4)"}}>▶ 시작!</button>
        </div>
      )}
      {gameOver&&(
        <div style={{textAlign:"center",padding:"28px 16px"}}>
          <div style={{fontSize:56,marginBottom:8}}>🎉</div>
          <div style={{fontSize:20,fontWeight:900,color:"#4f46e5",marginBottom:4}}>게임 종료!</div>
          <div style={{fontSize:16,color:"#374151",marginBottom:4}}>✅ {score}개 맞춤 ❌ {miss}개 틀림</div>
          <div style={{fontSize:13,color:"#f59e0b",marginBottom:18}}>🪙 코인 {Math.floor(score/4)}개 획득!</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>{SPEED_PRESETS.map((p,i)=><button key={i} onClick={()=>setSpeedIdx(i)} style={{border:`2px solid ${speedIdx===i?"#4f46e5":"#c7d2fe"}`,background:speedIdx===i?"#4f46e5":"white",color:speedIdx===i?"white":"#4f46e5",borderRadius:10,padding:"5px 12px",fontWeight:700,cursor:"pointer",fontSize:12}}>{p.label}</button>)}</div>
          <button onClick={startGame} style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:16,padding:"12px 32px",fontSize:18,fontWeight:900,cursor:"pointer"}}>🔄 다시!</button>
        </div>
      )}
      {started&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontWeight:800,fontSize:14,color:"#374151"}}>✅ {score} ❌ {miss}</div>
            <div style={{background:"#fef3c7",borderRadius:12,padding:"6px 16px",fontWeight:900,fontSize:18,color:"#92400e",border:"2px solid #fcd34d",textAlign:"center"}}>
              <div style={{fontSize:9,color:"#b45309"}}>터뜨려요!</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:22}}>{getEmoji(target)||"📝"}</span>
                <span>{target}</span>
                <span>🔊</span>
              </div>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {SPEED_PRESETS.map((p,i)=><button key={i} onClick={()=>{setSpeedIdx(i);clearInterval(intervalRef.current);setTimeout(startGame,60);}} style={{border:`2px solid ${speedIdx===i?"#4f46e5":"#c7d2fe"}`,background:speedIdx===i?"#4f46e5":"white",color:speedIdx===i?"white":"#6b7280",borderRadius:6,padding:"2px 6px",fontWeight:700,cursor:"pointer",fontSize:10}}>{p.label.split(" ")[0]}</button>)}
              <button onClick={stopGame} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,padding:"5px 8px",fontWeight:700,cursor:"pointer",fontSize:11}}>⏹</button>
            </div>
          </div>
          <div style={{position:"relative",height:380,background:"linear-gradient(180deg,#e0f2fe,#ede9fe)",borderRadius:18,overflow:"hidden",border:"2px solid #c7d2fe",marginBottom:8}}>
            {bubbles.map(b=>{
              const emoji=getEmoji(b.word)||FALLBACK_EMOJIS[rand(0,FALLBACK_EMOJIS.length-1)];
              return(
                <div key={b.id} onClick={e=>popBubble(b.id,b.word,e)} style={{position:"absolute",left:`calc(${b.x}% - ${BSIZE/2}px)`,bottom:`-${BSIZE}px`,width:BSIZE,height:BSIZE,borderRadius:"50%",background:`radial-gradient(circle at 30% 30%,rgba(255,255,255,0.85),${b.color}88)`,border:`3px solid ${b.color}cc`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none",boxShadow:`0 0 16px ${b.color}55,inset 0 0 12px rgba(255,255,255,0.5)`,animation:`bubbleUp${b.id} ${b.duration}s linear forwards`,zIndex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#374151",textShadow:"0 1px 2px rgba(255,255,255,0.9)",textAlign:"center",padding:"0 6px",lineHeight:1.2}}>{b.word}</div>
                  <style>{`@keyframes bubbleUp${b.id}{0%{bottom:-${BSIZE}px;opacity:0.95}100%{bottom:105%;opacity:0.6}}`}</style>
                </div>
              );
            })}
          </div>
          <button onClick={()=>speak(target)} style={{width:"100%",background:"#fef3c7",border:"2px solid #fcd34d",borderRadius:10,padding:"7px",fontWeight:700,cursor:"pointer",fontSize:13,color:"#92400e"}}>🔊 다시 듣기</button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BINGO + SPINNER
// ═══════════════════════════════════════════════════════
const SPIN_COLORS=["#4f46e5","#7c3aed","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#06b6d4","#84cc16","#f97316","#a855f7"];

function SpinnerWheel({words,onCall}){
  const[angle,setAngle]=useState(0);
  const[spinning,setSpinning]=useState(false);
  const[landed,setLanded]=useState(null);
  const count=words.length||1;const slice=360/count;
  const cx=110,cy=110,r=95;
  function polar(deg,radius){const rad=(deg-90)*Math.PI/180;return[cx+radius*Math.cos(rad),cy+radius*Math.sin(rad)];}
  function spin(){
    if(spinning||words.length===0)return;setSpinning(true);setLanded(null);
    const extra=5+Math.floor(Math.random()*5);const landSlice=Math.floor(Math.random()*count);
    const target=extra*360+landSlice*slice+slice/2;const final=angle+target;setAngle(final);
    setTimeout(()=>{const norm=((final%360)+360)%360;const ptr=(270-norm+360)%360;const idx=Math.floor(ptr/slice)%count;const word=words[idx];setLanded(word);onCall(word);setSpinning(false);},3200);
  }
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1}}>▼ 돌림판</div>
      <div style={{position:"relative",width:220,height:220}}>
        <div style={{position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",fontSize:22,zIndex:10,filter:"drop-shadow(0 2px 3px rgba(0,0,0,0.3))"}}>▼</div>
        <svg width="220" height="220" style={{transform:`rotate(${angle}deg)`,transition:spinning?"transform 3.2s cubic-bezier(0.17,0.67,0.12,0.99)":"none",borderRadius:"50%",boxShadow:"0 4px 20px rgba(79,70,229,0.25)"}}>
          {words.map((word,i)=>{const sa=i*slice,ea=sa+slice;const[x1,y1]=polar(sa,r);const[x2,y2]=polar(ea,r);const la=slice>180?1:0;const[mx,my]=polar(sa+slice/2,r*0.62);const emoji=getEmoji(word)||"📝";const[ex,ey]=polar(sa+slice/2,r*0.83);return(<g key={i}><path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${la} 1 ${x2},${y2} Z`} fill={SPIN_COLORS[i%SPIN_COLORS.length]} stroke="white" strokeWidth="2"/><text x={ex} y={ey} textAnchor="middle" dominantBaseline="middle" fontSize={count<=8?14:10}>{emoji}</text><text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize={count<=6?12:count<=10?9:7} fontWeight="800" fill="white">{word.length>7?word.slice(0,6)+"…":word}</text></g>);})}
          <circle cx={cx} cy={cy} r="16" fill="white" stroke="#4f46e5" strokeWidth="3"/>
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12">🎯</text>
        </svg>
      </div>
      <button onClick={spin} disabled={spinning} style={{background:spinning?"#e5e7eb":"linear-gradient(135deg,#4f46e5,#7c3aed)",color:spinning?"#9ca3af":"white",border:"none",borderRadius:14,padding:"10px 28px",fontSize:16,fontWeight:900,cursor:spinning?"default":"pointer",boxShadow:spinning?"none":"0 4px 12px rgba(79,70,229,0.3)"}}>{spinning?"🌀 돌아가는 중…":"🎡 돌리기!"}</button>
      {landed&&<div style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",borderRadius:14,padding:"8px 22px",fontWeight:900,fontSize:18,textAlign:"center"}}><div style={{fontSize:28}}>{getEmoji(landed)||"⭐"}</div>{landed}</div>}
    </div>
  );
}

function BingoBoard({words,calledWords,playerIdx,playerName}){
  const isA=playerIdx===0;
  const[grid]=useState(()=>shuffle(words).slice(0,9));
  const[marked,setMarked]=useState(new Set());
  function checkBingo(m){const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return lines.filter(l=>l.every(i=>m.has(i)));}
  function toggle(i){const nm=new Set(marked);nm.has(i)?nm.delete(i):nm.add(i);setMarked(nm);}
  const bingoLines=checkBingo(marked);const bingoSet=new Set(bingoLines.flat());const latest=calledWords[0];
  const bg=isA?"linear-gradient(135deg,#ede9fe,#fce7f3)":"linear-gradient(135deg,#dbeafe,#e0f2fe)";
  const border=isA?"#c4b5fd":"#93c5fd";const nameColor=isA?"#5b21b6":"#1d4ed8";const markColor=isA?"#7c3aed":"#2563eb";const markBg=isA?"#ede9fe":"#dbeafe";
  return(
    <div style={{flex:1,minWidth:220,maxWidth:300}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:bg,borderRadius:18,padding:"12px 16px",border:`3px solid ${border}`,marginBottom:10,boxShadow:`0 4px 12px ${isA?"rgba(167,139,250,0.2)":"rgba(147,197,253,0.2)"}`}}>
        {isA?<AvatarA size={64}/>:<AvatarB size={64}/>}
        <div style={{fontWeight:900,fontSize:16,color:nameColor}}>{playerName}</div>
        {bingoLines.length>0&&<div style={{background:"#f59e0b",color:"white",borderRadius:10,padding:"3px 12px",fontWeight:800,fontSize:13}}>🏆 빙고 {bingoLines.length}줄!</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
        {grid.map((word,i)=>{const isMarked=marked.has(i);const isBingo=bingoSet.has(i);const isLatest=word===latest&&calledWords.length>0;const emoji=getEmoji(word)||"📝";return(
          <div key={i} onClick={()=>toggle(i)} style={{aspectRatio:"1",borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",border:isBingo?"3px solid #f59e0b":isMarked?`3px solid ${markColor}`:isLatest?"3px solid #22c55e":"2px solid #e5e7eb",background:isBingo?"#fef3c7":isMarked?markBg:isLatest?"#f0fdf4":"white",boxShadow:isBingo?"0 0 10px rgba(245,158,11,0.4)":isLatest?"0 0 8px rgba(34,197,94,0.3)":"0 1px 3px rgba(0,0,0,0.06)",transition:"all 0.15s",userSelect:"none",padding:4,position:"relative"}}>
            {isMarked&&!isBingo&&<div style={{position:"absolute",top:2,right:4,fontSize:11,color:markColor,fontWeight:900,opacity:0.7}}>✓</div>}
            <div style={{fontSize:28,lineHeight:1,marginBottom:2}}>{emoji}</div>
            <div style={{fontSize:9,fontWeight:700,color:isBingo?"#92400e":isMarked?markColor:"#374151",textAlign:"center",lineHeight:1.2,wordBreak:"break-all",padding:"0 2px"}}>{word}</div>
          </div>
        );})}
      </div>
      <div style={{marginTop:6,fontSize:11,color:"#9ca3af",textAlign:"center"}}>{marked.size}칸 · 빙고 {bingoLines.length}줄 · 3줄 완성 시 승리! 🎊</div>
    </div>
  );
}

function BingoGame({words,onScore}){
  const[calledWords,setCalledWords]=useState([]);
  const[remaining,setRemaining]=useState(()=>shuffle(words));
  const[key,setKey]=useState(0);
  const[landedWord,setLandedWord]=useState(null);
  const[matchResult,setMatchResult]=useState(null); // "correct"|"wrong"|null
  const[selectedAnswer,setSelectedAnswer]=useState(null);
  const[choices,setChoices]=useState([]);

  if(words.length<9)return(<div style={{textAlign:"center",padding:32,color:"#9ca3af"}}><div style={{fontSize:36,marginBottom:8}}>⚠️</div><div style={{fontSize:14,fontWeight:600}}>빙고 게임은 단어 9개 이상 필요해요!<br/>현재 {words.length}개 입력됨.</div></div>);

  function buildChoices(correct){
    const wrong=shuffle(words.filter(w=>w!==correct)).slice(0,3);
    setChoices(shuffle([correct,...wrong]));
  }

  function handleCall(word){
    setLandedWord(word);
    setMatchResult(null);
    setSelectedAnswer(null);
    buildChoices(word);
    speak(word);
  }

  function handleAnswer(word){
    if(matchResult)return;
    setSelectedAnswer(word);
    if(word===landedWord){
      setMatchResult("correct");
      speak("Correct! Great job!");
      setCalledWords(prev=>prev.includes(landedWord)?prev:[landedWord,...prev]);
      setRemaining(r=>r.filter(w=>w!==landedWord));
      onScore(1);
    } else {
      setMatchResult("wrong");
      speak("Try again!");
      setTimeout(()=>{setMatchResult(null);setSelectedAnswer(null);},1000);
    }
  }

  function reset(){
    setCalledWords([]);setRemaining(shuffle(words));setKey(k=>k+1);
    setLandedWord(null);setMatchResult(null);setSelectedAnswer(null);setChoices([]);
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:15,color:"#4f46e5"}}>🎯 3×3 그림 빙고</div>
        <button onClick={reset} style={{background:"#f3f4f6",border:"none",borderRadius:8,padding:"6px 14px",fontWeight:600,cursor:"pointer",fontSize:12}}>🔄 초기화</button>
      </div>

      <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
        {/* Board A */}
        <BingoBoard key={`a-${key}`} words={words} calledWords={calledWords} playerIdx={0} playerName="Player A"/>

        {/* Center: spinner + match game */}
        <div style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:12,minWidth:240}}>
          <SpinnerWheel words={words} onCall={handleCall}/>

          {/* Match panel */}
          {landedWord&&(
            <div style={{width:"100%",background:"#1e1b4b",borderRadius:16,padding:14}}>
              {/* Landed word display */}
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:10,color:"#a5b4fc",fontWeight:700,marginBottom:4}}>🎯 나온 단어</div>
                <div style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:12,padding:"10px 16px",display:"inline-block"}}>
                  <div style={{fontSize:32}}>{getEmoji(landedWord)||"⭐"}</div>
                  <div style={{fontSize:20,fontWeight:900,color:"white"}}>{landedWord}</div>
                </div>
                <button onClick={()=>speak(landedWord)} style={{display:"block",margin:"8px auto 0",background:"#fef3c7",border:"none",borderRadius:8,padding:"4px 14px",fontWeight:700,cursor:"pointer",fontSize:12,color:"#92400e"}}>🔊 듣기</button>
              </div>

              {/* Result feedback */}
              {matchResult==="correct"&&(
                <div style={{background:"#065f46",borderRadius:10,padding:"8px",textAlign:"center",marginBottom:10,fontSize:14,fontWeight:800,color:"#6ee7b7"}}>
                  ✅ 정답! 빙고판을 체크하세요!
                </div>
              )}
              {matchResult==="wrong"&&(
                <div style={{background:"#7f1d1d",borderRadius:10,padding:"8px",textAlign:"center",marginBottom:10,fontSize:14,fontWeight:800,color:"#fca5a5"}}>
                  ❌ 틀렸어요! 다시 해봐요!
                </div>
              )}

              {/* Answer choices */}
              {!matchResult&&(
                <div>
                  <div style={{fontSize:10,color:"#a5b4fc",fontWeight:700,marginBottom:8,textAlign:"center"}}>아래 단어 중 같은 단어를 골라요!</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {choices.map((w,i)=>(
                      <button key={i} onClick={()=>handleAnswer(w)} style={{
                        background:selectedAnswer===w?"#312e81":"rgba(255,255,255,0.1)",
                        border:`2px solid ${selectedAnswer===w?"#818cf8":"rgba(255,255,255,0.2)"}`,
                        borderRadius:10,padding:"8px 6px",cursor:"pointer",
                        display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                        transition:"all 0.15s",
                      }}>
                        <div style={{fontSize:22}}>{getEmoji(w)||"📝"}</div>
                        <div style={{fontSize:12,fontWeight:700,color:"white"}}>{w}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {matchResult==="correct"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {choices.map((w,i)=>(
                    <div key={i} style={{
                      background:w===landedWord?"rgba(110,231,183,0.2)":"rgba(255,255,255,0.05)",
                      border:`2px solid ${w===landedWord?"#6ee7b7":"rgba(255,255,255,0.1)"}`,
                      borderRadius:10,padding:"8px 6px",
                      display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                    }}>
                      <div style={{fontSize:22}}>{getEmoji(w)||"📝"}</div>
                      <div style={{fontSize:12,fontWeight:700,color:w===landedWord?"#6ee7b7":"rgba(255,255,255,0.4)"}}>{w}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Called words history */}
          {calledWords.length>0&&(
            <div style={{width:"100%",background:"#1e1b4b",borderRadius:14,padding:12}}>
              <div style={{fontSize:10,color:"#a5b4fc",marginBottom:6,fontWeight:700}}>📋 맞춘 단어</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {calledWords.map((w,i)=>(
                  <span key={i} style={{background:i===0?"#f59e0b":"#312e81",color:i===0?"#1e1b4b":"#a5b4fc",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}>
                    {getEmoji(w)||"⭐"} {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Board B */}
        <BingoBoard key={`b-${key}`} words={words} calledWords={calledWords} playerIdx={1} playerName="Player B"/>
      </div>

      <div style={{marginTop:12,background:"#fef3c7",borderRadius:10,padding:"8px 14px",fontSize:12,color:"#92400e",lineHeight:1.7}}>
        💡 돌림판을 돌려 단어를 뽑고 → 아래 보기에서 같은 단어를 골라요 → 맞으면 양쪽 빙고판에서 해당 칸을 클릭! 3줄 먼저 완성하면 승리!
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MONSTER FEED
// ═══════════════════════════════════════════════════════
function MonsterFeed({words,onScore}){
  const[target,setTarget]=useState(null);const[choices,setChoices]=useState([]);const[dragging,setDragging]=useState(null);const[mouthOpen,setMouthOpen]=useState(false);const[flash,setFlash]=useState(null);const[score,setScore]=useState(0);const[dragPos,setDragPos]=useState({x:0,y:0});const[isDragging,setIsDragging]=useState(false);const monsterRef=useRef();
  function setup(ws){const t=ws[rand(0,ws.length-1)];setTarget(t);const others=shuffle(ws.filter(w=>w!==t)).slice(0,3);setChoices(shuffle([t,...others]));setTimeout(()=>speak(t),400);}
  useEffect(()=>{if(words.length>0)setup(words);},[]);
  function startDrag(e,word){setDragging(word);setIsDragging(true);const r=e.currentTarget.getBoundingClientRect();setDragPos({x:r.left+r.width/2,y:r.top+r.height/2});}
  function onMove(e){if(!isDragging)return;setDragPos({x:e.clientX,y:e.clientY});if(monsterRef.current){const mr=monsterRef.current.getBoundingClientRect();setMouthOpen(Math.hypot(e.clientX-mr.left-mr.width/2,e.clientY-mr.top-mr.height*0.7)<70);}}
  function onUp(e){
    if(!isDragging||!dragging)return;setIsDragging(false);setMouthOpen(false);
    if(monsterRef.current){const mr=monsterRef.current.getBoundingClientRect();const dist=Math.hypot(e.clientX-mr.left-mr.width/2,e.clientY-mr.top-mr.height*0.7);if(dist<80){if(dragging===target){setFlash("good");setScore(s=>s+1);onScore(1);setTimeout(()=>{setFlash(null);setup(words);},900);}else{setFlash("bad");setTimeout(()=>setFlash(null),700);}}}
    setDragging(null);
  }
  function touchStart(e,word){setDragging(word);setIsDragging(true);const t=e.touches[0];setDragPos({x:t.clientX,y:t.clientY});}
  function touchMove(e){if(!isDragging)return;const t=e.touches[0];setDragPos({x:t.clientX,y:t.clientY});if(monsterRef.current){const mr=monsterRef.current.getBoundingClientRect();setMouthOpen(Math.hypot(t.clientX-mr.left-mr.width/2,t.clientY-mr.top-mr.height*0.7)<70);}}
  function touchEnd(e){const t=e.changedTouches[0];onUp({clientX:t.clientX,clientY:t.clientY});}
  return(
    <div onMouseMove={onMove} onMouseUp={onUp} style={{position:"relative",userSelect:"none",touchAction:"none"}} onTouchMove={e=>{e.preventDefault();touchMove(e);}} onTouchEnd={touchEnd}>
      {flash==="good"&&<div style={{position:"fixed",inset:0,background:"rgba(110,231,183,0.3)",zIndex:200,pointerEvents:"none"}}/>}
      {flash==="bad"&&<div style={{position:"fixed",inset:0,background:"rgba(252,165,165,0.3)",zIndex:200,pointerEvents:"none"}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:16,color:"#4f46e5"}}>✅ {score}개</div>
        <div style={{background:"#fef3c7",borderRadius:14,padding:"8px 20px",fontWeight:900,fontSize:20,color:"#92400e",border:"2px solid #fcd34d",textAlign:"center"}}><div style={{fontSize:10,color:"#b45309"}}>이걸 먹여요!</div>🔊 {target}</div>
        <button onClick={()=>speak(target)} style={{background:"#e0e7ff",border:"none",borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>🔊</button>
      </div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
        <div ref={monsterRef} style={{width:140,height:140}}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <ellipse cx="70" cy="85" rx="52" ry="42" fill="#a78bfa"/><circle cx="70" cy="65" r="52" fill="#a78bfa"/>
            <polygon points="42,20 36,2 55,16" fill="#a78bfa" stroke="white" strokeWidth="2"/>
            <polygon points="98,20 94,2 113,16" fill="#a78bfa" stroke="white" strokeWidth="2"/>
            <circle cx="52" cy="52" r="14" fill="white"/><circle cx="88" cy="52" r="14" fill="white"/>
            <circle cx="55" cy="54" r="7" fill="#1f2937"/><circle cx="91" cy="54" r="7" fill="#1f2937"/>
            <circle cx="57" cy="51" r="2.5" fill="white"/><circle cx="93" cy="51" r="2.5" fill="white"/>
            <ellipse cx="44" cy="68" rx="8" ry="5" fill="#fca5a5" opacity="0.5"/><ellipse cx="96" cy="68" rx="8" ry="5" fill="#fca5a5" opacity="0.5"/>
            {mouthOpen?<ellipse cx="70" cy="88" rx="26" ry="20" fill="#1f2937"/>:<path d="M48 86 Q70 98 92 86" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round"/>}
            {mouthOpen&&<><rect x="55" y="86" width="10" height="10" rx="2" fill="white"/><rect x="68" y="86" width="10" height="10" rx="2" fill="white"/><rect x="81" y="86" width="10" height="10" rx="2" fill="white"/></>}
          </svg>
          {flash==="good"&&<div style={{position:"absolute",fontSize:32,animation:"popUp 0.8s ease forwards"}}>🎉</div>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,maxWidth:320,margin:"0 auto"}}>
        {choices.map((word,i)=>{const emoji=getEmoji(word)||FALLBACK_EMOJIS[i];const isDrag=dragging===word&&isDragging;return(<div key={word} onMouseDown={e=>startDrag(e,word)} onTouchStart={e=>touchStart(e,word)} style={{background:"white",borderRadius:20,padding:16,textAlign:"center",cursor:"grab",border:"3px solid #c7d2fe",boxShadow:"0 4px 12px rgba(79,70,229,0.15)",opacity:isDrag?0.3:1,userSelect:"none",touchAction:"none"}}><div style={{fontSize:52,lineHeight:1,marginBottom:6}}>{emoji}</div><div style={{fontWeight:800,fontSize:15,color:"#374151"}}>{word}</div></div>);})}
      </div>
      {isDragging&&dragging&&<div style={{position:"fixed",left:dragPos.x-40,top:dragPos.y-40,width:80,height:80,borderRadius:20,background:"white",border:"3px solid #4f46e5",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:300,boxShadow:"0 8px 24px rgba(79,70,229,0.3)"}}><div style={{fontSize:36}}>{getEmoji(dragging)||"⭐"}</div><div style={{fontSize:10,fontWeight:700}}>{dragging}</div></div>}
      <style>{`@keyframes popUp{0%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-40px)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SENTENCE TRAIN
// ═══════════════════════════════════════════════════════
function SentenceTrain({sentences,onScore}){
  const[idx,setIdx]=useState(0);const[tapped,setTapped]=useState([]);const[result,setResult]=useState(null);const[trainGo,setTrainGo]=useState(false);const[score,setScore]=useState(0);
  const[tiles,setTiles]=useState(()=>{const s=sentences[0].trim().split(/\s+/);return shuffle(s).map((w,i)=>({id:i,word:w}));});
  function nextRound(){const ni=(idx+1)%sentences.length;const ws=sentences[ni].trim().split(/\s+/);setTiles(shuffle(ws).map((w,i)=>({id:i,word:w})));setTapped([]);setResult(null);setTrainGo(false);setIdx(ni);setTimeout(()=>speak(sentences[ni],0.75),300);}
  useEffect(()=>{speak(sentences[0],0.75);},[]);
  function tap(tile){if(result||tapped.find(t=>t.id===tile.id))return;const next=[...tapped,tile];setTapped(next);if(next.length===tiles.length){const ans=next.map(t=>t.word).join(" ").toLowerCase();if(ans===sentences[idx].toLowerCase()){setResult("good");setTrainGo(true);setScore(s=>s+1);onScore(1);speak("Amazing! Correct!",0.9);}else{setResult("bad");setTimeout(()=>{setTapped([]);setResult(null);},900);}}}
  const carColors=["#4f46e5","#7c3aed","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6"];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontWeight:800,fontSize:16,color:"#4f46e5"}}>✅ {score}개</div><button onClick={()=>speak(sentences[idx],0.75)} style={{background:"#fef3c7",border:"2px solid #fcd34d",borderRadius:12,padding:"8px 20px",fontWeight:700,cursor:"pointer",fontSize:14,color:"#92400e"}}>🔊 다시 듣기</button></div>
      <div style={{background:"linear-gradient(180deg,#dbeafe,#ede9fe)",borderRadius:20,padding:16,marginBottom:16,border:"2px solid #c7d2fe",minHeight:100,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:6,left:0,right:0,height:5,background:"repeating-linear-gradient(90deg,#94a3b8 0,#94a3b8 18px,transparent 18px,transparent 32px)"}}/>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,paddingBottom:18,minHeight:80,overflowX:"auto",animation:trainGo?"trainSlide 1.5s ease-in forwards":""}}>
          <div style={{flexShrink:0,background:"#ef4444",borderRadius:"14px 6px 6px 14px",width:56,height:52,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>🚂</div>
          {tapped.map((tile,i)=><div key={tile.id} style={{flexShrink:0,background:carColors[i%carColors.length],color:"white",fontWeight:800,fontSize:14,borderRadius:8,padding:"8px 14px",height:52,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.15)",border:"2px solid rgba(255,255,255,0.3)",minWidth:52,textAlign:"center",animation:result==="bad"?"shake 0.4s ease":""}}>{tile.word}</div>)}
          {Array.from({length:Math.max(0,tiles.length-tapped.length)}).map((_,i)=><div key={i} style={{flexShrink:0,width:56,height:52,border:"2px dashed #93c5fd",borderRadius:8,background:"rgba(255,255,255,0.4)"}}/>)}
        </div>
        <style>{`@keyframes trainSlide{0%{transform:translateX(0)}100%{transform:translateX(110%)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}`}</style>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginBottom:16}}>{tiles.filter(t=>!tapped.find(p=>p.id===t.id)).map(tile=><button key={tile.id} onClick={()=>tap(tile)} style={{background:"white",border:`2px solid ${result==="bad"?"#fca5a5":"#4f46e5"}`,borderRadius:14,padding:"10px 18px",fontWeight:800,fontSize:16,cursor:"pointer",color:"#4f46e5",boxShadow:"0 2px 8px rgba(79,70,229,0.15)"}}>{tile.word}</button>)}</div>
      {result==="good"&&<div style={{textAlign:"center",background:"#d1fae5",borderRadius:16,padding:16,border:"2px solid #6ee7b7"}}><div style={{fontSize:36,marginBottom:4}}>🎉🚂💨</div><div style={{fontSize:18,fontWeight:900,color:"#065f46"}}>기차 출발~! 정답!</div><button onClick={nextRound} style={{marginTop:12,background:"#10b981",color:"white",border:"none",borderRadius:12,padding:"10px 24px",fontWeight:800,cursor:"pointer",fontSize:16}}>다음 문장 ▶</button></div>}
      {!result&&tapped.length>0&&<button onClick={()=>setTapped([])} style={{display:"block",margin:"0 auto",background:"#fee2e2",border:"2px solid #fca5a5",borderRadius:10,padding:"8px 20px",fontWeight:700,cursor:"pointer",fontSize:13,color:"#dc2626"}}>🔄 초기화</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOM DECORATOR
// ═══════════════════════════════════════════════════════
const ROOM_ITEMS=[{id:"bed",emoji:"🛏️",name:"침대"},{id:"desk",emoji:"🪑",name:"책상"},{id:"window",emoji:"🪟",name:"창문"},{id:"plant",emoji:"🪴",name:"화분"},{id:"lamp",emoji:"🪔",name:"램프"},{id:"tv",emoji:"📺",name:"TV"},{id:"cat2",emoji:"🐱",name:"고양이"},{id:"rainbow",emoji:"🌈",name:"무지개"},{id:"star2",emoji:"⭐",name:"별"},{id:"book2",emoji:"📚",name:"책장"},{id:"pizza",emoji:"🍕",name:"피자"},{id:"trophy",emoji:"🏆",name:"트로피"}];
const WALLPAPERS=[{id:"sky",label:"하늘",bg:"linear-gradient(180deg,#bfdbfe,#ede9fe)"},{id:"forest",label:"숲",bg:"linear-gradient(180deg,#d1fae5,#bbf7d0)"},{id:"night",label:"밤",bg:"linear-gradient(180deg,#1e1b4b,#312e81)"},{id:"sunset",label:"석양",bg:"linear-gradient(180deg,#fef3c7,#fce7f3)"}];
const FLOORS=[{id:"wood",label:"나무",color:"#d97706",pattern:"repeating-linear-gradient(90deg,#b45309 0,#b45309 2px,#d97706 2px,#d97706 40px)"},{id:"tile",label:"타일",color:"#e5e7eb",pattern:"repeating-linear-gradient(0deg,#d1d5db 0,#d1d5db 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#d1d5db 0,#d1d5db 1px,transparent 1px,transparent 40px)"},{id:"pink",label:"분홍",color:"#fbcfe8",pattern:"repeating-linear-gradient(45deg,#f9a8d4 0,#f9a8d4 1px,#fbcfe8 1px,#fbcfe8 20px)"}];

function RoomDecorator({ownedItems,coins,onSpend}){
  const[placed,setPlaced]=useState([]);const[wallpaper,setWallpaper]=useState(WALLPAPERS[0]);const[floor,setFloor]=useState(FLOORS[0]);const[draggingItem,setDraggingItem]=useState(null);const[offset,setOffset]=useState({x:0,y:0});const roomRef=useRef();const[shopTab,setShopTab]=useState("items");const[msg,setMsg]=useState(null);
  function startDrag(e,item){setDraggingItem(item);const r=e.currentTarget.getBoundingClientRect();setOffset({x:e.clientX-r.left,y:e.clientY-r.top});e.preventDefault();}
  function onMoveRoom(e){if(!draggingItem)return;const r=roomRef.current.getBoundingClientRect();const x=e.clientX-r.left-offset.x,y=e.clientY-r.top-offset.y;setPlaced(prev=>prev.map(p=>p.instanceId===draggingItem.instanceId?{...p,px:Math.max(0,Math.min(r.width-60,x)),py:Math.max(0,Math.min(r.height-60,y))}:p));}
  function addToRoom(item){if(!ownedItems.includes(item.id)){setMsg("이 아이템이 없어요!");setTimeout(()=>setMsg(null),1200);return;}setPlaced(p=>[...p,{...item,instanceId:Date.now(),px:rand(20,240),py:rand(20,130)}]);}
  function showMsg(m){setMsg(m);setTimeout(()=>setMsg(null),1200);}
  return(
    <div>
      <div ref={roomRef} onMouseMove={onMoveRoom} onMouseUp={()=>setDraggingItem(null)} style={{width:"100%",height:230,background:wallpaper.bg,borderRadius:20,border:"3px solid #c7d2fe",position:"relative",overflow:"hidden",marginBottom:12,cursor:"default"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:46,background:floor.pattern,backgroundColor:floor.color,borderRadius:"0 0 16px 16px"}}/>
        {placed.map(item=><div key={item.instanceId} onMouseDown={e=>startDrag(e,item)} style={{position:"absolute",left:item.px,top:item.py,fontSize:38,cursor:"grab",userSelect:"none",filter:"drop-shadow(2px 2px 4px rgba(0,0,0,0.2))"}}>{item.emoji}<button onClick={()=>setPlaced(p=>p.filter(i=>i.instanceId!==item.instanceId))} style={{position:"absolute",top:-8,right:-8,background:"#ef4444",color:"white",border:"none",borderRadius:"50%",width:18,height:18,fontSize:10,cursor:"pointer",fontWeight:700}}>✕</button></div>)}
        {placed.length===0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(100,100,200,0.5)",fontSize:13,fontWeight:600}}>아이템을 눌러 방에 배치해요!</div>}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
        {WALLPAPERS.map(w=><button key={w.id} onClick={()=>setWallpaper(w)} style={{flexShrink:0,border:`2px solid ${wallpaper.id===w.id?"#4f46e5":"#e5e7eb"}`,borderRadius:8,padding:"3px 8px",background:w.bg,fontWeight:700,fontSize:11,cursor:"pointer",color:w.id==="night"?"white":"#374151"}}>{w.label}</button>)}
        {FLOORS.map(f=><button key={f.id} onClick={()=>setFloor(f)} style={{flexShrink:0,border:`2px solid ${floor.id===f.id?"#4f46e5":"#e5e7eb"}`,borderRadius:8,padding:"3px 8px",background:f.color,fontWeight:700,fontSize:11,cursor:"pointer"}}>{f.label}바닥</button>)}
      </div>
      <div style={{display:"flex",borderBottom:"2px solid #e5e7eb",marginBottom:10}}>
        {[["items","🎒 내 아이템"],["shop","🛒 상점"]].map(([t,l])=><button key={t} onClick={()=>setShopTab(t)} style={{flex:1,border:"none",borderBottom:`3px solid ${shopTab===t?"#4f46e5":"transparent"}`,background:"transparent",padding:"8px",fontWeight:700,fontSize:12,color:shopTab===t?"#4f46e5":"#9ca3af",cursor:"pointer"}}>{l}</button>)}
      </div>
      {msg&&<div style={{background:"#fef3c7",borderRadius:8,padding:"6px",textAlign:"center",fontSize:12,fontWeight:700,color:"#92400e",marginBottom:8}}>{msg}</div>}
      {shopTab==="items"&&(ownedItems.length===0?<div style={{textAlign:"center",color:"#9ca3af",padding:"16px 0",fontSize:13}}>게임을 해서 아이템을 모아요! 🎮</div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(76px,1fr))",gap:8}}>{ROOM_ITEMS.filter(i=>ownedItems.includes(i.id)).map(item=><button key={item.id} onClick={()=>addToRoom(item)} style={{background:"white",border:"2px solid #c7d2fe",borderRadius:12,padding:"8px 4px",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:28}}>{item.emoji}</div><div style={{fontSize:10,fontWeight:700,color:"#374151",marginTop:2}}>{item.name}</div></button>)}</div>)}
      {shopTab==="shop"&&(<div><div style={{fontSize:12,color:"#6b7280",marginBottom:8}}>🪙 {coins}개 보유 · 아이템 1개 = 코인 3개</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(76px,1fr))",gap:8}}>{ROOM_ITEMS.filter(i=>!ownedItems.includes(i.id)).map(item=><button key={item.id} onClick={()=>{if(coins>=3)onSpend(item.id);else showMsg("코인이 부족해요!");}} style={{background:"white",border:"2px solid #fcd34d",borderRadius:12,padding:"8px 4px",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:28}}>{item.emoji}</div><div style={{fontSize:10,fontWeight:700,color:"#374151",marginTop:2}}>{item.name}</div><div style={{fontSize:11,color:"#f59e0b",fontWeight:800}}>🪙 3</div></button>)}</div></div>)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
const MAIN_TABS=["📋 자료 생성","🎮 게임","🏠 내 방"];
const SHEET_TABS=["빈칸 채우기","O X 퀴즈","말하기 카드","단어 퀴즈","역할극"];
const GAME_LIST=[{label:"🍽️ 먹이기",desc:"드래그 앤 드롭"},{label:"🚂 기차",desc:"순서 맞추기"},{label:"🎯 빙고",desc:"3×3 빙고"},{label:"🫧 버블팝",desc:"비눗방울 터뜨리기"}];
const ITEM_IDS=ROOM_ITEMS.map(i=>i.id);

export default function App(){
  const[wordInput,setWordInput]=useState("");const[sentInput,setSentInput]=useState("");const[ageGroup,setAgeGroup]=useState("");const[mainTab,setMainTab]=useState(0);const[sheetTab,setSheetTab]=useState(0);const[gameIdx,setGameIdx]=useState(0);const[generated,setGenerated]=useState(null);const[loading,setLoading]=useState(false);const[error,setError]=useState("");const[coins,setCoins]=useState(8);const[ownedItems,setOwnedItems]=useState([]);const[totalScore,setTotalScore]=useState(0);const[rewardMsg,setRewardMsg]=useState(null);
  const isYoung=YOUNG_AGES.includes(ageGroup);
  const{words,sentences}=parseInput(wordInput,sentInput);

  function handleScore(n){
    setCoins(c=>c+n);const next=totalScore+n;setTotalScore(next);
    if(next%3===0&&next>0){const unowned=ITEM_IDS.filter(i=>!ownedItems.includes(i));if(unowned.length>0){const itemId=unowned[rand(0,unowned.length-1)];const item=ROOM_ITEMS.find(r=>r.id===itemId);if(item){setOwnedItems(o=>[...o,item.id]);setRewardMsg(item);setTimeout(()=>setRewardMsg(null),2500);}}}
  }
  function spendCoins(itemId){if(!itemId)return;setCoins(c=>c-3);setOwnedItems(o=>o.includes(itemId)?o:[...o,itemId]);}

  async function generate(){
    if(words.length===0){setError("단어를 입력해주세요.");return;}
    setError("");setLoading(true);setGenerated(null);
    const youngInstr=isYoung?`IMPORTANT: Young learners (${ageGroup}). Simple words, short sentences. Add emoji & funFact to speakingCards. Simple visual oxQuiz.`:"";
    const prompt=`You are an English teacher assistant. Generate English learning materials as JSON ONLY.
Target age: ${ageGroup||"general"}. ${youngInstr}
Words: ${words.join(", ")}
Sentences: ${sentences.join(" | ")}
Return ONLY valid JSON:
{"fillInBlank":[{"sentence":"She ___ to school.","answer":"walks","hint":"move on foot","options":["walks","runs","swims","flies"]}],"oxQuiz":[{"word":"apple","emoji":"🍎","question":"An apple is a fruit. ⭕ or ✕?","answer":true,"explanation":"Yes!"}],"speakingCards":[{"word":"apple","sentence":"I eat an apple.","tip":"AP-ple","emoji":"🍎","funFact":"Apples are red or green!"}],"roleplay":{"title":"At the Market","characters":["Student A","Student B"],"lines":[{"character":"Student A","line":"Hello!","targetWord":"apple"}]}}
Rules: fillInBlank min 3, oxQuiz min ${isYoung?6:4} mix true/false, speakingCards min 3, roleplay min 6 lines.`;
    try{
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-3-5-sonnet-202410224",max_tokens:2500,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();const text=data.content?.map(b=>b.text||"").join("")||"";
      setGenerated(JSON.parse(text.replace(/```json|```/g,"").trim()));setMainTab(0);
    }catch(e){setError("생성 중 오류가 발생했습니다.");}
    setLoading(false);
  }

  const canGame=words.length>=4&&sentences.length>=1;

  return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",minHeight:"100vh",background:"#f0f4ff"}}>
      <style>{`
        @media print{.no-print{display:none!important;}.print-area{box-shadow:none!important;}body{background:white!important;}}
        *{box-sizing:border-box;}
        textarea{width:100%;border:1.5px solid #c7d2fe;border-radius:8px;padding:10px;font-size:14px;resize:vertical;outline:none;font-family:inherit;}
        textarea:focus{border-color:#4f46e5;}
        .stab{cursor:pointer;padding:7px 11px;border:none;border-radius:8px 8px 0 0;font-size:12px;font-weight:600;transition:all 0.2s;}
        .stab-on{background:white;color:#4f46e5;box-shadow:0 -2px 8px rgba(79,70,229,0.1);}
        .stab-off{background:#e0e7ff;color:#6b7280;}
        .stab-off:hover{background:#c7d2fe;}
        .card{background:white;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);}
        .tip-box{background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:8px 12px;font-size:13px;color:#92400e;margin-top:6px;}
        .fun-box{background:#fce7f3;border-left:4px solid #ec4899;border-radius:0 8px 8px 0;padding:8px 12px;font-size:13px;color:#9d174d;margin-top:6px;}
      `}</style>

      {rewardMsg&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:24,padding:"28px 40px",textAlign:"center",color:"white",zIndex:500,boxShadow:"0 8px 40px rgba(79,70,229,0.5)",animation:"popIn 0.4s ease"}}>
          <div style={{fontSize:64,marginBottom:8}}>{rewardMsg.emoji}</div>
          <div style={{fontWeight:900,fontSize:20}}>아이템 획득! 🎁</div>
          <div style={{fontSize:14,opacity:0.9,marginTop:4}}>{rewardMsg.name} 획득!</div>
          <style>{`@keyframes popIn{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0}70%{transform:translate(-50%,-50%) scale(1.05)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}`}</style>
        </div>
      )}

      <div className="no-print" style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:"white",fontWeight:900,fontSize:17}}>📚 영어 수업 올인원</div>
        <div style={{background:"#f59e0b",borderRadius:12,padding:"5px 14px",fontWeight:900,fontSize:15,color:"white"}}>🪙 {coins}</div>
      </div>

      <div className="no-print" style={{display:"flex",background:"white",borderBottom:"2px solid #e5e7eb"}}>
        {MAIN_TABS.map((t,i)=><button key={i} onClick={()=>setMainTab(i)} style={{flex:1,border:"none",borderBottom:`3px solid ${mainTab===i?"#4f46e5":"transparent"}`,background:"transparent",padding:"12px 6px",fontWeight:700,fontSize:13,color:mainTab===i?"#4f46e5":"#9ca3af",cursor:"pointer",transition:"all 0.15s"}}>{t}</button>)}
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"16px"}}>

        {/* ── 자료 생성 탭 ── */}
        {mainTab===0&&(
          <div>
            <div className="no-print card" style={{marginBottom:20}}>
              <div style={{marginBottom:14}}>
                <label style={{fontWeight:700,fontSize:14,color:"#374151",display:"block",marginBottom:8}}>🎯 타겟 연령대</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["유치원 (5~7세)","초등학생 (8~12세)","중학생 (13~15세)","고등학생 (16~18세)","성인"].map(ag=>(
                    <button key={ag} onClick={()=>setAgeGroup(ag)} style={{border:`2px solid ${ageGroup===ag?"#4f46e5":"#c7d2fe"}`,background:ageGroup===ag?"#4f46e5":"white",color:ageGroup===ag?"white":"#4f46e5",borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{ag}</button>
                  ))}
                </div>
                {isYoung&&<div style={{marginTop:6,fontSize:12,color:"#ec4899",fontWeight:600}}>🖼️ 그림(이모지) 중심 자료가 생성됩니다!</div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><label style={{fontWeight:700,fontSize:13,color:"#374151",display:"block",marginBottom:5}}>📝 영단어 <span style={{color:"#9ca3af",fontWeight:400}}>(쉼표/줄바꿈)</span></label><textarea rows={5} placeholder={"apple\nbeautiful\nrun\nhappy\nfriend"} value={wordInput} onChange={e=>setWordInput(e.target.value)}/></div>
                <div><label style={{fontWeight:700,fontSize:13,color:"#374151",display:"block",marginBottom:5}}>💬 예문 <span style={{color:"#9ca3af",fontWeight:400}}>(줄바꿈)</span></label><textarea rows={5} placeholder={"I eat an apple every day.\nShe is beautiful.\nWe run in the park."} value={sentInput} onChange={e=>setSentInput(e.target.value)}/></div>
              </div>
              {error&&<div style={{color:"#dc2626",fontSize:13,marginTop:8}}>{error}</div>}
              <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}>
                <button onClick={generate} disabled={loading} style={{background:loading?"#e5e7eb":"#4f46e5",color:loading?"#9ca3af":"white",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700,fontSize:14,cursor:loading?"default":"pointer"}}>{loading?"⏳ 생성 중...":"✨ 자료 생성하기"}</button>
                {generated&&<button onClick={()=>window.print()} style={{background:"#0f766e",color:"white",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700,fontSize:14,cursor:"pointer"}}>🖨️ 인쇄</button>}
                {words.length>0&&<span style={{fontSize:13,color:"#6b7280"}}>단어 {words.length}개</span>}
              </div>
            </div>

            {/* Sheet tabs */}
            <div className="print-area">
              <div className="no-print" style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                {SHEET_TABS.map((t,i)=><button key={i} className={`stab ${sheetTab===i?"stab-on":"stab-off"}`} onClick={()=>setSheetTab(i)}>{t}</button>)}
              </div>
              <div style={{background:"white",borderRadius:sheetTab===0?"0 12px 12px 12px":"12px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",padding:22}}>

                {/* 빈칸 채우기 */}
                {sheetTab===0&&(
                  generated?.fillInBlank ? (
                    <div>
                      <h2 style={{color:"#4f46e5",marginTop:0}}>{isYoung?"✏️ 빈칸에 단어를 써요!":"✏️ 빈칸 채우기"}</h2>
                      {generated.fillInBlank.map((item,i)=>{const emoji=getEmoji(item.answer);return(
                        <div key={i} className="card" style={{borderLeft:"4px solid #4f46e5",borderRadius:isYoung?16:12}}>
                          {isYoung&&emoji&&<div style={{fontSize:40,textAlign:"center",marginBottom:8}}>{emoji}</div>}
                          <div style={{fontWeight:700,fontSize:isYoung?17:15,marginBottom:8}}>Q{i+1}. {item.sentence}</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>{item.options?.map((opt,j)=><span key={j} style={{border:`${isYoung?2:1.5}px solid #c7d2fe`,borderRadius:isYoung?12:6,padding:isYoung?"8px 16px":"4px 12px",fontSize:isYoung?15:13,background:isYoung?["#fce7f3","#dbeafe","#d1fae5","#fef3c7"][j%4]:"white",fontWeight:isYoung?700:400,color:"#374151"}}>{String.fromCharCode(65+j)}. {opt}</span>)}</div>
                          {!isYoung&&<div style={{fontSize:12,color:"#9ca3af"}}>힌트: {item.hint}</div>}
                        </div>
                      );})}
                    </div>
                  ) : <EmptyState label="자료를 먼저 생성해주세요!" emoji="✏️"/>
                )}

                {/* OX 퀴즈 */}
                {sheetTab===1&&(
                  generated?.oxQuiz ? (
                    <div>
                      <h2 style={{color:"#4f46e5",marginTop:0}}>{isYoung?"⭕✕ 맞으면 O, 틀리면 X!":"⭕✕ O X 퀴즈"}</h2>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
                        {generated.oxQuiz.map((item,i)=><OXQuizCard key={i} item={item} i={i} isYoung={isYoung}/>)}
                      </div>
                    </div>
                  ) : <EmptyState label="자료를 먼저 생성해주세요!" emoji="⭕"/>
                )}

                {/* 말하기 카드 */}
                {sheetTab===2&&(
                  generated?.speakingCards ? (
                    <div>
                      <h2 style={{color:"#4f46e5",marginTop:0}}>{isYoung?"🗣️ 따라 말해봐요!":"🗣️ 말하기 카드"}</h2>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
                        {(()=>{const cards=generated.speakingCards;const pairs=[];for(let i=0;i<cards.length;i+=2)pairs.push(cards.slice(i,i+2));return pairs.map((pair,pi)=>{const cols=["#fce7f3","#dbeafe","#d1fae5","#fef3c7","#ede9fe","#ffedd5"];const bds=["#f9a8d4","#93c5fd","#6ee7b7","#fcd34d","#c4b5fd","#fdba74"];const txts=["#9d174d","#1d4ed8","#065f46","#92400e","#5b21b6","#9a3412"];return(<div key={pi} style={{border:`3px solid ${bds[pi%6]}`,borderRadius:20,padding:20,background:cols[pi%6],display:"flex",flexDirection:"column",gap:12}}><div style={{display:"flex",gap:10,justifyContent:"center"}}>{pair.map((card,ci)=>{const emoji=getEmoji(card.word)||card.emoji||"📝";return(<div key={ci} style={{flex:1,textAlign:"center",background:"rgba(255,255,255,0.55)",borderRadius:14,padding:"12px 8px"}}><div style={{fontSize:isYoung?52:44,lineHeight:1,marginBottom:6}}>{emoji}</div><div style={{fontSize:isYoung?26:22,fontWeight:900,color:txts[pi%6]}}>{card.word}</div></div>);})}</div><div style={{background:"rgba(255,255,255,0.7)",borderRadius:12,padding:"10px 14px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:txts[pi%6],marginBottom:4}}>✏️ 두 단어로 문장을 만들어봐요!</div><div style={{fontSize:isYoung?15:14,color:"#374151",lineHeight:1.7,fontStyle:"italic"}}>{pair.map(c=>c.sentence).join(" / ")}</div></div>{pair.some(c=>c.tip)&&<div style={{fontSize:12,color:txts[pi%6],lineHeight:1.7}}>{pair.filter(c=>c.tip).map((c,ci)=><div key={ci}>💡 <b>{c.word}</b>: {c.tip}</div>)}</div>}{isYoung&&pair.some(c=>c.funFact)&&<div style={{background:"rgba(255,255,255,0.5)",borderRadius:10,padding:"6px 10px",fontSize:12,color:txts[pi%6]}}>{pair.filter(c=>c.funFact).map((c,ci)=><div key={ci}>🌟 {c.funFact}</div>)}</div>}</div>);});})()}
                      </div>
                    </div>
                  ) : <EmptyState label="자료를 먼저 생성해주세요!" emoji="🗣️"/>
                )}

                {/* 단어 퀴즈 */}
                {sheetTab===3&&(
                  <WordQuiz words={words.length>0?words:["apple","banana","cat"]} onCoin={n=>setCoins(c=>c+n)}/>
                )}

                {/* 역할극 */}
                {sheetTab===4&&(
                  generated?.roleplay ? (
                    <div>
                      <h2 style={{color:"#4f46e5",marginTop:0}}>{isYoung?"🎭 역할극 놀이!":"🎭 역할극"}</h2>
                      <div style={{fontWeight:700,fontSize:isYoung?17:15,marginBottom:16,color:"#1f2937"}}>📍 {generated.roleplay.title}</div>
                      <div style={{display:"flex",gap:16,marginBottom:24,justifyContent:"center",flexWrap:"wrap"}}>
                        {generated.roleplay.characters?.map((ch,i)=>{const isA=i===0;return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:isA?"linear-gradient(135deg,#ede9fe,#fce7f3)":"linear-gradient(135deg,#dbeafe,#e0f2fe)",borderRadius:20,padding:"20px 28px",border:`3px solid ${isA?"#c4b5fd":"#93c5fd"}`,minWidth:140,flex:1,maxWidth:200}}>{isA?<AvatarA size={100}/>:<AvatarB size={100}/>}<div style={{fontWeight:900,fontSize:16,color:isA?"#5b21b6":"#1d4ed8"}}>{ch}</div><div style={{fontSize:11,color:"#6b7280",background:"rgba(255,255,255,0.6)",borderRadius:8,padding:"2px 8px"}}>{isA?"Student A 🎀":"Student B 🎒"}</div></div>);})}
                      </div>
                      {generated.roleplay.lines?.map((line,i)=>{const isA=line.character?.includes("A");const emoji=getEmoji(line.targetWord||"");return(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12,flexDirection:isA?"row":"row-reverse"}}><div style={{flexShrink:0}}>{isA?<AvatarA size={isYoung?44:36}/>:<AvatarB size={isYoung?44:36}/>}</div><div style={{maxWidth:"72%",background:isA?"#ede9fe":"#dbeafe",borderRadius:isA?"4px 16px 16px 16px":"16px 4px 16px 16px",padding:isYoung?"11px 14px":"8px 12px",border:`2px solid ${isA?"#c4b5fd":"#93c5fd"}`}}><div style={{fontSize:10,fontWeight:700,color:isA?"#5b21b6":"#1d4ed8",marginBottom:3}}>{line.character}</div><div style={{fontSize:isYoung?15:13,color:"#1f2937",lineHeight:1.6}}>{line.line}</div>{line.targetWord&&<span style={{display:"inline-block",marginTop:3,fontSize:10,color:"#6b7280",background:"rgba(255,255,255,0.7)",borderRadius:4,padding:"1px 6px"}}>{emoji} {line.targetWord}</span>}</div></div>);})}
                    </div>
                  ) : <EmptyState label="자료를 먼저 생성해주세요!" emoji="🎭"/>
                )}

              </div>
            </div>

            {!generated&&!loading&&(
              <div style={{textAlign:"center",color:"#9ca3af",padding:"40px 0"}}>
                <div style={{fontSize:48}}>📖</div>
                <div style={{marginTop:10,fontSize:15}}>단어와 문장을 입력하고 생성 버튼을 눌러보세요!</div>
              </div>
            )}
          </div>
        )}

        {/* ── 게임 탭 ── */}
        {mainTab===1&&(
          <div>
            {!canGame?(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#9ca3af"}}>
                <div style={{fontSize:48,marginBottom:12}}>🎮</div>
                <div style={{fontSize:16,fontWeight:700,color:"#374151",marginBottom:8}}>게임을 시작하려면</div>
                <div style={{fontSize:14,marginBottom:20}}>📝 자료 생성 탭에서<br/>단어 4개 이상 + 문장 1개 이상을 입력해주세요!</div>
                <button onClick={()=>setMainTab(0)} style={{background:"#4f46e5",color:"white",border:"none",borderRadius:12,padding:"10px 24px",fontWeight:700,cursor:"pointer",fontSize:14}}>📋 자료 생성 탭으로</button>
              </div>
            ):(
              <>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  {GAME_LIST.map((g,i)=><button key={i} onClick={()=>setGameIdx(i)} style={{flex:1,border:"none",borderRadius:14,padding:"10px",fontWeight:800,cursor:"pointer",fontSize:14,background:gameIdx===i?"linear-gradient(135deg,#4f46e5,#7c3aed)":"white",color:gameIdx===i?"white":"#4f46e5",boxShadow:gameIdx===i?"0 4px 12px rgba(79,70,229,0.3)":"0 1px 4px rgba(0,0,0,0.08)",transition:"all 0.2s"}}><div style={{fontSize:20}}>{g.label.split(" ")[0]}</div><div style={{fontSize:11,marginTop:2,opacity:0.85}}>{g.desc}</div></button>)}
                </div>
                <div style={{background:"white",borderRadius:20,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.08)",marginBottom:12}}>
                  {gameIdx===0&&<MonsterFeed words={words} onScore={handleScore}/>}
                  {gameIdx===1&&<SentenceTrain sentences={sentences} onScore={handleScore}/>}
                  {gameIdx===2&&<BingoGame words={words} onScore={handleScore}/>}
                  {gameIdx===3&&<WordPop words={words} onScore={handleScore}/>}
                </div>
                <div style={{background:"#fef3c7",borderRadius:12,padding:"10px 14px",fontSize:12,color:"#92400e",lineHeight:1.7}}>💡 3점 획득마다 방 꾸미기 아이템 획득! 🎁 코인으로 상점에서 추가 구매 가능</div>
              </>
            )}
          </div>
        )}

        {/* ── 내 방 탭 ── */}
        {mainTab===2&&(
          <div style={{background:"white",borderRadius:20,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
            <RoomDecorator ownedItems={ownedItems} coins={coins} onSpend={spendCoins}/>
          </div>
        )}

      </div>
    </div>
  );
}

function EmptyState({label,emoji}){
  return(
    <div style={{textAlign:"center",color:"#9ca3af",padding:"40px 0"}}>
      <div style={{fontSize:40,marginBottom:10}}>{emoji}</div>
      <div style={{fontSize:14}}>{label}</div>
    </div>
  );
}