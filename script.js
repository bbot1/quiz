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
    const left = document.createElement('div'); left.className = 'group-left';
    q.pairs.forEach(p => {
      const el = document.createElement('p');
      el.textContent = p;
      left.appendChild(el);
    });
    const right = document.createElement('div'); right.className = 'group-right';
    q.choices.forEach((desc, i) => {
      const row = document.createElement('div');
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 1;
      inp.dataset.key = q.pairs[i];
      inp.className = 'group-input';
      row.appendChild(inp);
      row.appendChild(Object.assign(document.createElement('span'), { textContent: desc }));
      right.appendChild(row);
    });
    const container = document.createElement('div'); container.className = 'group-ui';
    container.appendChild(left);
    container.appendChild(right);
    quizEl.appendChild(container);

  } else if (q.type === 'sequence') {
    const box = document.createElement('div');
    box.className = 'seq-choices';
    q.choices.forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.className = 'seq-choice';
      box.appendChild(span);
      if (i < q.choices.length - 1) {
        const arrow = document.createElement('span');
        arrow.textContent = ' → ';
        box.appendChild(arrow);
      }
    });
    quizEl.appendChild(box);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '예: 1→2→3';
    input.className = 'seq-input';
    quizEl.appendChild(input);

  } else if (q.type === 'image-blank') {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.maxWidth = '600px';
    container.style.margin = '0 auto 20px';
    quizEl.appendChild(container);

    const img = document.createElement('img');
    img.src = q.imageUrl;
    img.style.width = '100%';
    container.appendChild(img);

    q.blanks.forEach(b => {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = b.key;
      inp.maxLength = 10;
      inp.dataset.key = b.key;
      inp.className = 'image-blank-input';

      inp.style.position = 'absolute';
      inp.style.left = b.x + '%';
      inp.style.top = b.y + '%';
      inp.style.width = b.width + '%';
      inp.style.transform = 'translate(-50%, -50%)';

      container.appendChild(inp);
    });
  }

  setTimeout(restoreAnswer, 0);
}

function storeAnswer() {
  const q = quizData[current];
  let ans, correct;

  if (q.type === 'multiple') {
    const btn = quizEl.querySelector('.choice-button.selected');
    if (!btn) { alert('보기 중 하나를 선택하세요.'); return false; }
    const idx = [...quizEl.querySelectorAll('.choice-button')].indexOf(btn);
    ans = idx;
    correct = (idx + 1 === q.answer);

  } else if (q.type === 'short') {
    // 공백 제거 + 소문자 변환해서 비교
    const inputEl = quizEl.querySelector('input');
    const val = inputEl.value.trim();
    if (!val) { alert('답을 입력하세요.'); return false; }

    const normalizedUserVal = val.replace(/\s+/g, '').toLowerCase();
    if (typeof q.answer === 'string') {
      const normAnswer = q.answer.replace(/\s+/g, '').toLowerCase();
      correct = (normAnswer === normalizedUserVal);
    } else {
      correct = q.answer
        .map(a => a.replace(/\s+/g, '').toLowerCase())
        .includes(normalizedUserVal);
    }

    ans = val;

  } else if (q.type === 'ox') {
    const btn = quizEl.querySelector('.choice-button.selected');
    if (!btn) { alert('O 또는 X 선택'); return false; }
    ans = btn.textContent;
    correct = (ans === q.answer);

  } else if (q.type === 'group') {
    const inputs = quizEl.querySelectorAll('.group-input');
    if ([...inputs].some(i => !i.value.trim())) {
      alert('빈칸 모두 채우기');
      return false;
    }
    ans = {};
    correct = true;
    inputs.forEach(i => {
      ans[i.dataset.key] = i.value.trim();
      if (q.answer[i.dataset.key] !== i.value.trim()) correct = false;
    });

  } else if (q.type === 'image-blank') {
    const inputs = quizEl.querySelectorAll('.image-blank-input');
    let allFilled = true;
    correct = true;
    ans = {};
    inputs.forEach(inp => {
      const k = inp.dataset.key;
      const v = inp.value.trim();
      if (!v) allFilled = false;
      ans[k] = v;
      if (v !== q.answer[k]) correct = false;
    });
    if (!allFilled) {
      alert('모든 빈칸을 입력하세요.');
      return false;
    }
  }

  userAnswers[current] = ans;
  if (!correct) wrongAnswers.push({ ...q, user: ans });
  else score++;

  return true;
}

function restoreAnswer() {
  const q = quizData[current];
  const prev = userAnswers[current];
  if (prev == null) return;

  if (q.type === 'multiple') {
    const btns = quizEl.querySelectorAll('.choice-button');
    if (btns[prev]) btns[prev].classList.add('selected');

  } else if (q.type === 'short') {
    quizEl.querySelector('input').value = prev;

  } else if (q.type === 'ox') {
    quizEl.querySelectorAll('.choice-button').forEach(b => {
      if (b.textContent === prev) b.classList.add('selected');
    });

  } else if (q.type === 'group') {
    quizEl.querySelectorAll('.group-input').forEach(i => {
      i.value = prev[i.dataset.key] || '';
    });
  }
}

function finishQuiz() {
  const quizResults = quizData.map((q, idx) => ({
    index: idx + 1,
    type: q.type,
    question: q.question,
    choices: q.choices,
    answer: q.answer,
    user: userAnswers[idx]
  }));

  localStorage.setItem("quizResults", JSON.stringify(quizResults));
  localStorage.setItem("quizScore", score);
  localStorage.setItem("quizTotal", quizData.length);
  location.href = "result.html";
}

window.onload = renderQuestion;
