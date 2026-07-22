/* ============================================================
   From Drift to Drive — Companion App logic
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

  /* ---------- Nav ---------- */
  const navToggle = $("#navToggle"), navLinks = $("#navLinks");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
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
    // pointer position along the 0–36 track
    requestAnimationFrame(() => {
      $("#gaugePointer").style.left = Math.max(2, Math.min(98, (score / 36) * 100)) + "%";
    });
    const result = {
      score, label: zone.label, date: new Date().toLocaleDateString(),
      history: (store.get("quizResult", {}).history || [])
    };
    result.history = result.history.concat([{ score, date: result.date }]).slice(-12);
    store.set("quizResult", result);
    showLastResult();
  }

  $("#quizRetake").addEventListener("click", () => {
    $("#quizResult").classList.add("hidden");
    $("#quizStart").classList.remove("hidden");
  });

  /* ============================================================
     FRAMEWORK — mile markers + step panel with tools
     ============================================================ */
  const mileTrack = $("#mileTrack");
  const stepPanel = $("#stepPanel");
  let activeStep = 0;

  mileTrack.innerHTML = OC.steps.map((s, i) =>
    '<button class="mile-marker" role="tab" data-i="' + i + '" aria-selected="false">' +
    '<span class="mm-num">' + s.num + '</span>' +
    '<span class="mm-name">' + esc(s.title) + "</span></button>").join("");

  mileTrack.addEventListener("click", (e) => {
    const m = e.target.closest(".mile-marker");
    if (m) renderStep(Number(m.dataset.i));
  });

  const toolRenderers = {
    clarity: toolClarity, gathering: toolGathering, filtering: toolFiltering,
    guidance: toolGuidance, relationships: toolRelationships,
    action: toolAction, evaluate: toolEvaluate
  };

  function renderStep(i) {
    activeStep = i;
    const s = OC.steps[i];
    $$(".mile-marker", mileTrack).forEach((m, j) => {
      m.classList.toggle("active", j === i);
      m.setAttribute("aria-selected", String(j === i));
    });
    stepPanel.innerHTML =
      '<div class="step-head"><span class="step-no">0' + s.num + '</span><h3>' + esc(s.title) + "</h3></div>" +
      '<p class="step-tagline">“' + esc(s.tagline) + '”</p>' +
      '<p class="step-summary">' + esc(s.summary) + "</p>" +
      '<div class="concept-grid">' + s.concepts.map((c) =>
        '<div class="concept-card"><h4>' + esc(c.name) + "</h4><p>" + esc(c.desc) + "</p></div>").join("") + "</div>" +
      '<div class="step-trap"><span aria-hidden="true">⚠️</span><span><strong>Where people run into the ditch:</strong> ' + esc(s.trap) + "</span></div>" +
      '<blockquote class="step-quote">“' + esc(s.quote.text) + '”<cite>— ' + esc(s.quote.by) + "</cite></blockquote>" +
      '<div class="tool" id="stepTool"><h4>🔧 ' + esc(s.toolTitle) + "</h4><p>" + esc(s.toolIntro) + '</p><div id="toolBody"></div></div>';
    toolRenderers[s.id]($("#toolBody"));
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
  function toolFiltering(el) {
    const qs = [
      "What do I need to read today?",
      "What do I need to listen to today?",
      "Who do I need to call today?",
      "What do I need to do today?",
      "What am I looking for today?"
    ];
    const today = new Date().toDateString();
    const cards = store.get("indexcards", []);
    const todays = cards.find((c) => c.date === today) || { answers: ["", "", "", "", ""] };
    el.innerHTML =
      '<div class="indexcard">' +
      qs.map((q, i) =>
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
      const answers = qs.map((_, i) => $("#icQ" + i, el).value.trim());
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

  renderStep(0);

  /* ============================================================
     30-DAY DRIVE CHALLENGE
     ============================================================ */
  const phases = OC.challengePhases;
  const phaseFor = (day) => phases.find((p) => day >= p.days[0] && day <= p.days[1]);

  $("#phaseLegend").innerHTML = phases.map((p) =>
    '<span><span class="phase-dot" style="background:' + p.color + '"></span>' +
    esc(p.name) + " · Days " + p.days[0] + "–" + p.days[1] + "</span>").join("");

  const grid = $("#challengeGrid");
  grid.innerHTML = OC.challenge.map((d) => {
    const p = phaseFor(d.day);
    return '<div class="day-card" data-day="' + d.day + '" style="border-top-color:' + p.color + '" tabindex="0" role="button" aria-expanded="false">' +
      '<span class="dc-day">Day ' + d.day + " · " + esc(p.name) + "</span>" +
      "<h4>" + esc(d.title) + "</h4>" +
      '<p class="dc-task">' + esc(d.task) + "</p>" +
      '<p class="dc-anchor">“' + esc(d.anchor) + '”</p>' +
      '<button class="dc-toggle" type="button"></button></div>';
  }).join("");

  function renderChallenge() {
    const done = store.get("challengeDone", []);
    $$(".day-card", grid).forEach((card) => {
      const day = Number(card.dataset.day);
      const isDone = done.includes(day);
      card.classList.toggle("done", isDone);
      $(".dc-toggle", card).textContent = isDone ? "✓ Done — tap to undo" : "Mark day " + day + " complete";
    });
    const pct = Math.round((done.length / 30) * 100);
    $("#challengeBarFill").style.width = pct + "%";
    $("#challengeStats").textContent = done.length + " of 30 days complete (" + pct + "%)" +
      (done.length === 30 ? " — lap one complete! Start lap two 🏁" : "");
    // "up next" card
    const next = OC.challenge.find((d) => !done.includes(d.day));
    const todayEl = $("#challengeToday");
    if (next) {
      todayEl.innerHTML = '<span class="ct-kicker">⛽ Up next · Day ' + next.day + "</span>" +
        "<h3>" + esc(next.title) + "</h3><p>" + esc(next.task) + "</p>";
    } else {
      todayEl.innerHTML = '<span class="ct-kicker">🏁 Lap complete</span>' +
        "<h3>All 30 days done.</h3><p>The framework runs on a loop — retake the Drift Check and start lap two.</p>";
    }
  }

  grid.addEventListener("click", (e) => {
    const toggle = e.target.closest(".dc-toggle");
    const card = e.target.closest(".day-card");
    if (!card) return;
    const day = Number(card.dataset.day);
    if (toggle) {
      let done = store.get("challengeDone", []);
      done = done.includes(day) ? done.filter((d) => d !== day) : done.concat([day]);
      store.set("challengeDone", done);
      renderChallenge();
    } else {
      const open = card.classList.toggle("open");
      card.setAttribute("aria-expanded", String(open));
    }
  });
  grid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const card = e.target.closest(".day-card");
      if (card && e.target === card) {
        e.preventDefault();
        card.classList.toggle("open");
      }
    }
  });

  $("#challengeReset").addEventListener("click", () => {
    if (confirm("Reset all 30-day challenge progress?")) {
      store.set("challengeDone", []);
      renderChallenge();
    }
  });
  renderChallenge();

  /* ---------- Signup (demo) ---------- */
  $("#signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#signupNote").textContent =
      "Thanks! This demo form isn't connected to an email service yet — hook up your provider in js/app.js to go live.";
  });
})();
