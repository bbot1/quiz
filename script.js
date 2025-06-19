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

  // 문제번호/텍스트
  const qNumEl = document.createElement("h3");
  qNumEl.textContent = `문제 ${current + 1}`;
  quizEl.appendChild(qNumEl);
  const qTextEl = document.createElement("p");
  qTextEl.textContent = q.question;
  quizEl.appendChild(qTextEl);

  // 객관식
  if (q.type === "multiple") {
    q.choices.forEach((choice, idx) => {
      if (!choice || !choice.trim()) return;  // 빈 보기 숨김
      const btn = document.createElement("button");
      btn.textContent = `${idx + 1}. ${choice}`;
      btn.className = "choice-button";
      btn.onclick = () => {
        // 이미 선택된 항목을 다시 클릭하면 취소
        if (selectedChoice === idx) {
          selectedChoice = null;
          btn.classList.remove("selected");
          return;
        }
        // 다른 답 이미 선택된 상태면 무시
        if (selectedChoice !== null) return;
        selectedChoice = idx;
        btn.classList.add("selected");
      };
      quizEl.appendChild(btn);
    });
  }
  // 단답형
  else if (q.type === "short") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "정답을 입력하세요";
    quizEl.appendChild(input);
  }
  // 연결형
  else if (q.type === "group") {
    // 왼쪽 항목
    const left = document.createElement("div");
    left.className = "group-left";
    q.pairs.forEach(item => {
      const p = document.createElement("p");
      p.textContent = item;
      left.appendChild(p);
    });
    // 오른쪽: 빈칸 + 설명
    const right = document.createElement("div");
    right.className = "group-right";
    q.choices.forEach(desc => {
      const row = document.createElement("div");
      const inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = "ㄱ~";
      inp.maxLength = 1;
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

  // 객관식 채점
  if (q.type === "multiple") {
    const btns = quizEl.querySelectorAll(".choice-button");
    const selectedIdx = Array.from(btns).findIndex(b => b.classList.contains("selected"));
    if (selectedIdx < 0) return alert("보기 중 하나를 선택하세요.");
    if (selectedIdx + 1 === q.answer) score++;
    else wrongAnswers.push(q);
  }
  // 단답형 채점
  else if (q.type === "short") {
    const ans = quizEl.querySelector("input").value.trim();
    if (!ans) return alert("답을 입력하세요.");
    if (q.answer.includes(ans)) score++;
    else wrongAnswers.push(q);
  }
  // 연결형 채점
  else if (q.type === "group") {
    const inputs = quizEl.querySelectorAll(".group-input");
    if ([...inputs].some(i => !i.value.trim())) 
      return alert("모든 빈칸에 레이블(ㄱ~ㅁ)을 입력하세요.");
    let correct = true;
    inputs.forEach(i => {
      const desc = i.dataset.desc;
      // 해당 설명(desc)이 몇 번째인지 계산
      const idx = q.choices.indexOf(desc) + 1;
      // 전체 맵 중에서 idx에 해당하는 레이블 찾기
      const correctKey = Object.keys(q.answer).find(k => q.answer[k] === idx.toString());
      if (i.value.trim() !== correctKey) correct = false;
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
