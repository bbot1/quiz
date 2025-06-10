<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>조경기사 퀴즈</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <h2 id="userName"></h2>
    <div id="progress"></div>
    <div id="quiz"></div>
    <button id="nextButton">다음 문제</button>
    <button id="giveUpBtn">포기하기</button>
  </div>

  <script src="quiz.js"></script>
  <script>
    let current = 0;
    let score = 0;
    let wrongAnswers = [];
    let userName = localStorage.getItem('quizUser') || '익명';
    let quizData = JSON.parse(localStorage.getItem('quizData')) || [];

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
        const guide = document.createElement("p");
        guide.textContent = "각 보기에 대해 그룹을 선택하세요.";
        quizEl.appendChild(guide);

        q.choices.forEach((choice, idx) => {
          const wrapper = document.createElement("div");
          wrapper.className = "group-choice";

          const label = document.createElement("span");
          label.textContent = `${idx + 1}. ${choice} `;
          wrapper.appendChild(label);

          const select = document.createElement("select");
          const defaultOpt = document.createElement("option");
          defaultOpt.value = "";
          defaultOpt.textContent = "선택";
          defaultOpt.selected = true;
          select.appendChild(defaultOpt);

          q.groups.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            select.appendChild(opt);
          });

          select.dataset.idx = idx + 1;
          wrapper.appendChild(select);
          quizEl.appendChild(wrapper);
        });
      }

      updateProgress();
    }

    function collectGroupSelections() {
      const selects = quizEl.querySelectorAll("select");
      const result = {};
      selects.forEach(sel => {
        const group = sel.value;
        const num = parseInt(sel.dataset.idx);
        if (group) {
          if (!result[group]) result[group] = [];
          result[group].push(num);
        }
      });
      for (const g in result) result[g].sort((a,b)=>a-b);
      return result;
    }

    function compareGroupAnswers(user, correct) {
      const keys = Object.keys(correct);
      for (const k of keys) {
        const u = (user[k] || []).sort((a,b) => a - b);
        const c = correct[k].slice().sort((a,b) => a - b);
        if (u.length !== c.length || !u.every((val, i) => val === c[i])) {
          return false;
        }
      }
      return true;
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
        const userAnswer = collectGroupSelections();
        if (compareGroupAnswers(userAnswer, q.answer)) score++;
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
  </script>
</body>
</html>
