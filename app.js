/* Mundo Brincando — Módulo Evoluído v0.1
   Usa apenas chaves próprias do localStorage (mb_evolved_*). */
(function () {
  "use strict";

  /* ---------- Armazenamento seguro ---------- */
  var KEYS = {
    score: "mb_evolved_score",
    level: "mb_evolved_level",
    age: "mb_evolved_age",
    settings: "mb_evolved_settings",
    comm: "mb_evolved_comm",
    routine: "mb_evolved_routine"
  };
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sem armazenamento */ }
  }

  /* ---------- Estado ---------- */
  var DEFAULT_SETTINGS = {
    reducedMotion: false, muteAudio: false, muteVibration: true,
    themeChoice: "calmo", textScale: "normal",
    showText: true, readAloud: false, visualHints: true,
    commSpeak: false, voiceName: "", voiceRate: "1"
  };
  var state = {
    score: Number(load(KEYS.score, 0)) || 0,
    age: load(KEYS.age, "6-8"),
    settings: Object.assign({}, DEFAULT_SETTINGS, load(KEYS.settings, {})),
    filter: "todas",
    game: null
  };
  var LEVEL_NAMES = ["Explorador", "Descobridor", "Investigador", "Criador", "Mestre"];
  var POINTS_PER_LEVEL = 50;
  var AGE_LEVEL = { "3-5": 1, "6-8": 2, "9-12": 3, "13-17": 3, "adulto": 3 };

  /* ---------- Utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function speak(text, force) {
    if ((!state.settings.readAloud && !force) || state.settings.muteAudio) return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.rate = parseFloat(state.settings.voiceRate) || 1;
      var vs = window.speechSynthesis.getVoices();
      for (var i = 0; i < vs.length; i++) { if (vs[i].name === state.settings.voiceName) { u.voice = vs[i]; u.lang = vs[i].lang; } }
      window.speechSynthesis.speak(u);
    } catch (e) { /* voz indisponível */ }
  }
  function vibrate() {
    if (state.settings.muteVibration) return;
    if (navigator.vibrate) navigator.vibrate(60);
  }
  function levelInfo() {
    var n = Math.floor(state.score / POINTS_PER_LEVEL) + 1;
    var name = LEVEL_NAMES[Math.min(n - 1, LEVEL_NAMES.length - 1)];
    return { n: n, name: name, pct: (state.score % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100 };
  }

  /* ---------- Conteúdo ---------- */
  function mc(level, prompt, visual, options, answer, hint) {
    return { level: level, prompt: prompt, visual: visual, options: options, answer: answer, hint: hint };
  }

  function mathQuestion(level) {
    var a, b, answer, prompt, visual = "", hint;
    if (level === 1) {
      var n = rand(1, 5);
      var emoji = shuffle(["🍎", "⭐", "🐟", "🎈", "🚗"])[0];
      visual = new Array(n + 1).join(emoji);
      prompt = "Quantos você vê?";
      answer = n;
      hint = "Toque na tela apontando para cada figura, uma de cada vez.";
    } else if (level === 2) {
      a = rand(2, 12); b = rand(1, 9);
      if (Math.random() < 0.5) {
        prompt = a + " + " + b + " = ?"; answer = a + b;
        hint = "Comece em " + a + " e conte mais " + b + ".";
      } else {
        if (b > a) { var t = a; a = b; b = t; }
        prompt = a + " − " + b + " = ?"; answer = a - b;
        hint = "Comece em " + a + " e conte para trás " + b + ".";
      }
    } else {
      a = rand(3, 9); b = rand(3, 9);
      if (Math.random() < 0.6) {
        prompt = a + " × " + b + " = ?"; answer = a * b;
        hint = "Pense em " + b + " grupos de " + a + ".";
      } else {
        prompt = (a * b) + " ÷ " + a + " = ?"; answer = b;
        hint = "Quantas vezes o " + a + " cabe em " + (a * b) + "?";
      }
    }
    var set = {}; set[answer] = true;
    var opts = [String(answer)];
    var guard = 0;
    while (opts.length < 3 && guard++ < 50) {
      var d = Math.max(0, answer + rand(-3, 3));
      if (!set[d]) { set[d] = true; opts.push(String(d)); }
    }
    while (opts.length < 3) { opts.push(String(answer + opts.length + 4)); }
    return mc(level, prompt, visual, opts, String(answer), hint);
  }

  var ACTIVITIES = [
    {
      id: "letras", category: "linguagem", icon: "📖", title: "Letras e palavras",
      desc: "Descubra letras, sílabas e palavras.", categoryLabel: "Linguagem",
      questions: [
        mc(1, "Com qual letra começa CACHORRO?", "🐶", ["C", "M", "P"], "C", "Fale devagar: CA-CHOR-RO. Qual é o primeiro som?"),
        mc(1, "Com qual letra começa BANANA?", "🍌", ["D", "B", "G"], "B", "Fale devagar: BA-NA-NA."),
        mc(1, "Com qual letra começa SOL?", "🌞", ["L", "O", "S"], "S", "Fale devagar: SSSOL."),
        mc(2, "Qual palavra está escrita certo?", "🏠", ["casa", "caza", "kasa"], "casa", "Lembre: a palavra que mora na sua rua."),
        mc(2, "Qual palavra rima com PÃO?", "🍞", ["mão", "casa", "bola"], "mão", "Rima é quando o final tem o mesmo som."),
        mc(2, "Quantas sílabas tem BORBOLETA?", "🦋", ["2", "3", "4"], "4", "Bata palmas: BOR-BO-LE-TA."),
        mc(3, "Qual é o plural de ANIMAL?", "", ["animals", "animais", "animales"], "animais", "Palavras terminadas em AL trocam o L por IS."),
        mc(3, "Qual palavra é um verbo?", "", ["correr", "azul", "mesa"], "correr", "Verbo indica uma ação."),
        mc(3, "Qual é um sinônimo de FELIZ?", "", ["triste", "alegre", "cansado"], "alegre", "Sinônimo tem significado parecido.")
      ]
    },
    {
      id: "numeros", category: "matematica", icon: "🔢", title: "Números em ação",
      desc: "Contar, somar, subtrair e multiplicar.", categoryLabel: "Matemática",
      generator: mathQuestion
    },
    {
      id: "mundo", category: "mundo", icon: "🌍", title: "Descobrindo o mundo",
      desc: "Natureza, lugares e curiosidades.", categoryLabel: "Conhecer o mundo",
      questions: [
        mc(1, "Qual animal faz “miau”?", "🐱", ["Gato", "Vaca", "Pato"], "Gato", "Ele gosta de leite e de se espreguiçar."),
        mc(1, "De que cor é o céu num dia limpo?", "☀️", ["Azul", "Vermelho", "Preto"], "Azul", "Olhe pela janela, se puder."),
        mc(1, "O que usamos quando chove?", "🌧️", ["Guarda-chuva", "Chinelo de praia", "Óculos de sol"], "Guarda-chuva", "Ele abre e protege da água."),
        mc(2, "Em qual planeta nós vivemos?", "🪐", ["Marte", "Terra", "Júpiter"], "Terra", "É o planeta com água e vida."),
        mc(2, "Qual é um transporte aéreo?", "✈️", ["Avião", "Barco", "Bicicleta"], "Avião", "Ele voa no céu."),
        mc(2, "A água vira gelo quando fica...", "🧊", ["muito quente", "muito fria", "parada"], "muito fria", "Pense no congelador."),
        mc(3, "Qual gás as plantas absorvem na fotossíntese?", "🌱", ["Gás carbônico", "Oxigênio", "Hélio"], "Gás carbônico", "Elas liberam oxigênio no final."),
        mc(3, "Qual é a capital do Brasil?", "🇧🇷", ["Rio de Janeiro", "Brasília", "São Paulo"], "Brasília", "Foi inaugurada em 1960."),
        mc(3, "Qual oceano banha o litoral do Brasil?", "🌊", ["Atlântico", "Pacífico", "Índico"], "Atlântico", "Fica a leste do país.")
      ]
    },
    {
      id: "sentimentos", category: "emocional", icon: "💛", title: "Sentimentos e amizade",
      desc: "Reconhecer emoções e cuidar dos outros.", categoryLabel: "Socioemocional",
      questions: [
        mc(1, "Como esta pessoa se sente?", "😢", ["Triste", "Feliz", "Com sono"], "Triste", "Olhe para a boca e para os olhos."),
        mc(1, "Alguém se machucou. O que você pode fazer?", "🤕", ["Ajudar ou chamar um adulto", "Rir", "Ir embora"], "Ajudar ou chamar um adulto", "Cuidar dos outros é bonito."),
        mc(1, "Qual rosto está feliz?", "", ["😊", "😠", "😴"], "😊", "Feliz tem um sorriso."),
        mc(2, "Você ficou com muita raiva. O que ajuda?", "😠", ["Respirar fundo", "Gritar", "Quebrar algo"], "Respirar fundo", "Inspire pelo nariz, solte pela boca."),
        mc(2, "Um colega está sozinho. O que fazer?", "🧒", ["Convidar para brincar", "Ignorar", "Zombar"], "Convidar para brincar", "Um convite pode mudar o dia dele."),
        mc(2, "Se eu não entendi algo, eu posso...", "❔", ["pedir ajuda", "desistir sem falar", "esconder"], "pedir ajuda", "Pedir ajuda é uma boa estratégia."),
        mc(3, "Qual atitude mostra empatia?", "", ["Ouvir com atenção", "Interromper", "Mudar de assunto"], "Ouvir com atenção", "Empatia é tentar entender o outro."),
        mc(3, "Um amigo discorda de você. Melhor atitude?", "", ["Conversar com respeito", "Parar de falar com ele", "Falar mais alto"], "Conversar com respeito", "Pense em como gostaria de ser tratado."),
        mc(3, "O que ajuda quando estamos ansiosos?", "", ["Respiração lenta e uma pausa", "Ignorar o corpo", "Acumular tarefas"], "Respiração lenta e uma pausa", "Pausas curtas ajudam a acalmar.")
      ]
    },
    {
      id: "logica", category: "logica", icon: "🧩", title: "Padrões e lógica",
      desc: "Sequências, padrões e raciocínio.", categoryLabel: "Lógica",
      questions: [
        mc(1, "O que vem depois?", "🔴🔵🔴🔵🔴", ["🔵", "🔴", "🟢"], "🔵", "Veja a ordem: vermelho, azul, vermelho, azul..."),
        mc(1, "Qual é diferente?", "🍎🍎🍌🍎", ["🍎", "🍌"], "🍌", "Procure a figura que aparece só uma vez."),
        mc(1, "O que vem depois?", "🔺🔺🟦🔺🔺🟦🔺🔺", ["🟦", "🔺", "⭐"], "🟦", "Dois triângulos e depois um quadrado."),
        mc(2, "Qual número vem depois? 2, 4, 6, ...", "", ["7", "8", "10"], "8", "Vai de 2 em 2."),
        mc(2, "Qual palavra não combina com as outras?", "", ["cão", "gato", "mesa", "vaca"], "mesa", "Três são animais."),
        mc(2, "Qual número vem depois? 5, 10, 15, ...", "", ["20", "25", "17"], "20", "Vai de 5 em 5."),
        mc(3, "Qual número vem depois? 3, 6, 12, ...", "", ["15", "18", "24"], "24", "Cada número é o dobro do anterior."),
        mc(3, "Qual número vem depois? 1, 1, 2, 3, 5, ...", "", ["7", "8", "9"], "8", "Some os dois números anteriores."),
        mc(3, "Qual número vem depois? 1, 4, 9, 16, ...", "", ["20", "24", "25"], "25", "São quadrados: 1×1, 2×2, 3×3, 4×4...")
      ]
    }
  ];

  function buildQuestions(activity, level) {
    if (activity.generator) {
      var out = [];
      for (var i = 0; i < 3; i++) out.push(activity.generator(level));
      return out;
    }
    var same = shuffle(activity.questions.filter(function (q) { return q.level === level; }));
    var other = shuffle(activity.questions.filter(function (q) { return q.level !== level; }));
    return same.concat(other).slice(0, 3);
  }

  /* ---------- Navegação ---------- */
  function showView(name) {
    $all(".view").forEach(function (v) { v.classList.toggle("active", v.id === "view-" + name); });
    $all(".nav-button").forEach(function (b) {
      var on = b.getAttribute("data-view") === name;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    $("welcome").hidden = name !== "inicio";
    window.scrollTo(0, 0);
  }

  /* ---------- Cartões de atividade ---------- */
  function cardHTML(a) {
    return '<button class="activity-card" data-activity="' + a.id + '">' +
      '<span class="icon" aria-hidden="true">' + a.icon + '</span>' +
      '<h3>' + a.title + '</h3><p>' + a.desc + '</p>' +
      '<span class="tag">' + a.categoryLabel + '</span></button>';
  }
  function renderActivities() {
    $("homeActivities").innerHTML = ACTIVITIES.slice(0, 4).map(cardHTML).join("");
    var list = ACTIVITIES.filter(function (a) { return state.filter === "todas" || a.category === state.filter; });
    $("allActivities").innerHTML = list.length
      ? list.map(cardHTML).join("")
      : '<p class="muted">Ainda não há atividades nesta categoria.</p>';
  }

  /* ---------- Progresso ---------- */
  function renderProgress() {
    var info = levelInfo();
    $("scoreDisplay").textContent = state.score + (state.score === 1 ? " ponto" : " pontos");
    $("progressBar").style.width = info.pct + "%";
    $("levelDisplay").textContent = "Etapa " + info.n + " · " + info.name;
    save(KEYS.score, state.score);
    save(KEYS.level, info.n);
  }

  /* ---------- Jogo ---------- */
  function startActivity(id) {
    var activity = ACTIVITIES.filter(function (a) { return a.id === id; })[0];
    if (!activity) return;
    var level = AGE_LEVEL[state.age] || 2;
    state.game = {
      activity: activity,
      questions: buildQuestions(activity, level),
      index: 0, errors: 0, earned: 0, answered: false, hintUsed: false
    };
    $("gameCategory").textContent = activity.categoryLabel;
    $("gameTitle").textContent = activity.title;
    showView("jogo");
    renderQuestion();
  }

  function renderQuestion() {
    var g = state.game;
    var q = g.questions[g.index];
    g.answered = false; g.errors = 0; g.hintUsed = false;
    $("questionCount").textContent = "Pergunta " + (g.index + 1) + " de " + g.questions.length;
    $("gameProgress").textContent = "Etapa " + levelInfo().n;
    $("gameInstruction").textContent = "Leia a pergunta e escolha uma resposta.";
    $("feedback").textContent = ""; $("feedback").className = "feedback";
    $("nextButton").disabled = true;
    $("nextButton").textContent = g.index === g.questions.length - 1 ? "Terminar" : "Continuar";
    $("hintButton").disabled = false;
    $("hintButton").style.display = "";

    var opts = shuffle(q.options);
    var html = '<div class="question-prompt">' + q.prompt + '</div>';
    if (q.visual) html += '<div class="question-visual" aria-hidden="true">' + q.visual + '</div>';
    html += '<div class="options" role="group" aria-label="Respostas">' +
      opts.map(function (o) { return '<button class="option-button" data-answer="' + o.replace(/"/g, "&quot;") + '">' + o + '</button>'; }).join("") +
      '</div><div id="hintBox"></div>';
    $("questionArea").innerHTML = html;
    speak(q.prompt);
  }

  function answer(btn) {
    var g = state.game;
    if (!g || g.answered) return;
    var q = g.questions[g.index];
    var chosen = btn.getAttribute("data-answer");
    var fb = $("feedback");
    if (chosen === q.answer) {
      g.answered = true;
      var pts = g.errors === 0 ? 10 : 5;
      g.earned += pts;
      state.score += pts;
      renderProgress();
      btn.classList.add("correct");
      $all(".option-button").forEach(function (b) { b.disabled = true; });
      fb.textContent = "Muito bem! Você acertou. +" + pts + " pontos";
      fb.className = "feedback good";
      $("nextButton").disabled = false;
      $("hintButton").disabled = true;
      vibrate();
      speak("Muito bem!");
      $("nextButton").focus();
    } else {
      g.errors++;
      btn.classList.add("tried");
      btn.disabled = true;
      fb.textContent = "Quase! Tente outra resposta. Sem pressa.";
      fb.className = "feedback try";
      speak("Tente outra resposta.");
    }
  }

  function showHint() {
    var g = state.game;
    if (!g) return;
    var q = g.questions[g.index];
    var box = $("hintBox");
    box.innerHTML = '<div class="hint-box">💡 ' + q.hint + '</div>';
    if (!state.settings.visualHints) {
      // sem dicas visuais: a dica aparece só como texto simples, sem destaque
      box.firstChild.style.background = "transparent";
      box.firstChild.style.padding = "0";
    }
    speak(q.hint);
  }

  function nextQuestion() {
    var g = state.game;
    if (!g || !g.answered) return;
    if (g.index < g.questions.length - 1) {
      g.index++;
      renderQuestion();
    } else {
      endActivity();
    }
  }

  function endActivity() {
    var g = state.game;
    $("questionCount").textContent = "Atividade concluída";
    $("feedback").textContent = ""; $("feedback").className = "feedback";
    $("questionArea").innerHTML =
      '<div class="end-screen"><div class="big" aria-hidden="true">🎉</div>' +
      '<h3>Você terminou “' + g.activity.title + '”!</h3>' +
      '<p>Você ganhou ' + g.earned + ' pontos nesta atividade.</p>' +
      '<button class="secondary-button" data-restart="' + g.activity.id + '">Repetir atividade</button> ' +
      '<button class="primary-button" data-go="atividades">Escolher outra</button></div>';
    $("nextButton").disabled = true;
    $("hintButton").style.display = "none";
    markRoutine(1);
    speak("Atividade concluída. Parabéns!");
  }

  /* ---------- Rotina ---------- */
  function routineBoxes() { return $all("#routineList input[type=checkbox]"); }
  function loadRoutine() {
    var saved = load(KEYS.routine, []);
    routineBoxes().forEach(function (box, i) { box.checked = !!saved[i]; });
  }
  function saveRoutine() { save(KEYS.routine, routineBoxes().map(function (b) { return b.checked; })); }
  function markRoutine(i) {
    var box = routineBoxes()[i];
    if (box) { box.checked = true; saveRoutine(); }
  }

  var paused = false;
  function togglePause() {
    paused = !paused;
    var btn = $("pauseButton"), msg = $("pauseMessage");
    if (paused) {
      btn.textContent = "Voltar da pausa";
      msg.textContent = "Pausa iniciada. Respire fundo, sem pressa. Quando quiser, volte aqui.";
      markRoutine(2);
      speak("Pausa iniciada. Respire fundo.");
    } else {
      btn.textContent = "Iniciar pausa tranquila";
      msg.textContent = "Bem-vindo de volta! Escolha o próximo passo quando quiser.";
      speak("Bem-vindo de volta.");
    }
  }

  /* ---------- Configurações ---------- */
  function applySettings() {
    var s = state.settings, root = document.documentElement;
    root.setAttribute("data-theme", s.themeChoice);
    root.setAttribute("data-text", s.textScale);
    document.body.classList.toggle("reduce-motion", !!s.reducedMotion);
    document.body.classList.toggle("hide-instructions", !s.showText);
    if (s.muteAudio && "speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
      var el = $(k);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!s[k]; else el.value = s[k];
    });
  }
  function bindSettings() {
    Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
      var el = $(k);
      if (!el) return;
      el.addEventListener("change", function () {
        state.settings[k] = el.type === "checkbox" ? el.checked : el.value;
        save(KEYS.settings, state.settings);
        applySettings();
        $("settingsSaved").textContent = "Preferência salva neste dispositivo.";
      });
    });
    $("resetSettings").addEventListener("click", function () {
      state.settings = Object.assign({}, DEFAULT_SETTINGS);
      save(KEYS.settings, state.settings);
      applySettings();
      $("settingsSaved").textContent = "Configurações padrão restauradas.";
    });
  }

  /* ---------- Eventos ---------- */
  function bindEvents() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      if (t.hasAttribute("data-view")) return showView(t.getAttribute("data-view"));
      if (t.hasAttribute("data-go")) return showView(t.getAttribute("data-go"));
      if (t.hasAttribute("data-activity")) return startActivity(t.getAttribute("data-activity"));
      if (t.hasAttribute("data-restart")) return startActivity(t.getAttribute("data-restart"));
      if (t.hasAttribute("data-answer")) return answer(t);
      if (t.hasAttribute("data-filter")) {
        state.filter = t.getAttribute("data-filter");
        $all(".filter-chip").forEach(function (c) {
          c.classList.toggle("selected", c === t);
          c.setAttribute("aria-pressed", c === t ? "true" : "false");
        });
        return renderActivities();
      }
      if (t.hasAttribute("data-message")) {
        var m = t.getAttribute("data-message");
        $("communicationMessage").textContent = m;
        speak(m, !!state.settings.commSpeak);
        return;
      }
    });
    $("hintButton").addEventListener("click", showHint);
    $("nextButton").addEventListener("click", nextQuestion);
    $("pauseButton").addEventListener("click", togglePause);
    $("resetRoutine").addEventListener("click", function () {
      routineBoxes().forEach(function (b) { b.checked = false; });
      saveRoutine();
    });
    $("routineList").addEventListener("change", saveRoutine);
    $("ageGroup").addEventListener("change", function () {
      state.age = $("ageGroup").value;
      save(KEYS.age, state.age);
    });
    bindSettings();
  }

  /* ---------- Quadro de comunicação personalizável ---------- */
  var DEFAULT_COMM = [
    { icon: "🙋", label: "Preciso de ajuda", message: "Quero ajuda" },
    { icon: "⏸", label: "Quero uma pausa", message: "Quero uma pausa" },
    { icon: "❔", label: "Não entendi", message: "Não entendi" },
    { icon: "↻", label: "Repetir", message: "Quero repetir" },
    { icon: "✓", label: "Terminei", message: "Terminei" },
    { icon: "■", label: "Quero parar", message: "Quero parar" }
  ];
  var MAX_COMM = 24, comm = [], commEdit = false;
  function h(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function saveComm() { save(KEYS.comm, comm); }
  function renderCommGrid() {
    $("communicationGrid").innerHTML = comm.map(function (c) {
      var m = c.message || c.label;
      return '<button type="button" data-message="' + h(m) + '" aria-label="' + h(m) + '">' +
        (c.photo ? '<img class="comm-img" src="' + c.photo + '" alt="">' : '<span aria-hidden="true">' + h(c.icon || "•") + '</span>') +
        h(c.label) + '</button>';
    }).join("");
  }
  function renderCommEdit() {
    var box = $("commEdit");
    box.hidden = !commEdit;
    $("commToggle").textContent = commEdit ? "Concluir edição" : "Personalizar quadro";
    if (!commEdit) return;
    box.innerHTML = '<p class="muted">Mude o texto, o símbolo ou coloque uma foto. As mudanças ficam salvas neste aparelho.</p>' +
      comm.map(function (c, i) {
        return '<div class="comm-row"><strong>Botão ' + (i + 1) + '</strong>' +
          '<label>Símbolo (emoji)<input data-i="' + i + '" data-f="icon" maxlength="4" value="' + h(c.icon) + '"></label>' +
          '<label>Texto do botão<input data-i="' + i + '" data-f="label" value="' + h(c.label) + '"></label>' +
          '<label>Mensagem mostrada na tela<input data-i="' + i + '" data-f="message" value="' + h(c.message) + '"></label>' +
          '<label>Foto (opcional)<input type="file" accept="image/*" data-photo="' + i + '"></label>' +
          (c.photo ? '<button type="button" class="secondary-button" data-nophoto="' + i + '">Tirar a foto</button> ' : '') +
          '<button type="button" class="secondary-button" data-del="' + i + '">Remover este botão</button></div>';
      }).join("") +
      '<div class="comm-actions"><button type="button" class="primary-button" id="commAdd">Adicionar botão</button> ' +
      '<button type="button" class="secondary-button" id="commRestore">Voltar ao quadro original</button></div>';
  }
  function smallPhoto(file, cb) {
    var r = new FileReader();
    r.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var sc = Math.min(1, 160 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  }
  function fillVoices() {
    var s = $("voiceName");
    if (!s) return;
    var vs = ("speechSynthesis" in window) ? window.speechSynthesis.getVoices() : [];
    var pt = vs.filter(function (v) { return /^pt/i.test(v.lang); });
    var list = pt.length ? pt : vs;
    s.innerHTML = '<option value="">Voz padrão do aparelho</option>' + list.map(function (v) {
      return '<option value="' + h(v.name) + '">' + h(v.name) + ' (' + h(v.lang) + ')</option>';
    }).join("");
    s.value = state.settings.voiceName || "";
  }
  function initComm() {
    var saved = load(KEYS.comm, null);
    comm = (Array.isArray(saved) && saved.length) ? saved : JSON.parse(JSON.stringify(DEFAULT_COMM));
    $("communicationGrid").insertAdjacentHTML("afterend",
      '<div class="comm-tools"><button type="button" class="secondary-button" id="commToggle">Personalizar quadro</button>' +
      '<label class="switch-row"><span>Falar a mensagem em voz alta</span><input type="checkbox" id="commSpeak"></label>' +
      '<label for="voiceName">Voz</label><select id="voiceName"></select>' +
      '<label for="voiceRate">Velocidade da voz</label><select id="voiceRate"><option value="0.8">Devagar</option><option value="1">Normal</option><option value="1.2">Rápida</option></select>' +
      '<button type="button" class="secondary-button" id="commTest">Testar voz</button></div>' +
      '<div id="commEdit" class="comm-edit" hidden></div>');
    renderCommGrid(); renderCommEdit(); fillVoices();
    if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = fillVoices;
    $("commToggle").addEventListener("click", function () { commEdit = !commEdit; renderCommEdit(); });
    $("commTest").addEventListener("click", function () { speak("Olá! Esta é a minha voz.", true); });
    var box = $("commEdit");
    box.addEventListener("change", function (e) {
      var t = e.target, i;
      if (t.hasAttribute("data-f")) {
        i = +t.getAttribute("data-i");
        comm[i][t.getAttribute("data-f")] = t.value.trim();
        saveComm(); renderCommGrid();
      } else if (t.hasAttribute("data-photo") && t.files[0]) {
        i = +t.getAttribute("data-photo");
        smallPhoto(t.files[0], function (src) { comm[i].photo = src; saveComm(); renderCommGrid(); renderCommEdit(); });
      }
    });
    box.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      if (t.hasAttribute("data-del")) {
        if (comm.length <= 1) return alert("O quadro precisa ter pelo menos um botão.");
        if (confirm("Remover este botão?")) { comm.splice(+t.getAttribute("data-del"), 1); saveComm(); renderCommGrid(); renderCommEdit(); }
      } else if (t.hasAttribute("data-nophoto")) {
        delete comm[+t.getAttribute("data-nophoto")].photo; saveComm(); renderCommGrid(); renderCommEdit();
      } else if (t.id === "commAdd") {
        if (comm.length >= MAX_COMM) return alert("O quadro já tem " + MAX_COMM + " botões.");
        comm.push({ icon: "💬", label: "Novo botão", message: "Novo botão" }); saveComm(); renderCommGrid(); renderCommEdit();
      } else if (t.id === "commRestore") {
        if (confirm("Voltar ao quadro original? Seus botões personalizados serão apagados.")) {
          comm = JSON.parse(JSON.stringify(DEFAULT_COMM)); saveComm(); renderCommGrid(); renderCommEdit();
        }
      }
    });
  }

  /* ---------- Instalar como app (PWA) ---------- */
  function initPWA() {
    var secure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if ("serviceWorker" in navigator && secure) navigator.serviceWorker.register("sw.js").catch(function () {});
    if (!document.querySelector('link[rel="manifest"]')) {
      var l = document.createElement("link"); l.rel = "manifest"; l.href = "manifest.webmanifest"; document.head.appendChild(l);
    }
    var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone;
    if (standalone) return;
    var card = document.createElement("section");
    card.className = "support-strip install-card";
    card.innerHTML = '<div class="support-icon" aria-hidden="true">📲</div><div><strong>Use como aplicativo no celular</strong>' +
      '<p>Fica na tela inicial e abre mais rápido, mesmo com internet fraca.</p>' +
      '<details><summary>Como instalar, passo a passo</summary><p><strong>Android (Chrome):</strong> toque nos três pontinhos no canto de cima, depois em “Instalar app” ou “Adicionar à tela inicial”.</p>' +
      '<p><strong>iPhone (Safari):</strong> toque no botão de compartilhar (quadrado com seta), role a lista e toque em “Adicionar à Tela de Início”.</p></details></div>' +
      '<button type="button" class="primary-button" id="installBtn" hidden>Instalar agora</button>';
    $("view-inicio").appendChild(card);
    var deferred = null;
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; $("installBtn").hidden = false; });
    $("installBtn").addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; $("installBtn").hidden = true; });
    });
  }

  /* ---------- Início ---------- */
  function init() {
    $("ageGroup").value = AGE_LEVEL[state.age] ? state.age : "6-8";
    state.age = $("ageGroup").value;
    initComm();
    applySettings();
    renderActivities();
    renderProgress();
    loadRoutine();
    bindEvents();
    showView("inicio");
    initPWA();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
