
let current = 0;
let score = 0;
let wrongAnswers = [];
let userName = localStorage.getItem('quizUser') || '익명';
const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("nextButton");
const giveUpBtn = document.getElementById("giveUpBtn");
const progressEl = document.getElementById("progress");
const userNameEl = document.getElementById("userName");
let selectedChoice = null;

function updateProgress() {
  progressEl.textContent = `문제 ${current + 1} / ${quizData.length}`;
}

function renderQuestion() {
  const q = quizData[current];
  quizEl.innerHTML = "";
  selectedChoice = null;

  const qNumEl = document.createElement("h3");
  qNumEl.textContent = `문제 ${current + 1}`;
  quizEl.appendChild(qNumEl);

  const qTextEl = document.createElement("p");
  qTextEl.textContent = q.question;
  quizEl.appendChild(qTextEl);

  if (q.type === "multiple") {
    q.choices.forEach((choice, index) => {
      const btn = document.createElement("button");
      btn.textContent = `${index + 1}. ${choice}`;
      btn.className = "choice-button";
      btn.onclick = () => {
        // 선택 표시
        if(selectedChoice !== null) return; // 한번만 선택 가능
        selectedChoice = index;
        btn.classList.add("selected");
      };
      quizEl.appendChild(btn);
    });
  } else if (q.type === "short") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "정답 입력";
    quizEl.appendChild(input);
  } else if (q.type === "match") {
    quizEl.innerHTML += "<p>(짝맞추기 문제는 다음 버전에 구현 예정입니다.)</p>";
  }
  updateProgress();
}

function next() {
  if(current >= quizData.length) return;
  const q = quizData[current];

  if(q.type === "multiple") {
    if(selectedChoice === null) {
      alert("보기 중 하나를 선택하세요.");
      return;
    }
    if(selectedChoice === q.answer) score++;
    else wrongAnswers.push(q);
  } else if(q.type === "short") {
    const input = quizEl.querySelector("input");
    const ans = input.value.trim();
    if(ans === "") {
      alert("답을 입력하세요.");
      return;
    }
    if(q.answer.some(a => a === ans)) score++;
    else wrongAnswers.push(q);
  }
  current++;
  if(current < quizData.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  localStorage.setItem('quizScore', score);
  localStorage.setItem('quizTotal', quizData.length);
  localStorage.setItem('quizWrong', JSON.stringify(wrongAnswers));
  location.href = "result.html";
}

function giveUp() {
  finishQuiz();
}

nextBtn.onclick = next;
giveUpBtn.onclick = giveUp;

window.onload = () => {
  userNameEl.textContent = `사용자: ${userName}`;
  renderQuestion();
};
