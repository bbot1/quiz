let current = 0;
let score = 0;
let wrongAnswers = [];
let userAnswers = Array(quizData.length).fill(null);
let userName = localStorage.getItem('quizUser') || '익명';

const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("nextButton");
const prevBtn = document.getElementById("prevButton");
const giveUpBtn = document.getElementById("giveUpBtn");
const progressEl = document.getElementById("progress");
const userNameEl = document.getElementById("userName");
const answerGrid = document.getElementById("answerGrid");

function updateGrid() {
  answerGrid.innerHTML = '';
  quizData.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.textContent = idx + 1;
    btn.className = 'number-button';
    if (userAnswers[idx] != null) btn.classList.add('answered');
    if (idx === current) btn.classList.add('current');
    btn.onclick = () => { goToQuestion(idx); };
    answerGrid.appendChild(btn);
  });
}

function goToQuestion(idx) {
  current = idx;
  renderQuestion();
}

prevBtn.onclick = () => {
  if (current > 0) { current--; renderQuestion(); }
};
nextBtn.onclick = () => {
  if (!storeAnswer()) return;
  if (current < quizData.length - 1) { current++; renderQuestion(); }
  else finishQuiz();
};
giveUpBtn.onclick = finishQuiz;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(quizData);

function updateProgress() {
  progressEl.textContent = `문제 ${current + 1} / ${quizData.length}`;
}

function renderQuestion() {
  const q = quizData[current];
  quizEl.innerHTML = '';
  userNameEl.textContent = `사용자: ${userName}`;
  updateProgress();
  updateGrid();

  // Question text
  const qNum = document.createElement('h3');
  qNum.textContent = q.question;
  quizEl.appendChild(qNum);

  // Render answer area
  if (q.type === 'multiple') {
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.textContent = `${idx+1}. ${choice}`;
      btn.className = 'choice-button';
      btn.onclick = () => {
        // toggle selection
        quizEl.querySelectorAll('.choice-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      quizEl.appendChild(btn);
    });
  } else if (q.type === 'short') {
    const input = document.createElement('input');
    input.type = 'text'; input.placeholder = '정답 입력';
    quizEl.appendChild(input);
  } else if (q.type === 'ox') {
    ['O','X'].forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label; btn.className = 'choice-button';
      btn.onclick = () => {
        quizEl.querySelectorAll('.choice-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      quizEl.appendChild(btn);
    });
  } else if (q.type === 'group') {
    // as before: left & right
    const left = document.createElement('div'); left.className='group-left';
    q.pairs.forEach(p => { const el = document.createElement('p'); el.textContent = p; left.appendChild(el); });
    const right = document.createElement('div'); right.className='group-right';
    q.choices.forEach((desc,i) => {
      const row = document.createElement('div');
      const inp = document.createElement('input'); inp.type='text'; inp.maxLength=1; inp.dataset.key=q.pairs[i]; inp.className='group-input';
      row.appendChild(inp); row.appendChild(Object.assign(document.createElement('span'),{textContent:desc}));
      right.appendChild(row);
    });
    const container = document.createElement('div'); container.className='group-ui';
    container.appendChild(left); container.appendChild(right);
    quizEl.appendChild(container);
  }

  // restore previous answer
  setTimeout(restoreAnswer,0);
}

function storeAnswer() {
  const q = quizData[current];
  let ans, correct;
  if (q.type === 'multiple') {
    const btn = quizEl.querySelector('.choice-button.selected');
    if (!btn) { alert('보기 중 하나를 선택하세요.'); return false; }
    const idx = [...quizEl.querySelectorAll('.choice-button')].indexOf(btn);
    ans = idx; correct = (idx+1===q.answer);
  } else if (q.type==='short') {
    const val = quizEl.querySelector('input').value.trim();
    if (!val) { alert('답을 입력하세요.'); return false; }
    ans=val; correct = q.answer.includes(val);
  } else if (q.type==='ox') {
    const btn = quizEl.querySelector('.choice-button.selected'); if(!btn){alert('O 또는 X 선택');return false;}
    ans=btn.textContent; correct = (ans===q.answer);
  } else if (q.type==='group') {
    const inputs = quizEl.querySelectorAll('.group-input');
    if ([...inputs].some(i=>!i.value.trim())){alert('빈칸 모두 채우기');return false;}
    ans={}; correct=true;
    inputs.forEach(i=>{ans[i.dataset.key]=i.value.trim(); if(q.answer[i.dataset.key]!==i.value.trim())correct=false;});
  }
  userAnswers[current]=ans; if(!correct) wrongAnswers.push({...q, user:ans}); else score++;
  return true;
}

function restoreAnswer() {
  const q=quizData[current], prev=userAnswers[current]; if(prev==null)return;
  if(q.type==='multiple'){
    const btns=quizEl.querySelectorAll('.choice-button'); if(btns[prev])btns[prev].classList.add('selected');
  }else if(q.type==='short'){quizEl.querySelector('input').value=prev;
  }else if(q.type==='ox'){quizEl.querySelectorAll('.choice-button').forEach(b=>{if(b.textContent===prev)b.classList.add('selected');});
  }else if(q.type==='group'){quizEl.querySelectorAll('.group-input').forEach(i=>{i.value=prev[i.dataset.key]||'';});}
}

function finishQuiz() {
  localStorage.setItem('quizScore',score);
  localStorage.setItem('quizTotal',quizData.length);
  localStorage.setItem('quizWrong',JSON.stringify(wrongAnswers));
  location.href='result.html';
}

window.onload=renderQuestion;
