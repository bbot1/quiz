let current = 0;
let score = 0;
let wrongAnswers = [];
let userName = localStorage.getItem('quizUser') || '익명';

const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("nextButton");
const giveUpBtn = document.getElementById("giveUpBtn");
const progressEl = document.getElementById("progress");
const userNameEl = document.getElementById("userName");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const reviewMode = localStorage.getItem("reviewMode") === "true";
if (reviewMode) {
  const review = JSON.parse(localStorage.getItem("reviewQuestions") || "[]");
  quizData.length = 0;
  quizData.push(...review);
  localStorage.removeItem("reviewMode");
  localStorage.removeItem("reviewQuestions");
}

shuffle(quizData);

function updateProgress() {
  progressEl.textContent = `문제 ${current + 1} / ${quizData.length}`;
}

function renderQuestion() {
  const q = quizData[current];
  quizEl.innerHTML = "";
  let selectedChoice = null;
  userNameEl.textContent = `사용자: ${userName}`;

  // 문제 번호와 텍스트
  const qNumEl = document.createElement("h3");
  qNumEl.textContent = `문제 ${current + 1}`;
  quizEl.appendChild(qNumEl);

  const qTextEl = document.createElement("p");
  qTextEl.textContent = q.question;
  quizEl.appendChild(qTextEl);

  // multiple
  if (q.type === "multiple") {
    q.choices.forEach((choice, idx) => {
      if (!choice) return;
      const btn = document.createElement("button");
      btn.textContent = `${idx + 1}. ${choice}`;
      btn.className = "choice-button";
      btn.onclick = () => {
        if (selectedChoice !== null) return;
        selectedChoice = idx;
        btn.classList.add("selected");
      };
      quizEl.appendChild(btn);
    });
  }
  // short
  else if (q.type === "short") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "정답을 입력하세요";
    quizEl.appendChild(input);
  }
  // group
  else if (q.type === "group") {
    // 왼쪽 항목
    const left = document.createElement("div");
    left.className = "group-left";
    q.pairs.forEach(item => {
      const p = document.createElement("p");
      p.textContent = `${item}`;
      left.appendChild(p);
    });
    // 오른쪽 설명과 빈칸
    const right = document.createElement("div");
    right.className = "group-right";
    q.choices.forEach(desc => {
      const row = document.createElement("div");
      const inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = "레이블 입력";
      inp.dataset.desc = desc;
      inp.className = "group-input";
      const span = document.createElement("span");
      span.textContent = desc;
      row.appendChild(inp);
      row.appendChild(span);
      right.appendChild(row);
    });
    const container = document.createElement("div");
    container.className = "group-ui";
    container.appendChild(left);
    container.appendChild(right);
    quizEl.appendChild(container);
  }

  updateProgress();
}

function next() {
  const q = quizData[current];
  // multiple 채점
  if (q.type === "multiple") {
    const selected = quizEl.querySelector(".selected");
    if (!selected) return alert("보기 중 하나를 선택하세요.");
    const idx = Array.from(quizEl.querySelectorAll(".choice-button")).indexOf(selected);
    if (idx + 1 === q.answer) score++;
    else wrongAnswers.push(q);
  }
  // short 채점
  else if (q.type === "short") {
    const ans = quizEl.querySelector("input").value.trim();
    if (!ans) return alert("답을 입력하세요.");
    if (q.answer.includes(ans)) score++;
    else wrongAnswers.push(q);
  }
  // group 채점
  else if (q.type === "group") {
    const inputs = quizEl.querySelectorAll(".group-input");
    if ([...inputs].some(i => !i.value.trim())) 
      return alert("모든 빈칸에 레이블을 입력하세요.");
    let correct = true;
    inputs.forEach(i => {
      const userLabel = i.value.trim();
      const desc = i.dataset.desc;
      if (q.answer[userLabel] != null && q.answer[userLabel] == (q.choices.indexOf(desc)+1).toString()) {
        // OK
      } else {
        correct = false;
      }
    });
    if (correct) score++;
    else wrongAnswers.push(q);
  }

  current++;
  if (current < quizData.length) renderQuestion();
  else finishQuiz();
}

function finishQuiz() {
  localStorage.setItem("quizScore", score);
  localStorage.setItem("quizTotal", quizData.length);
  localStorage.setItem("quizWrong", JSON.stringify(wrongAnswers));
  location.href = "result.html";
}

function giveUp() {
  finishQuiz();
}

nextBtn.onclick = next;
giveUpBtn.onclick = giveUp;

window.onload = renderQuestion;
