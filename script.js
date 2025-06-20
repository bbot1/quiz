let current = 0;
let score = 0;
let wrongAnswers = [];
let userName = localStorage.getItem('quizUser') || '익명';

const quizEl       = document.getElementById("quiz");
const nextBtn      = document.getElementById("nextButton");
const giveUpBtn    = document.getElementById("giveUpBtn");
const progressEl   = document.getElementById("progress");
const userNameEl   = document.getElementById("userName");

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    let j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
}

if(localStorage.getItem("reviewMode")==="true"){
  const rev = JSON.parse(localStorage.getItem("reviewQuestions")||"[]");
  quizData.length=0;
  quizData.push(...rev);
  localStorage.removeItem("reviewMode");
  localStorage.removeItem("reviewQuestions");
}

shuffle(quizData);

function updateProgress(){
  progressEl.textContent = `문제 ${current+1} / ${quizData.length}`;
}

function renderQuestion(){
  const q = quizData[current];
  quizEl.innerHTML = "";
  let selected = null;
  userNameEl.textContent = `사용자: ${userName}`;

  const h3 = document.createElement("h3");
  h3.textContent = `문제 ${current+1}`;
  quizEl.appendChild(h3);

  const p = document.createElement("p");
  p.textContent = q.question;
  quizEl.appendChild(p);

  // multiple
  if(q.type==="multiple"){
    q.choices.forEach((ch,i)=>{
      if(!ch.trim()) return;
      const b = document.createElement("button");
      b.textContent = `${i+1}. ${ch}`;
      b.className = "choice-button";
      b.onclick = ()=>{
        if(selected===i){
          selected = null;
          b.classList.remove("selected");
          return;
        }
        if(selected!==null) return;
        selected=i;
        b.classList.add("selected");
      };
      quizEl.appendChild(b);
    });
  }
  // short
  else if(q.type==="short"){
    const inp = document.createElement("input");
    inp.type="text";
    inp.placeholder="답 입력";
    quizEl.appendChild(inp);
  }
  // group
  else if(q.type==="group"){
    const ctn = document.createElement("div");
    ctn.className="group-ui";
    const left = document.createElement("div");
    left.className="group-left";
    q.pairs.forEach(item=>{
      const pp = document.createElement("p");
      pp.textContent = item;
      left.appendChild(pp);
    });
    const right = document.createElement("div");
    right.className="group-right";
    q.choices.forEach(desc=>{
      const row = document.createElement("div");
      const inp = document.createElement("input");
      inp.type="text"; inp.maxLength=1;
      inp.placeholder="O/X/ㄱ";
      inp.dataset.desc = desc;
      inp.className="group-input";
      const span = document.createElement("span");
      span.textContent=desc;
      row.appendChild(inp);
      row.appendChild(span);
      right.appendChild(row);
    });
    ctn.appendChild(left);
    ctn.appendChild(right);
    quizEl.appendChild(ctn);
  }
  // ox
  else if(q.type==="ox"){
    ["O","X"].forEach(lbl=>{
      const b = document.createElement("button");
      b.textContent=lbl;
      b.className="choice-button";
      b.onclick=()=>{
        if(selected===lbl){
          selected=null;
          b.classList.remove("selected");
          return;
        }
        quizEl.querySelectorAll(".choice-button").forEach(x=>x.classList.remove("selected"));
        selected=lbl;
        b.classList.add("selected");
      };
      quizEl.appendChild(b);
    });
  }

  updateProgress();
}

function next(){
  const q = quizData[current];
  // multiple
  if(q.type==="multiple"){
    const btns = quizEl.querySelectorAll(".choice-button");
    const idx  = [...btns].findIndex(b=>b.classList.contains("selected"));
    if(idx<0) return alert("보기를 선택하세요.");
    if(idx+1===q.answer) score++; else wrongAnswers.push(q);
  }
  // short
  else if(q.type==="short"){
    const val = quizEl.querySelector("input").value.trim();
    if(!val) return alert("답을 입력하세요.");
    if(q.answer.includes(val)) score++; else wrongAnswers.push(q);
  }
  // group
  else if(q.type==="group"){
    const ins = quizEl.querySelectorAll(".group-input");
    if([...ins].some(i=>!i.value.trim())) return alert("빈칸을 모두 채우세요.");
    let ok=true;
    ins.forEach(i=>{
      const desc = i.dataset.desc;
      const got   = i.value.trim();
      const idx   = q.choices.indexOf(desc)+1+"";
      const correctKey = Object.keys(q.answer).find(k=>q.answer[k]===idx);
      if(got!==correctKey) ok=false;
    });
    if(ok) score++; else wrongAnswers.push(q);
  }
  // ox
  else if(q.type==="ox"){
    const btns = quizEl.querySelectorAll(".choice-button");
    const chosen = [...btns].find(b=>b.classList.contains("selected"));
    if(!chosen) return alert("O 또는 X를 선택하세요.");
    if(chosen.textContent===q.answer) score++; else wrongAnswers.push(q);
  }

  current++;
  if(current<quizData.length) renderQuestion();
  else finishQuiz();
}

function finishQuiz(){
  localStorage.setItem("quizScore", score);
  localStorage.setItem("quizTotal", quizData.length);
  localStorage.setItem("quizWrong", JSON.stringify(wrongAnswers));
  location.href="result.html";
}

function giveUp(){ finishQuiz(); }

nextBtn.onclick = next;
giveUpBtn.onclick = giveUp;

window.onload = renderQuestion;
