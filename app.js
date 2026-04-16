(() => {
  const QUESTIONS_PER_GAME = 15;

  const MODES = {
    bicycle: {
      dataUrl: 'data/signs-bicycle.json',
      title: '自転車標識クイズ',
      lead: '自転車にも<strong>青切符</strong>の時代。<br>道路標識の意味、ちゃんと理解していますか？',
      tweetHook: '自転車にも青切符。標識、ちゃんと覚えてる？'
    },
    car: {
      dataUrl: 'data/signs-car.json',
      title: '自動車標識クイズ',
      lead: '意外と忘れている道路標識。<br>免許を取った時の知識、今も正確ですか？',
      tweetHook: '運転中に見る標識、正確に覚えてる？'
    }
  };

  const $ = (id) => document.getElementById(id);
  const state = { mode: null, signs: [], questions: [], index: 0, score: 0, answered: false };

  const shuffle = (a) => {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const buildQuestions = () => {
    const pool = shuffle(state.signs);
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

    const sup = $('supplement');
    if (q.sign.supplement) {
      sup.textContent = q.sign.supplement;
      sup.hidden = false;
    } else {
      sup.hidden = true;
      sup.textContent = '';
    }

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

  const showFinal = () => {
    $('quizCard').hidden = true;
    document.querySelector('.c-progress').hidden = true;
    $('final').hidden = false;
    $('finalScore').textContent = state.score;
    $('finalTotal').textContent = state.questions.length;

    const ratio = state.score / state.questions.length;
    let msg;
    if (ratio === 1) msg = '完璧です。公道を走る資格あり。';
    else if (ratio >= 0.8) msg = '優秀。大半の標識は理解できています。';
    else if (ratio >= 0.5) msg = 'もう一歩。うっかり違反にご注意を。';
    else msg = '復習が必要です。違反切符の前に、今ここで学び直しましょう。';
    $('finalMsg').textContent = msg;

    const hook = MODES[state.mode].tweetHook;
    const modeLabel = state.mode === 'car' ? '自動車' : '自転車';
    const tweetText = `${modeLabel}標識クイズで ${state.score}/${state.questions.length} 問正解しました。\n${hook}`;
    const url = `${location.origin}${location.pathname}?mode=${state.mode}`;
    $('tweetBtn').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
  };

  const startQuiz = async (mode) => {
    state.mode = mode;
    const conf = MODES[mode];
    $('headerTitle').textContent = conf.title;
    $('headerLead').innerHTML = conf.lead;
    document.title = `${conf.title}｜道路標識を4択でチェック`;

    if (!state.signs.length || state.signs._mode !== mode) {
      const res = await fetch(conf.dataUrl);
      const data = await res.json();
      data._mode = mode;
      state.signs = data;
    }

    state.questions = buildQuestions();
    state.index = 0;
    state.score = 0;

    $('modeSelect').hidden = true;
    $('quizSection').hidden = false;
    $('quizCard').hidden = false;
    document.querySelector('.c-progress').hidden = false;
    $('final').hidden = true;

    history.replaceState(null, '', `?mode=${mode}`);
    render();
  };

  const backToSelect = () => {
    state.mode = null;
    state.signs = [];
    $('headerTitle').textContent = '道路標識クイズ';
    $('headerLead').innerHTML = '自転車にも<strong>青切符</strong>の時代。<br>道路標識の意味、ちゃんと理解していますか？';
    document.title = '道路標識クイズ｜自転車・自動車の標識を4択でチェック';
    $('modeSelect').hidden = false;
    $('quizSection').hidden = true;
    history.replaceState(null, '', location.pathname);
  };

  document.querySelectorAll('.c-mode').forEach((btn) => {
    btn.addEventListener('click', () => startQuiz(btn.dataset.mode));
  });

  $('nextBtn').addEventListener('click', () => {
    state.index++;
    if (state.index >= state.questions.length) showFinal();
    else render();
  });

  $('retryBtn').addEventListener('click', () => startQuiz(state.mode));
  $('backBtn').addEventListener('click', backToSelect);

  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode');
  if (initialMode && MODES[initialMode]) {
    startQuiz(initialMode);
  }
})();
