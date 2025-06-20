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

  const qNum = document.createElement('h3'); qNum.textContent = q.question;
  quizEl.appendChild(qNum);

  // Render choice, short, group, ox as before
  // After rendering input/buttons, restore previous answer:
  setTimeout(() => restoreAnswer(), 0);
}

function storeAnswer() {
  const q = quizData[current];
  let ans; let correct = false;
  if (q.type === 'multiple') {
    const btns = quizEl.querySelectorAll('.choice-button');
    const idx = [...btns].findIndex(b => b.classList.contains('selected'));
    if (idx < 0) { alert('보기 중 하나를 선택하세요.'); return false; }
    ans = idx; correct = (idx + 1 === q.answer);
  } else if (q.type === 'short') {
    const val = quizEl.querySelector('input').value.trim();
    if (!val) { alert('답을 입력하세요.'); return false; }
    ans = val; correct = q.answer.includes(val);
  } else if (q.type === 'ox') {
    const btn = quizEl.querySelector('.choice-button.selected');
    if (!btn) { alert('O 또는 X를 선택하세요.'); return false; }
    ans = btn.textContent; correct = (ans === q.answer);
  } else if (q.type === 'group') {
    const inputs = quizEl.querySelectorAll('.group-input');
    if ([...inputs].some(i=>!i.value.trim())) { alert('빈칸을 모두 채우세요.'); return false; }
    ans = {};
    for (let i of inputs) ans[i.dataset.key]=i.value.trim();
    correct = true;
    for (let k in q.answer) if (ans[k] !== q.answer[k]) correct = false;
  }
  userAnswers[current] = ans;
  if (!correct) wrongAnswers.push({ ...q, user: ans }); else score++;
  return true;
}

function restoreAnswer() {
  const q = quizData[current]; const prev = userAnswers[current];
  if (prev == null) return;
  if (q.type === 'multiple') {
    const btns = quizEl.querySelectorAll('.choice-button');
    if (btns[prev]) btns[prev].classList.add('selected');
  } else if (q.type === 'short') {
    const inp = quizEl.querySelector('input'); inp.value = prev;
  } else if (q.type === 'ox') {
    quizEl.querySelectorAll('.choice-button').forEach(b=>{
      if (b.textContent === prev) b.classList.add('selected');
    });
  } else if (q.type === 'group') {
    quizEl.querySelectorAll('.group-input').forEach(i=>{
      i.value = prev[i.dataset.key] || '';
    });
  }
}

function finishQuiz() {
  localStorage.setItem('quizScore', score);
  localStorage.setItem('quizTotal', quizData.length);
  localStorage.setItem('quizWrong', JSON.stringify(wrongAnswers));
  location.href = 'result.html';
}

window.onload = renderQuestion;
