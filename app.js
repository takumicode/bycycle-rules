(async () => {
  const QUESTIONS_PER_GAME = 10;
  const res = await fetch('data/signs.json');
  const SIGNS = await res.json();

  const shuffle = (a) => {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const state = { questions: [], index: 0, score: 0, answered: false };

  const $ = (id) => document.getElementById(id);

  const buildQuestions = () => {
    const pool = shuffle(SIGNS);
    const take = Math.min(QUESTIONS_PER_GAME, pool.length);
    return pool.slice(0, take).map((sign) => {
      const distractors = shuffle(sign.wrong).slice(0, 3);
      const choices = shuffle([sign.name, ...distractors]);
      return { sign, choices, correct: sign.name };
    });
  };

  const render = () => {
    const q = state.questions[state.index];
    state.answered = false;

    $('qIndex').textContent = state.index + 1;
    $('qTotal').textContent = state.questions.length;
    $('progressFill').style.width = `${((state.index) / state.questions.length) * 100}%`;

    $('signImage').src = q.sign.image;
    $('signImage').alt = '道路標識';

    const ul = $('choices');
    ul.innerHTML = '';
    q.choices.forEach((choice) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l-quiz__choice';
      btn.textContent = choice;
      btn.addEventListener('click', () => onAnswer(btn, choice));
      li.appendChild(btn);
      ul.appendChild(li);
    });

    $('result').hidden = true;
  };

  const onAnswer = (btn, choice) => {
    if (state.answered) return;
    state.answered = true;
    const q = state.questions[state.index];
    const isCorrect = choice === q.correct;
    if (isCorrect) state.score++;

    document.querySelectorAll('.l-quiz__choice').forEach((b) => {
      b.disabled = true;
      if (b.textContent === q.correct) b.classList.add('is-correct');
      else if (b === btn) b.classList.add('is-wrong');
    });

    const judge = $('judge');
    judge.textContent = isCorrect ? '正解' : '不正解';
    judge.className = 'l-quiz__result-judge ' + (isCorrect ? 'is-correct' : 'is-wrong');
    $('answerName').textContent = q.correct;
    $('explain').textContent = q.sign.explanation;
    $('result').hidden = false;
    $('progressFill').style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  };

  $('nextBtn').addEventListener('click', () => {
    state.index++;
    if (state.index >= state.questions.length) showFinal();
    else render();
  });

  const showFinal = () => {
    $('quizCard').hidden = true;
    document.querySelector('.c-progress').hidden = true;
    $('final').hidden = false;
    $('finalScore').textContent = state.score;
    $('finalTotal').textContent = state.questions.length;

    const ratio = state.score / state.questions.length;
    let msg;
    if (ratio === 1) msg = '完璧です。青切符とは無縁の生活を送れるでしょう。';
    else if (ratio >= 0.8) msg = '優秀。大半の標識は理解できています。';
    else if (ratio >= 0.5) msg = 'もう一歩。うっかり違反にご注意を。';
    else msg = '復習が必要です。青切符の前に、今ここで学び直しましょう。';
    $('finalMsg').textContent = msg;

    const tweetText = `自転車標識クイズで ${state.score}/${state.questions.length} 問正解しました。\n2026年から自転車にも青切符。標識、ちゃんと覚えてる？`;
    const url = location.href.split('?')[0];
    $('tweetBtn').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
  };

  $('retryBtn').addEventListener('click', () => {
    state.questions = buildQuestions();
    state.index = 0;
    state.score = 0;
    $('quizCard').hidden = false;
    document.querySelector('.c-progress').hidden = false;
    $('final').hidden = true;
    render();
  });

  state.questions = buildQuestions();
  render();
})();
