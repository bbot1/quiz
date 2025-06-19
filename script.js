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
  selectedChoice = null;

  userNameEl.textContent = `사용자: ${userName}`;

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
        if (selectedChoice !== null) return;
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
  } else if (q.type === "group") {
    const pairTable = document.createElement("table");
    q.pairs.forEach(pair => {
      const row = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = pair;
      labelCell.style.fontWeight = "bold";
      const inputCell = document.createElement("td");
      const inp = document.createElement("input");
      inp.type = "number";
      inp.min = 1;
      inp.max = q.choices.length;
      inp.placeholder = "번호";
      inp.dataset.key = pair;
      inp.classList.add("group-input");
      inputCell.appendChild(inp);
      row.appendChild(labelCell);
      row.appendChild(inputCell);
      pairTable.appendChild(row);
    });
    quizEl.appendChild(pairTable);

    const choiceList = document.createElement("ul");
    q.choices.forEach((choice, idx) => {
      const li = document.createElement("li");
      li.textContent = `${idx + 1}. ${choice}`;
      choiceList.appendChild(li);
    });
    quizEl.appendChild(choiceList);
  }

  updateProgress();
}

function next() {
  if (current >= quizData.length) return;
  const q = quizData[current];

  if (q.type === "multiple") {
    if (selectedChoice === null) {
      alert("보기 중 하나를 선택하세요.");
      return;
    }
    if (selectedChoice === q.answer) score++;
    else wrongAnswers.push(q);
  } else if (q.type === "short") {
    const ans = quizEl.querySelector("input").value.trim();
    if (!ans) return alert("답을 입력하세요.");
    if (q.answer.includes(ans)) score++;
    else wrongAnswers.push(q);
  } else if (q.type === "group") {
    const inputs = quizEl.querySelectorAll(".group-input");
    if ([...inputs].some(i => !i.value.trim())) {
      return alert("모든 항목에 번호를 입력하세요.");
    }
    let correct = true;
    inputs.forEach(i => {
      if (i.value.trim() !== q.answer[i.dataset.key]) correct = false;
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
