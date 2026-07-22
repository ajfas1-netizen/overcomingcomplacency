/* ============================================================
   From Drift to Drive — Companion App logic (SPA)
   Screens are hash-routed views (#/home, #/check, #/steps/3, …).
   All user data is stored locally in this browser (localStorage).
   ============================================================ */

(function () {
  "use strict";
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("dtd_" + key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem("dtd_" + key, JSON.stringify(val)); } catch (e) { /* private mode */ }
    },
    wipe() {
      try {
        Object.keys(localStorage).filter((k) => k.indexOf("dtd_") === 0)
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) { /* ignore */ }
    }
  };

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function flash(btn, msg) {
    let note = btn.parentElement.querySelector(".tool-flash");
    if (!note) {
      note = document.createElement("span");
      note.className = "tool-flash";
      btn.insertAdjacentElement("afterend", note);
    }
    note.textContent = msg || "Saved ✓";
    clearTimeout(note._t);
    note._t = setTimeout(() => { note.textContent = ""; }, 2500);
  }

  /* ============================================================
     ROUTER — click-in screens, back-button friendly
     ============================================================ */
  const VIEWS = ["home", "check", "steps", "challenge", "garage", "connect"];
  let currentView = null;

  function parseHash() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    return { view: VIEWS.includes(parts[0]) ? parts[0] : "home", arg: parts[1] };
  }

  function showView(name, arg) {
    if (!VIEWS.includes(name)) name = "home";
    VIEWS.forEach((v) => {
      const el = $("#view-" + v);
      const active = v === name;
      if (active && el.hidden) {
        el.hidden = false;
        el.classList.remove("view-in");
        void el.offsetWidth; /* restart animation */
        el.classList.add("view-in");
      } else if (!active) {
        el.hidden = true;
      }
    });
    $$("[data-view-link]").forEach((a) =>
      a.classList.toggle("active", a.dataset.viewLink === name));
    window.scrollTo({ top: 0, behavior: "auto" });
    currentView = name;
    // per-view refresh hooks
    if (name === "garage") renderGarage();
    if (name === "home") renderWelcome();
    if (name === "challenge") renderChallenge();
    if (name === "steps") {
      const n = Number(arg);
      renderStep(n >= 1 && n <= 7 ? n - 1 : activeStep);
    }
  }

  window.addEventListener("hashchange", () => {
    const { view, arg } = parseHash();
    showView(view, arg);
  });

  /* ---------- Rotating quotes ---------- */
  let quoteIdx = Math.floor(Math.random() * OC.quotes.length);
  function renderQuote() {
    const q = OC.quotes[quoteIdx % OC.quotes.length];
    $("#quoteText").textContent = q.text;
    $("#quoteBy").textContent = "— " + q.by;
  }
  $("#quoteNext").addEventListener("click", () => { quoteIdx++; renderQuote(); });
  renderQuote();

  /* ---------- Home welcome (returning-driver strip) ---------- */
  function renderWelcome() {
    const el = $("#homeWelcome");
    const quiz = store.get("quizResult", null);
    const done = store.get("challengeDone", []);
    const lap = store.get("lap", 1);
    const stepsDone = store.get("stepsDone", []);
    if (!quiz && !done.length && !stepsDone.length) { el.innerHTML = ""; return; }
    const bits = [];
    if (quiz) bits.push("Drift score <strong>" + quiz.score + "/36</strong> (" + esc(quiz.label) + ")");
    if (stepsDone.length) bits.push("Lap <strong>" + lap + "</strong> · <strong>" + stepsDone.length + "/7</strong> steps");
    if (done.length) bits.push("<strong>" + done.length + "/30</strong> challenge days");
    el.innerHTML =
      '<div class="welcome-strip"><span>🏁 Welcome back, driver — ' + bits.join(" · ") + ".</span>" +
      '<a class="btn btn-gold btn-sm" href="#/garage">Open My Garage</a></div>';
  }

  /* ============================================================
     DRIFT CHECK
     ============================================================ */
  const quiz = OC.quiz;
  let qIdx = 0, answers = [];
  $("#quizIntro").textContent = quiz.intro;

  function showLastResult() {
    const last = store.get("quizResult", null);
    if (last) {
      $("#quizLastResult").textContent =
        "Last check: " + last.score + "/36 — “" + last.label + "” on " + last.date + ".";
    }
  }
  showLastResult();

  function renderQuestion() {
    const q = quiz.questions[qIdx];
    $("#quizCount").textContent = "Question " + (qIdx + 1) + " of " + quiz.questions.length;
    $("#quizQuestion").textContent = q.text;
    $("#quizProgressFill").style.width = ((qIdx / quiz.questions.length) * 100) + "%";
    const opts = q.type === "recency" ? quiz.recencyOptions : quiz.agreeOptions;
    $("#quizOptions").innerHTML = opts.map((o, i) =>
      '<button type="button" data-score="' + i + '">' + esc(o) + "</button>").join("");
  }

  $("#quizBegin").addEventListener("click", () => {
    qIdx = 0; answers = [];
    $("#quizStart").classList.add("hidden");
    $("#quizResult").classList.add("hidden");
    $("#quizQ").classList.remove("hidden");
    renderQuestion();
  });

  $("#quizOptions").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-score]");
    if (!btn) return;
    answers.push(Number(btn.dataset.score));
    qIdx++;
    if (qIdx < quiz.questions.length) renderQuestion();
    else showResult();
  });

  function zoneFor(score) {
    return quiz.zones.find((z) => score <= z.max) || quiz.zones[quiz.zones.length - 1];
  }

  function showResult() {
    const score = answers.reduce((a, b) => a + b, 0);
    const zone = zoneFor(score);
    $("#quizQ").classList.add("hidden");
    $("#quizResult").classList.remove("hidden");
    $("#gaugeScore").textContent = score;
    $("#resultLabel").textContent = zone.icon + " " + zone.label;
    $("#resultHeadline").textContent = zone.headline;
    $("#resultMessage").textContent = zone.message;
    $("#resultMoves").innerHTML = zone.moves.map((m) => "<li>" + esc(m) + "</li>").join("");
    requestAnimationFrame(() => {
      $("#gaugePointer").style.left = Math.max(2, Math.min(98, (score / 36) * 100)) + "%";
    });
    const prev = store.get("quizResult", {});
    const result = {
      score, label: zone.label, date: new Date().toLocaleDateString(),
      history: (prev.history || []).concat([{ score, date: new Date().toLocaleDateString() }]).slice(-12)
    };
    store.set("quizResult", result);
    showLastResult();
  }

  $("#quizRetake").addEventListener("click", () => {
    $("#quizResult").classList.add("hidden");
    $("#quizStart").classList.remove("hidden");
  });

  /* ============================================================
     FRAMEWORK — mile markers, step tools, lap tracking
     ============================================================ */
  const mileTrack = $("#mileTrack");
  const stepPanel = $("#stepPanel");
  let activeStep = 0;

  function renderLapBadge() {
    const lap = store.get("lap", 1);
    const done = store.get("stepsDone", []);
    $("#lapBadge").innerHTML =
      '<span class="lap-num">Lap ' + lap + "</span><span class=\"lap-count\">" + done.length + " / 7 steps</span>";
  }

  function renderMileTrack() {
    const done = store.get("stepsDone", []);
    mileTrack.innerHTML = OC.steps.map((s, i) =>
      '<button class="mile-marker' + (done.includes(s.num) ? " done" : "") + '" role="tab" data-i="' + i + '" aria-selected="false">' +
      '<span class="mm-num">' + (done.includes(s.num) ? "✓" : s.num) + '</span>' +
      '<span class="mm-name">' + esc(s.title) + "</span></button>").join("");
    $$(".mile-marker", mileTrack).forEach((m, j) => {
      m.classList.toggle("active", j === activeStep);
      m.setAttribute("aria-selected", String(j === activeStep));
    });
  }

  mileTrack.addEventListener("click", (e) => {
    const m = e.target.closest(".mile-marker");
    if (m) location.hash = "#/steps/" + (Number(m.dataset.i) + 1);
  });

  const toolRenderers = {
    clarity: toolClarity, gathering: toolGathering, filtering: toolFiltering,
    guidance: toolGuidance, relationships: toolRelationships,
    action: toolAction, evaluate: toolEvaluate
  };

  function renderStep(i) {
    activeStep = i;
    const s = OC.steps[i];
    const done = store.get("stepsDone", []);
    const isDone = done.includes(s.num);
    renderMileTrack();
    renderLapBadge();
    stepPanel.innerHTML =
      '<div class="step-head"><span class="step-no">0' + s.num + '</span><h3>' + esc(s.title) + "</h3>" +
      '<button class="step-done-btn' + (isDone ? " is-done" : "") + '" id="stepDoneBtn" type="button">' +
      (isDone ? "✓ Step complete" : "Mark step complete") + "</button></div>" +
      '<p class="step-tagline">“' + esc(s.tagline) + '”</p>' +
      '<p class="step-summary">' + esc(s.summary) + "</p>" +
      '<div class="concept-grid">' + s.concepts.map((c) =>
        '<div class="concept-card"><h4>' + esc(c.name) + "</h4><p>" + esc(c.desc) + "</p></div>").join("") + "</div>" +
      '<div class="step-trap"><span aria-hidden="true">⚠️</span><span><strong>Where people run into the ditch:</strong> ' + esc(s.trap) + "</span></div>" +
      '<blockquote class="step-quote">“' + esc(s.quote.text) + '”<cite>— ' + esc(s.quote.by) + "</cite></blockquote>" +
      '<div class="tool" id="stepTool"><h4>🔧 ' + esc(s.toolTitle) + "</h4><p>" + esc(s.toolIntro) + '</p><div id="toolBody"></div></div>' +
      '<div class="step-nav">' +
      (i > 0 ? '<a class="btn btn-ghost" href="#/steps/' + i + '">← Step ' + i + ": " + esc(OC.steps[i - 1].title) + "</a>" : "<span></span>") +
      (i < 6 ? '<a class="btn btn-gold" href="#/steps/' + (i + 2) + '">Step ' + (i + 2) + ": " + esc(OC.steps[i + 1].title) + " →</a>"
             : '<a class="btn btn-gold" href="#/garage">Finish the lap in My Garage →</a>') +
      "</div>";
    $("#stepDoneBtn").addEventListener("click", () => toggleStepDone(s.num));
    toolRenderers[s.id]($("#toolBody"));
  }

  function toggleStepDone(num) {
    let done = store.get("stepsDone", []);
    done = done.includes(num) ? done.filter((n) => n !== num) : done.concat([num]);
    if (done.length === 7) {
      // Lap complete — the framework runs on a loop
      const lap = store.get("lap", 1);
      store.set("lap", lap + 1);
      store.set("stepsDone", []);
      renderStep(activeStep);
      stepPanel.insertAdjacentHTML("afterbegin",
        '<div class="lap-complete">🏁 <strong>Lap ' + lap + " complete!</strong> All seven steps run on a loop — " +
        "retake the Drift Check, sharpen your clarity, and drive lap " + (lap + 1) + ".</div>");
      return;
    }
    store.set("stepsDone", done);
    renderStep(activeStep);
  }

  /* ----- Tool 1: I-Exam Chart ----- */
  function toolClarity(el) {
    const saved = store.get("iexam", { vision: "", rows: ["", "", "", "", ""] });
    el.innerHTML =
      '<label for="ixVision">The big letter — your vision (short & specific)</label>' +
      '<input type="text" id="ixVision" maxlength="60" placeholder="e.g. LAUNCH MY COACHING BUSINESS" value="' + esc(saved.vision) + '" />' +
      saved.rows.map((r, i) =>
        '<label for="ixRow' + i + '">Line ' + (i + 1) + ' — “I will…”</label>' +
        '<input type="text" class="ix-row" id="ixRow' + i + '" placeholder="I will block 5 hours a week to build the offer" value="' + esc(r) + '" />'
      ).join("") +
      '<button class="btn btn-gold" id="ixSave" type="button">Save my chart</button>' +
      '<div class="eyechart" id="ixPreview" aria-live="polite"></div>';

    function preview() {
      const vision = $("#ixVision", el).value.trim();
      const rows = $$(".ix-row", el).map((r) => r.value.trim()).filter(Boolean);
      $("#ixPreview", el).innerHTML =
        '<div class="ec-vision">' + esc(vision || "YOUR VISION HERE") + "</div>" +
        rows.map((r, i) => {
          const size = Math.max(0.82, 1.35 - i * 0.13);
          return '<p class="ec-row" style="font-size:' + size + 'rem">' + esc(r) + "</p>";
        }).join("");
    }
    el.addEventListener("input", preview);
    $("#ixSave", el).addEventListener("click", (e) => {
      store.set("iexam", {
        vision: $("#ixVision", el).value.trim(),
        rows: $$(".ix-row", el).map((r) => r.value)
      });
      flash(e.target, "Chart saved ✓ — 20/20 vision");
    });
    preview();
  }

  /* ----- Tool 2: BVACC Tracker ----- */
  function toolGathering(el) {
    el.innerHTML =
      '<div class="bvacc-add">' +
      '<div><label for="bvTitle">Resource</label><input type="text" id="bvTitle" placeholder="Think and Grow Rich" /></div>' +
      '<div><label for="bvType">Type</label><select id="bvType"><option>Book</option><option>Video</option><option>Audio</option><option>Coaching</option><option>Course</option></select></div>' +
      '<button class="btn btn-gold" id="bvAdd" type="button">Gather it</button>' +
      "</div>" +
      '<div class="bvacc-progress"><div class="bvacc-bar"><div class="bvacc-bar-fill" id="bvFill"></div></div><span class="bvacc-count" id="bvCount"></span></div>' +
      '<ul class="bvacc-list" id="bvList"></ul>';

    function render() {
      const items = store.get("bvacc", []);
      $("#bvList", el).innerHTML = items.map((it, i) =>
        '<li><span class="bvacc-type">' + esc(it.type) + "</span><span>" + esc(it.title) + "</span>" +
        '<button class="bvacc-del" data-i="' + i + '" aria-label="Remove">✕</button></li>').join("");
      $("#bvFill", el).style.width = Math.min(100, (items.length / 10) * 100) + "%";
      $("#bvCount", el).textContent = items.length + " / 10 gathered" +
        (items.length >= 10 ? " — enough! Move to Filtering →" : "");
    }
    $("#bvAdd", el).addEventListener("click", (e) => {
      const title = $("#bvTitle", el).value.trim();
      if (!title) return flash(e.target, "Name the resource first");
      const items = store.get("bvacc", []);
      items.push({ title, type: $("#bvType", el).value });
      store.set("bvacc", items);
      $("#bvTitle", el).value = "";
      render();
      flash(e.target, items.length >= 10 ? "That's 10 — stop gathering!" : "Gathered ✓");
    });
    $("#bvList", el).addEventListener("click", (e) => {
      const d = e.target.closest(".bvacc-del");
      if (!d) return;
      const items = store.get("bvacc", []);
      items.splice(Number(d.dataset.i), 1);
      store.set("bvacc", items);
      render();
    });
    render();
  }

  /* ----- Tool 3: Today's Index Card ----- */
  const CARD_QS = [
    "What do I need to read today?",
    "What do I need to listen to today?",
    "Who do I need to call today?",
    "What do I need to do today?",
    "What am I looking for today?"
  ];
  function toolFiltering(el) {
    const today = new Date().toDateString();
    const cards = store.get("indexcards", []);
    const todays = cards.find((c) => c.date === today) || { answers: ["", "", "", "", ""] };
    el.innerHTML =
      '<div class="indexcard">' +
      CARD_QS.map((q, i) =>
        '<label for="icQ' + i + '">' + (i + 1) + ". " + esc(q) + "</label>" +
        '<input type="text" id="icQ' + i + '" value="' + esc(todays.answers[i]) + '" />').join("") +
      "</div>" +
      '<button class="btn btn-gold" id="icSave" type="button">Save today’s card</button>' +
      '<p class="card-history" id="icHistory"></p>';

    function history() {
      const n = store.get("indexcards", []).length;
      $("#icHistory", el).textContent = n
        ? "🗂 " + n + " card" + (n === 1 ? "" : "s") + " in your stack. One card a day makes the priorities the priorities."
        : "Your card stack is empty — write today's card.";
    }
    $("#icSave", el).addEventListener("click", (e) => {
      const answers = CARD_QS.map((_, i) => $("#icQ" + i, el).value.trim());
      const all = store.get("indexcards", []).filter((c) => c.date !== today);
      all.push({ date: today, answers });
      store.set("indexcards", all.slice(-60));
      flash(e.target, "Card saved ✓ — now live it");
      history();
    });
    history();
  }

  /* ----- Tool 4: Mentor Vetting Checklist ----- */
  function toolGuidance(el) {
    const checks = [
      "I have clarity on 3–5 specific things I want to learn from them",
      "They are known for exactly what I want to learn — not an adjacent field",
      "They communicate in a way that resonates with how I learn",
      "They share my values — success built without wrecking what matters",
      "They have the actual results I want (true fruit, not hype)"
    ];
    el.innerHTML =
      '<label for="gdName">Potential mentor / trail angel</label>' +
      '<input type="text" id="gdName" placeholder="Name" />' +
      '<div class="checklist">' + checks.map((c, i) =>
        '<label><input type="checkbox" class="gd-check" id="gdC' + i + '" /> ' + esc(c) + "</label>").join("") + "</div>" +
      '<div class="verdict warn" id="gdVerdict">Check the boxes that are true — then read your verdict.</div>' +
      '<button class="btn btn-gold" id="gdSave" type="button">Save this vetting</button>';

    function verdict() {
      const n = $$(".gd-check", el).filter((c) => c.checked).length;
      const v = $("#gdVerdict", el);
      if (n === 5) { v.className = "verdict good"; v.textContent = "🟢 Green light — pursue guidance. Lead by seeking to serve; be ready to pay to play."; }
      else if (n >= 3) { v.className = "verdict warn"; v.textContent = "🟡 Promising — " + n + "/5. Dig deeper on the unchecked boxes before investing your time or money."; }
      else { v.className = "verdict bad"; v.textContent = "🔴 " + n + "/5 — wrong trail angel for this climb. Mentors mold maturity; keep looking."; }
    }
    el.addEventListener("change", verdict);
    $("#gdSave", el).addEventListener("click", (e) => {
      const name = $("#gdName", el).value.trim();
      if (!name) return flash(e.target, "Add their name first");
      const list = store.get("mentors", []);
      list.push({ name, checks: $$(".gd-check", el).map((c) => c.checked), date: new Date().toDateString() });
      store.set("mentors", list.slice(-20));
      flash(e.target, "Saved ✓ (" + list.length + " vetted)");
    });
    verdict();
  }

  /* ----- Tool 5: Right-Rooms Audit ----- */
  function toolRelationships(el) {
    const marks = [
      "Bigger windows — people here see further than I currently can",
      "Right encouragement — they push me toward my potential, not just 'nice job'",
      "Collaborative — generosity with insight is the culture, not competition",
      "True cohort — they understand my specific goal and are headed the same way"
    ];
    el.innerHTML =
      '<label for="rrName">The room I spend the most time in</label>' +
      '<input type="text" id="rrName" placeholder="e.g. my Tuesday networking group" />' +
      '<div class="checklist">' + marks.map((m, i) =>
        '<label><input type="checkbox" class="rr-check" id="rrC' + i + '" /> ' + esc(m) + "</label>").join("") + "</div>" +
      '<div class="verdict warn" id="rrVerdict">Check what’s true of this room.</div>' +
      '<button class="btn btn-gold" id="rrSave" type="button">Save this audit</button>';

    function verdict() {
      const n = $$(".rr-check", el).filter((c) => c.checked).length;
      const v = $("#rrVerdict", el);
      if (n === 4) { v.className = "verdict good"; v.textContent = "🟢 Right room — now work the room: select, connect, engage. Be more interested than interesting."; }
      else if (n >= 2) { v.className = "verdict warn"; v.textContent = "🟡 " + n + "/4 — a good room, maybe not the growth room. Keep it, and add a room with bigger windows."; }
      else { v.className = "verdict bad"; v.textContent = "🔴 " + n + "/4 — you might be in the wrong room. Kind and supportive isn't the same as right. Find your peloton."; }
    }
    el.addEventListener("change", verdict);
    $("#rrSave", el).addEventListener("click", (e) => {
      const name = $("#rrName", el).value.trim();
      if (!name) return flash(e.target, "Name the room first");
      const list = store.get("rooms", []);
      list.push({ name, marks: $$(".rr-check", el).map((c) => c.checked), date: new Date().toDateString() });
      store.set("rooms", list.slice(-20));
      flash(e.target, "Audit saved ✓");
    });
    verdict();
  }

  /* ----- Tool 6: Divide-to-Multiply Calculator ----- */
  function toolAction(el) {
    const saved = store.get("calc", { goal: "", total: "", unit: "", weeks: "" });
    el.innerHTML =
      '<div class="calc-grid">' +
      '<div><label for="acGoal">The goal</label><input type="text" id="acGoal" placeholder="e.g. $4,000/month coaching income" value="' + esc(saved.goal) + '" /></div>' +
      '<div><label for="acTotal">Big number to reach</label><input type="number" id="acTotal" min="1" placeholder="4000" value="' + esc(saved.total) + '" /></div>' +
      '<div><label for="acUnit">Value of one unit (one client, one sale…)</label><input type="number" id="acUnit" min="1" placeholder="400" value="' + esc(saved.unit) + '" /></div>' +
      '<div><label for="acWeeks">Weeks to get there</label><input type="number" id="acWeeks" min="1" placeholder="12" value="' + esc(saved.weeks) + '" /></div>' +
      "</div>" +
      '<div class="calc-result" id="acResult"></div>' +
      '<label for="acNext">So today’s next easiest step is…</label>' +
      '<input type="text" id="acNext" placeholder="Call the first person on my list" value="' + esc(store.get("nextStep", "")) + '" />' +
      '<button class="btn btn-gold" id="acSave" type="button">Save my plan</button>';

    function calc() {
      const total = Number($("#acTotal", el).value), unit = Number($("#acUnit", el).value),
        weeks = Number($("#acWeeks", el).value);
      const r = $("#acResult", el);
      if (!total || !unit) {
        r.innerHTML = "<p>Enter your big number and the value of one unit. Chris's math: $4,000 ÷ $400 = <strong>10 clients</strong> → go find <strong>one</strong>.</p>";
        return;
      }
      const units = Math.ceil(total / unit);
      const perWeek = weeks ? (units / weeks) : null;
      r.innerHTML =
        '<span class="calc-big">' + units + " unit" + (units === 1 ? "" : "s") + "</span> to reach your goal" +
        (perWeek ? " — that's <strong>" + (Math.round(perWeek * 10) / 10) + " per week</strong>" : "") +
        ".<br/>Forget unit #" + units + ". Your only job today: <strong>go get unit #1</strong>.";
    }
    el.addEventListener("input", calc);
    $("#acSave", el).addEventListener("click", (e) => {
      store.set("calc", {
        goal: $("#acGoal", el).value, total: $("#acTotal", el).value,
        unit: $("#acUnit", el).value, weeks: $("#acWeeks", el).value
      });
      store.set("nextStep", $("#acNext", el).value.trim());
      flash(e.target, "Plan saved ✓ — now take the step");
    });
    calc();
  }

  /* ----- Tool 7: Four-Question Debrief ----- */
  function toolEvaluate(el) {
    const qs = ["What did I do?", "What did I learn?", "What did I like?", "What would I change or do differently?"];
    el.innerHTML =
      '<label for="evAction">The action I took (not talked about — took)</label>' +
      '<input type="text" id="evAction" placeholder="Made 5 outreach calls using my mentor’s template" />' +
      qs.map((q, i) =>
        '<label for="evQ' + i + '">' + (i + 1) + ". " + esc(q) + "</label>" +
        '<textarea id="evQ' + i + '" rows="2"></textarea>').join("") +
      '<button class="btn btn-gold" id="evSave" type="button">Log this debrief</button>' +
      '<div class="eval-entries" id="evList"></div>';

    function render() {
      const entries = store.get("debriefs", []);
      $("#evList", el).innerHTML = entries.slice().reverse().slice(0, 5).map((en) =>
        '<div class="eval-entry"><p class="eval-date">' + esc(en.date) + "</p><h5>" + esc(en.action) + "</h5>" +
        en.answers.map((a, i) => a ? "<p><strong>" + esc(qs[i].split("?")[0].replace("What ", "").replace("would I ", "")) + ":</strong> " + esc(a) + "</p>" : "").join("") +
        "</div>").join("");
    }
    $("#evSave", el).addEventListener("click", (e) => {
      const action = $("#evAction", el).value.trim();
      if (!action) return flash(e.target, "Log the action first");
      const entries = store.get("debriefs", []);
      entries.push({
        action, date: new Date().toLocaleDateString(),
        answers: qs.map((_, i) => $("#evQ" + i, el).value.trim())
      });
      store.set("debriefs", entries.slice(-40));
      $("#evAction", el).value = "";
      qs.forEach((_, i) => { $("#evQ" + i, el).value = ""; });
      flash(e.target, "Logged ✓ — evaluation leads back to action");
      render();
    });
    render();
  }

  /* ============================================================
     30-DAY DRIVE CHALLENGE (with streaks)
     ============================================================ */
  const phases = OC.challengePhases;
  const phaseFor = (day) => phases.find((p) => day >= p.days[0] && day <= p.days[1]);

  $("#phaseLegend").innerHTML = phases.map((p) =>
    '<span><span class="phase-dot" style="background:' + p.color + '"></span>' +
    esc(p.name) + " · Days " + p.days[0] + "–" + p.days[1] + "</span>").join("");

  let selectedDay = null; // which mile marker the focus card shows

  function dayKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function computeStreak() {
    const dates = store.get("challengeDates", {});
    const daySet = new Set(Object.values(dates));
    if (!daySet.size) return 0;
    let streak = 0;
    const cursor = new Date();
    // streak may start today or yesterday
    if (!daySet.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (daySet.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function firstOpenDay(done) {
    const next = OC.challenge.find((d) => !done.includes(d.day));
    return next ? next.day : 30;
  }

  function renderHighway() {
    const done = store.get("challengeDone", []);
    const current = firstOpenDay(done);
    $("#highway").innerHTML = OC.challenge.map((d) => {
      const p = phaseFor(d.day);
      const isDone = done.includes(d.day);
      const isCurrent = d.day === current && done.length < 30;
      const isSel = d.day === selectedDay;
      return '<button type="button" class="mile' +
        (isDone ? " done" : "") + (isCurrent ? " current" : "") + (isSel ? " selected" : "") +
        '" data-day="' + d.day + '" style="--phase:' + p.color + '" ' +
        'aria-label="Day ' + d.day + ": " + esc(d.title) + (isDone ? " (complete)" : "") + '">' +
        (isCurrent ? '<span class="mile-car" aria-hidden="true">🏎️</span>' : "") +
        '<span class="mile-dot">' + (isDone ? "✓" : d.day) + "</span>" +
        "</button>";
    }).join("");
    // keep the selected marker centered — scroll only the road, never the page
    const hw = $("#highway");
    const sel = $(".mile.selected", hw);
    if (sel) {
      hw.scrollTo({
        left: sel.offsetLeft - hw.clientWidth / 2 + sel.offsetWidth / 2,
        behavior: "smooth"
      });
    }
  }

  function renderFocus() {
    const done = store.get("challengeDone", []);
    const d = OC.challenge[selectedDay - 1];
    const p = phaseFor(d.day);
    const isDone = done.includes(d.day);
    $("#dayFocus").innerHTML =
      '<div class="df-side" style="--phase:' + p.color + '">' +
      '<span class="df-daynum">' + d.day + "</span><span class=\"df-of\">of 30</span>" +
      '<span class="df-phase">' + esc(p.name) + "</span></div>" +
      '<div class="df-main">' +
      "<h3>" + esc(d.title) + "</h3>" +
      '<p class="df-task">' + esc(d.task) + "</p>" +
      '<p class="df-anchor">“' + esc(d.anchor) + '”</p>' +
      '<div class="df-actions">' +
      '<button type="button" class="df-arrow" id="dfPrev"' + (d.day === 1 ? " disabled" : "") + '>‹</button>' +
      '<button type="button" class="btn ' + (isDone ? "btn-ghost df-undo" : "btn-gold") + '" id="dfComplete">' +
      (isDone ? "✓ Done — tap to undo" : "Complete day " + d.day + " & drive on") + "</button>" +
      '<button type="button" class="df-arrow" id="dfNext"' + (d.day === 30 ? " disabled" : "") + '>›</button>' +
      "</div></div>";
    $("#dfPrev").addEventListener("click", () => { selectedDay = Math.max(1, selectedDay - 1); renderChallenge(); });
    $("#dfNext").addEventListener("click", () => { selectedDay = Math.min(30, selectedDay + 1); renderChallenge(); });
    $("#dfComplete").addEventListener("click", () => {
      let doneNow = store.get("challengeDone", []);
      const dates = store.get("challengeDates", {});
      if (doneNow.includes(d.day)) {
        doneNow = doneNow.filter((x) => x !== d.day);
        delete dates[d.day];
      } else {
        doneNow = doneNow.concat([d.day]);
        dates[d.day] = dayKey(new Date());
        selectedDay = firstOpenDay(doneNow); // roll forward to the next open day
      }
      store.set("challengeDone", doneNow);
      store.set("challengeDates", dates);
      renderChallenge();
    });
  }

  function renderChallenge() {
    const done = store.get("challengeDone", []);
    if (selectedDay == null) selectedDay = firstOpenDay(done);
    const pct = Math.round((done.length / 30) * 100);
    $("#challengeBarFill").style.width = pct + "%";
    $("#challengeStats").textContent = done.length + " of 30 days complete (" + pct + "%)" +
      (done.length === 30 ? " — lap one complete! Start lap two 🏁" : "");
    const streak = computeStreak();
    $("#challengeStreak").textContent = streak >= 2
      ? "🔥 " + streak + "-day streak — be consistent every day that ends with day."
      : "Complete a day two days running to light your streak. 🔥";
    const next = OC.challenge.find((d) => !done.includes(d.day));
    const todayEl = $("#challengeToday");
    if (next) {
      todayEl.innerHTML = '<span class="ct-kicker">⛽ Up next · Day ' + next.day + "</span>" +
        "<h3>" + esc(next.title) + "</h3><p>" + esc(next.task) + "</p>";
    } else {
      todayEl.innerHTML = '<span class="ct-kicker">🏁 Lap complete</span>' +
        "<h3>All 30 days done.</h3><p>The framework runs on a loop — retake the Drift Check and start lap two.</p>";
    }
    renderHighway();
    renderFocus();
  }

  $("#highway").addEventListener("click", (e) => {
    const m = e.target.closest(".mile");
    if (!m) return;
    selectedDay = Number(m.dataset.day);
    renderChallenge();
  });

  $("#challengeReset").addEventListener("click", () => {
    if (confirm("Reset all 30-day challenge progress?")) {
      store.set("challengeDone", []);
      store.set("challengeDates", {});
      selectedDay = null;
      renderChallenge();
    }
  });

  /* ============================================================
     MY GARAGE — the cockpit
     ============================================================ */
  function garageCard(opts) {
    return '<div class="garage-card' + (opts.wide ? " wide" : "") + '">' +
      '<div class="gc-head"><span class="gc-icon" aria-hidden="true">' + opts.icon + "</span><h3>" + esc(opts.title) + "</h3>" +
      (opts.link ? '<a class="gc-link" href="' + opts.link + '">' + esc(opts.linkText || "Open →") + "</a>" : "") +
      "</div>" + opts.body + "</div>";
  }

  function renderGarage() {
    const g = $("#garageGrid");
    const quiz = store.get("quizResult", null);
    const iexam = store.get("iexam", null);
    const bvacc = store.get("bvacc", []);
    const cards = store.get("indexcards", []);
    const done = store.get("challengeDone", []);
    const lap = store.get("lap", 1);
    const stepsDone = store.get("stepsDone", []);
    const nextStep = store.get("nextStep", "");
    const calc = store.get("calc", null);
    const debriefs = store.get("debriefs", []);
    const mentors = store.get("mentors", []);
    const streak = computeStreak();
    const today = new Date().toDateString();
    const todayCard = cards.find((c) => c.date === today);

    let html = "";

    // Drift score + trend
    if (quiz) {
      const hist = quiz.history || [];
      const prev = hist.length > 1 ? hist[hist.length - 2].score : null;
      const delta = prev == null ? "" :
        (quiz.score < prev ? '<span class="delta good">▼ ' + (prev - quiz.score) + " vs last check — driving!</span>"
          : quiz.score > prev ? '<span class="delta bad">▲ ' + (quiz.score - prev) + " vs last check — hear the rumble strip</span>"
            : '<span class="delta">— unchanged vs last check</span>');
      html += garageCard({
        icon: "◎", title: "Drift score", link: "#/check", linkText: "Retake →",
        body: '<p class="gc-big">' + quiz.score + '<span class="gc-sub">/36</span></p>' +
          '<p class="gc-label">' + esc(quiz.label) + " · " + esc(quiz.date) + "</p>" + delta
      });
    } else {
      html += garageCard({
        icon: "◎", title: "Drift score", link: "#/check", linkText: "Start →",
        body: '<p class="gc-empty">No reading yet. Two minutes of honesty — that\'s your baseline.</p>'
      });
    }

    // Lap / steps
    html += garageCard({
      icon: "➊", title: "Framework lap", link: "#/steps",
      body: '<p class="gc-big">' + stepsDone.length + '<span class="gc-sub">/7 steps</span></p>' +
        '<p class="gc-label">Lap ' + lap + " — the steps build on each other; work them in order.</p>" +
        '<div class="gc-bar"><div style="width:' + Math.round((stepsDone.length / 7) * 100) + '%"></div></div>'
    });

    // Challenge
    html += garageCard({
      icon: "▦", title: "30-Day Challenge", link: "#/challenge",
      body: '<p class="gc-big">' + done.length + '<span class="gc-sub">/30 days</span></p>' +
        '<p class="gc-label">' + (streak >= 2 ? "🔥 " + streak + "-day streak" : "Light your streak with back-to-back days") + "</p>" +
        '<div class="gc-bar"><div style="width:' + Math.round((done.length / 30) * 100) + '%"></div></div>'
    });

    // Vision
    html += garageCard({
      icon: "👁", title: "My vision (I-Exam)", link: "#/steps/1", wide: true,
      body: (iexam && iexam.vision)
        ? '<p class="gc-vision">' + esc(iexam.vision) + "</p>" +
          '<p class="gc-label">' + (iexam.rows || []).filter((r) => r && r.trim()).length + " “I will…” lines beneath it</p>"
        : '<p class="gc-empty">You cannot have what you cannot see. Put your big letter at the top of the chart.</p>'
    });

    // Next easiest step
    html += garageCard({
      icon: "⚡", title: "Next easiest step", link: "#/steps/6", wide: true,
      body: nextStep
        ? '<p class="gc-vision">' + esc(nextStep) + "</p>" +
          '<p class="gc-label">' + (calc && calc.goal ? "Toward: " + esc(calc.goal) : "To multiply your actions, first divide.") + "</p>"
        : '<p class="gc-empty">Divide your big number down to one human-sized step, then write it here.</p>'
    });

    // Today's card
    html += garageCard({
      icon: "🗂", title: "Today's index card", link: "#/steps/3",
      body: todayCard
        ? '<p class="gc-label">✓ Written for today — ' + todayCard.answers.filter((a) => a).length + " of 5 answered. Now live it.</p>"
        : '<p class="gc-empty">Five questions. One card. Tasks will try to hijack your day — don\'t let them.</p>'
    });

    // Gathering
    html += garageCard({
      icon: "📚", title: "Gathering (BVACC)", link: "#/steps/2",
      body: '<p class="gc-big">' + bvacc.length + '<span class="gc-sub">/10</span></p>' +
        '<p class="gc-label">' + (bvacc.length >= 10 ? "Enough — move to Filtering." : "Resources gathered toward your vision") + "</p>"
    });

    // Debriefs & mentors
    html += garageCard({
      icon: "🔁", title: "Evaluation loop", link: "#/steps/7",
      body: '<p class="gc-big">' + debriefs.length + '<span class="gc-sub"> debrief' + (debriefs.length === 1 ? "" : "s") + "</span></p>" +
        '<p class="gc-label">' + (mentors.length ? mentors.length + " mentor" + (mentors.length === 1 ? "" : "s") + " vetted · " : "") +
        "Act → evaluate → adjust → act again.</p>"
    });

    g.innerHTML = html;
  }

  $("#garageWipe").addEventListener("click", () => {
    if (confirm("Clear ALL saved data — scores, charts, cards, and challenge progress? This can't be undone.")) {
      store.wipe();
      selectedDay = null;
      renderGarage();
      renderChallenge();
      renderWelcome();
    }
  });

  /* ---------- Signup ----------
     DEMO ONLY: stores locally and shows a success state. Replace this
     handler with your email platform's embed before public launch. */
  $("#signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#signupEmail").value.trim();
    store.set("signup", { email, date: new Date().toISOString() });
    $("#signupForm").innerHTML =
      '<p style="font-family:var(--font-display);font-size:1.15rem;color:#7FD49B;">🏁 You\'re in the drive!</p>';
    $("#signupNote").textContent =
      "Welcome aboard — watch your inbox for new tools, challenge cohorts, and dates from Chris.";
  });

  /* ---------- boot ---------- */
  const boot = parseHash();
  showView(boot.view, boot.arg);
})();
