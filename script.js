
let current = 0;
let score = 0;
let wrongAnswers = [];
const quizEl = document.getElementById("quiz");
const nextBtn = document.getElementById("nextButton");

function renderQuestion() {
  const q = quizData[current];
  quizEl.innerHTML = "";
  const qEl = document.createElement("div");
  qEl.innerHTML = `<h3>${q.question}</h3>`;

  if (q.type === "multiple") {
    q.choices.forEach((choice, index) => {
      const btn = document.createElement("button");
      btn.textContent = choice;
      btn.onclick = () => {
        if (index === q.answer) score++;
        else wrongAnswers.push(q);
        next();
      };
      qEl.appendChild(btn);
    });
  } else if (q.type === "short") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "정답 입력";
    qEl.appendChild(input);
    const submit = document.createElement("button");
    submit.textContent = "제출";
    submit.onclick = () => {
      const ans = input.value.trim();
      if (q.answer.includes(ans)) score++;
      else wrongAnswers.push(q);
      next();
    };
    qEl.appendChild(submit);
  } else if (q.type === "match") {
    qEl.innerHTML += "<p>(이 기능은 다음 버전에 구현 예정입니다)</p>";
    next();
  }
  quizEl.appendChild(qEl);
}

function next() {
  current++;
  if (current < quizData.length) {
    renderQuestion();
  } else {
    quizEl.innerHTML = `<h2>점수: ${score}/${quizData.length}</h2>`;
    if (wrongAnswers.length > 0) {
      quizEl.innerHTML += "<h3>틀린 문제:</h3><ul>";
      wrongAnswers.forEach(q => {
        quizEl.innerHTML += `<li>${q.question}</li>`;
      });
      quizEl.innerHTML += "</ul>";
    }
    localStorage.setItem("lastScore", score);
    nextBtn.style.display = "none";
  }
}

renderQuestion();
nextBtn.onclick = next;
