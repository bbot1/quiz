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
const answerList = document.getElementById("answerList");

function updateSidebar() {
  answerList.innerHTML = '';
  quizData.forEach((q, idx) => {
    const li = document.createElement('li');
    li.textContent = (idx+1) + ": " + (userAnswers[idx] || '-');
    li.onclick = () => { goToQuestion(idx); };
    if(idx === current) li.classList.add('current');
    answerList.appendChild(li);
  });
}

function goToQuestion(idx) {
  current = idx;
  renderQuestion();
}

prevBtn.onclick = () => {
  if(current>0) { current--; renderQuestion(); }
};

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
  updateSidebar();

  const qNum = document.createElement('h3'); qNum.textContent = `문제 ${current+1}`;
  const qText = document.createElement('p'); qText.textContent = q.question;
  quizEl.appendChild(qNum);
  quizEl.appendChild(qText);

  // render choices based on type (multiple, short, ox, group) ... same as before
  // after user selects or inputs answer, store in userAnswers[current]
  // and when moving next or prev, reflect previous selection
  // For brevity, reuse your existing render logic but assign/restore userAnswers[current].
}

nextBtn.onclick = () => {
  // before advancing, validate and store user answer
  // if last question, finishQuiz(); else current++; renderQuestion();
};

giveUpBtn.onclick = () => finishQuiz();

function finishQuiz() {
  // show one-by-one wrong answers in result.html
  localStorage.setItem('quizScore', score);
  localStorage.setItem('quizTotal', quizData.length);
  localStorage.setItem('quizWrong', JSON.stringify(wrongAnswers));
  location.href = "result.html";
}

window.onload = renderQuestion;
