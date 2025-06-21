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
        quizEl.querySelectorAll('.choice-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      quizEl.appendChild(btn);
    });

  } else if (q.type === 'short') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '정답 입력';
    quizEl.appendChild(input);

  } else if (q.type === 'ox') {
    ['O','X'].forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = 'choice-button';
      btn.onclick = () => {
        quizEl.querySelectorAll('.choice-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      quizEl.appendChild(btn);
    });

  } else if (q.type === 'group') {
    const left = document.
