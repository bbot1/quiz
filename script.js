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
        if(selectedChoice !== null) return;
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
    const list = document.createElement("div");
    list.className = "group-question";

    const pairTable = document.createElement("table");
    pairTable.style.width = "100%";
    pairTable.style.textAlign = "left";

    q.pairs.forEach(pair => {
      const row = document.createElement("tr");

      const labelCell = document.createElement("td");
      labelCell.textContent = pair;
      labelCell.style.fontWeight = "bold";

      const inputCell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = 1;
      input.max = q.choices.length;
      input.placeholder = "보기 번호 입력";
      input.dataset.key = pair;
      input.classList.add("group-input");

      inputCell.appendChild(input);
      row.appendChild(labelCell);
      row.appendChild(inputCell);
      pairTable.appendChild(row);
    });

    list.appendChild(pairTable);

    const choiceList = document.createElement("ul");
    q.choices.forEach((choice, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${choice}`;
      choiceList.appendChild(li);
    });

    quizEl.appendChild(list);
    quizEl.appendChild(choiceList);
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
  } else if(q.type === "group") {
    const inputs = quizEl.querySelectorAll(".group-input");
    let correct = true;

    for (const input of inputs) {
      const key = input.dataset.key;
      const value = input.value.trim();
      if (!value || value !== q.answer[key]) {
        correct = false;
      }
    }

    if (Array.from(inputs).some(i => i.value.trim() === "")) {
      alert("모든 항목에 답을 입력하세요.");
      return;
    }

    if (correct) score++;
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
