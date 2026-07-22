/* ============================================================
   Overcoming Complacency — Companion App
   Content data drawn from "From Drift to Drive" by Chris Robinson
   ============================================================ */

const OC = window.OC || (window.OC = {});

/* ---------- Rotating quotes (rumble-strip dividers) ---------- */
OC.quotes = [
  { text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.", by: "Bill Gates" },
  { text: "The tragedy of life is not found in failure, but complacency. Not in doing too much, but doing too little. Not in living above your means, but below your capacity.", by: "Benjamin E. Mays" },
  { text: "Sometimes success needs interruption to regain focus and shake off complacency.", by: "Lennox Lewis" },
  { text: "An ounce of action is worth a ton of theory.", by: "Ralph Waldo Emerson" },
  { text: "Small deeds done are better than great deeds planned.", by: "Peter Marshall" },
  { text: "Be consistent every day that ends with day.", by: "Chris Robinson" },
  { text: "The complacency of fools will destroy them.", by: "Proverbs 1:32" },
  { text: "Experience should be a plus as long as it doesn't become complacency.", by: "Marv Levy" }
];

/* ---------- Drift Check (self-assessment) ---------- */
/* Scoring: every answer 0 (drive) … 3 (drift). 12 questions, max 36. */
OC.quiz = {
  intro: "Complacency doesn't broadcast its presence. It hides in the things you've already done well. Answer honestly about who you are right now — not who you were at your hungriest.",
  recencyOptions: [
    "Within the past month",
    "In the past few months",
    "Around a year ago",
    "Honestly, I can't remember"
  ],
  agreeOptions: [
    "That's me right now",
    "Mostly true of me",
    "Only somewhat true",
    "Not lately"
  ],
  questions: [
    { type: "recency", text: "When was the last time you challenged yourself to do something genuinely hard?" },
    { type: "recency", text: "When was the last time you did something completely outside your comfort zone?" },
    { type: "recency", text: "When was the last time you learned something new — a skill, not a headline?" },
    { type: "recency", text: "When was the last time you accepted a critique that was meant to help you?" },
    { type: "recency", text: "When was the last time you felt fully alive, engaged, and present in your work?" },
    { type: "recency", text: "When was the last time you woke up excited, a little nervous, and a lot motivated?" },
    { type: "agree", text: "I still prepare at the level I did when I was hungriest — no cruise control." },
    { type: "agree", text: "I actively invite feedback instead of defending how I've always done things." },
    { type: "agree", text: "My daily activity is moving me toward something, not just keeping me busy." },
    { type: "agree", text: "I can name, specifically, the next mountain I'm climbing." },
    { type: "agree", text: "The people I spend the most time with stretch my vision instead of shrinking it." },
    { type: "agree", text: "I honestly evaluate my results and adjust — I inspect what I expect." }
  ],
  zones: [
    {
      max: 12,
      key: "drive",
      label: "In the Driver's Seat",
      icon: "🏁",
      color: "#2E7D4F",
      headline: "Hands on the wheel.",
      message: "You're gripping the wheel with intention — challenging yourself, inviting feedback, and moving toward a named destination. Your job now is to protect that drive. Complacency is a shape-shifter, and high achievers are its favorite target: keep running the Seven-Step loop so 'good' never quietly becomes 'good enough.'",
      moves: [
        "Run the framework as a loop — start your next lap at Step 1: Clarity.",
        "Take the 30-Day Drive Challenge to pressure-test your consistency.",
        "Get into a bigger room: find one person a few steps further ahead and book the coffee."
      ]
    },
    {
      max: 24,
      key: "cruise",
      label: "Cruise Control",
      icon: "⚠️",
      color: "#C98A00",
      headline: "You've slipped into autopilot.",
      message: "This isn't laziness — your calendar is full and the checklist is getting checked. But you're relying on the same old methods to do the same old things, assuming the same old results. That's Chris Robinson's definition of complacency: that secret place of satisfactory success. The good news? You caught it. Consider this your rumble strip.",
      moves: [
        "Start at Step 1: Clarity — build your I-Exam Chart and name what's next.",
        "Ask a truth-teller for feedback on something you think is going fine (Chris's Cambodia dinner move).",
        "Commit to the 30-Day Drive Challenge — small daily action beats a burst of hustle."
      ]
    },
    {
      max: 36,
      key: "drift",
      label: "Drifting",
      icon: "🛑",
      color: "#C0392B",
      headline: "Wheels on the rumble strip.",
      message: "You've drifted onto the soft shoulder of adequate, acceptable, average, and tolerable. Hear the rumble strip for what it is — not a verdict, but a wake-up. Chris was handed a foreclosure notice and found five words that changed everything: 'I can build this again.' You've got more to build and more to give. The framework is your way back to the center lane.",
      moves: [
        "Don't skip steps. Begin at Step 1: Clarity and work the framework in order.",
        "Take the full Complacency Assessment Profile at drift2drivequiz.com.",
        "Start Day 1 of the 30-Day Drive Challenge today — the next easiest step is enough."
      ]
    }
  ]
};

/* ---------- The Seven-Step Framework ---------- */
OC.steps = [
  {
    num: 1, id: "clarity", title: "Clarity",
    tagline: "You cannot have what you cannot see.",
    summary: "The way you see your life is a mosaic — fragments of what teachers, ads, and well-meaning voices told you was possible, grouted together with guesses. Chris grew up on PSAs telling him not to expect to live past 25; a friend's mom told him he'd never afford the Camaro that rumbled past on I-35. Clarity is the step where you take the wheel of your own vision: trading the billboards you were handed for a crisp picture of where you're going next — and the specific steps that get you there.",
    concepts: [
      { name: "Complacency Hyperopia", desc: "Farsightedness: the big dream is vivid, but today's micro-steps are a blur. Big vision, no daily action — a dream with no action is a black hole." },
      { name: "Complacency Myopia", desc: "Nearsightedness: endlessly busy with gear, research, and rabbit trails, but where it's all headed is vague. Motion without a horizon." },
      { name: "The Everest Problem", desc: "Already summited your mountain and feel done? Get into new environments. Sir Edmund Hillary followed Everest with the Himalayan Trust — new rooms create new vision." }
    ],
    trap: "Settling for the limited roofline someone else handed you — or mistaking a fuzzy 'someday' for a vision.",
    quote: { text: "When you wake up, think about winning the day. Don't worry about a week or a month from now. Just think about one day at a time.", by: "Drew Brees" },
    toolTitle: "The I-Exam Chart",
    toolIntro: "Reimagine the eye chart: your big vision goes at the top in large letters, and beneath it, the smaller — but just as essential — lines: specific “I will…” commitments that bring the vision into focus."
  },
  {
    num: 2, id: "gathering", title: "Gathering",
    tagline: "Learn a little, do a little.",
    summary: "Gathering is intentionally pulling together the resources, input, training, and ideas that will guide you in your lane — you have to know more before you grow more. But this is the most dangerous transition point in the framework, because a monster roams these halls: the Complacency Hydra. Cut off one head, and another appears. Know its four faces so you can bring your blade.",
    concepts: [
      { name: "Face 1 — DIY-ing to the Death", desc: "“That doesn't look hard, I'll figure it out myself.” Pride that skips the wisdom of those who've gone before you. (Ask Chris about repainting his house.)" },
      { name: "Face 2 — So Special", desc: "“What I'm doing is so unique no one can teach me.” Even pilots landing at Telluride consult the accrued knowledge. There's always something to learn." },
      { name: "Face 3 — More, More, More", desc: "Gathering overdrive — convinced you can't start until you know everything. The antidote is the maxim of this whole book: learn a little, do a little." },
      { name: "Face 4 — Again?", desc: "The restart tax. “Are you really willing to pay the price again?” Gather your resolve along with your resources. Resolve is the blade that cuts through all doubt." }
    ],
    trap: "Skipping the research because you're an 'action person' — or hunting for information forever so you never have to act.",
    quote: { text: "Even if you're on the right track, you'll get run over if you just sit there.", by: "attributed to Will Rogers" },
    toolTitle: "The BVACC Tracker",
    toolIntro: "Gather exactly ten resources tied directly to your vision — Books, Videos, Audio, Coaching, and Courses. Ten is enough context to move without overwhelm. Remember: this is gathering, not reading. Not yet."
  },
  {
    num: 3, id: "filtering", title: "Filtering",
    tagline: "Read what you need. How to crush a book.",
    summary: "Chris's TV Turnaround: an 800-square-foot apartment, a 55-inch TV, and not a book to be found — the math of small thinking. Successful people run everything they consume through three filters. The content filter (test-drive a book; bless it and release it if it doesn't serve your goal — and it always counts, even if you never finish the book). The learning filter (prime your mind, make fast passes, highlight, mind-map, read faster — then ask: what would I teach tomorrow?). And the action filter: one 4×6 index card that turns information into intention, every single day.",
    concepts: [
      { name: "AHAB", desc: "Always Have A Book. Soccer practice, the airport, the restaurant — successful people fill the small gaps of the day with content that grows them." },
      { name: "Test Drive", desc: "Cover, subtitle, table of contents, sample chapter. Does this content serve where you're headed? If not — bless it, and it's on its way." },
      { name: "Crush a Book", desc: "Prime your purpose → fast pass over titles, bullets, and quotes → put it down and ask what you'd teach → second pass with a highlighter → mind-map it. About an hour, and you can teach it." },
      { name: "It Always Counts", desc: "When you invest in learning, it counts. One sentence that carries you toward your goal counts — even if you never read the rest of the book." }
    ],
    trap: "Confusing consumption with progress — a to-do list and a reading pile can both be complacency wearing a busy costume.",
    quote: { text: "The larger the house, the smaller the TV. The smaller the house, the larger the TV.", by: "Dr. Dennis Kimbro's millionaire study, retold by Chris Robinson" },
    toolTitle: "Today's Index Card",
    toolIntro: "The action filter needs no apps and no gadgets: a 4×6 index card, a pen, and five questions. Notice the last word of every question — today. Tasks will always try to hijack your day. This card makes the priorities the priorities."
  },
  {
    num: 4, id: "guidance", title: "Guidance",
    tagline: "The bridge to experience and wisdom.",
    summary: "Kami Rita has summited Everest 30 times as a Sherpa — a trail angel who knows the mountain. Some things are taught; others are caught, and only proximity to someone who's gone where you're going lets you catch them. But guidance is misunderstood: a mentor is not someone who drags you up the mountain, calls in favors, or holds your rope for you. We learn from them — then we do the work. 97% of people with a mentor call it powerful and valuable; only 37% ever establish one. Get intentional.",
    concepts: [
      { name: "Seek to Serve", desc: "Chris became a (terrible) volunteer cameraman for speaker Lethia Owens — mouth closed, expectations absent, ears and heart open. Within two days she had him on stage. Serve first; proximity over time opens doors." },
      { name: "Pay to Play", desc: "Put your wallet where your dreams are. You'd never expect a doctor to diagnose you for free — hire the coach, get to the conference, get in the room. Anything less is playing small." },
      { name: "Proximity", desc: "Nearness in place, time, or relation. Even learning from a distance — courses, conferences, group coaching — buys you proximity to how excellence carries itself." }
    ],
    trap: "Expecting a mentor to carry you across the line — or 'saving money' by only asking friends who've never been where you're going.",
    quote: { text: "Getting where you want to go is easier when you have someone to follow.", by: "Chris Robinson" },
    toolTitle: "The Mentor Vetting Checklist",
    toolIntro: "Before you seek someone's guidance, run them through the five questions. Mentors mold maturity — vet for results and values, not billboards and hype."
  },
  {
    num: 5, id: "relationships", title: "Relationships",
    tagline: "Get into the right rooms.",
    summary: "Chris presented his speaking-business plan to a kind, supportive networking group — and got silence. His friend Jason named it in the parking lot: “I think you're in the wrong room.” The right rooms have bigger windows (people who can see further than you), the right kind of encouragement (belief that pushes you toward your potential, not just pats for the status quo), and a collaborative culture where generosity is the norm. Ride in the peloton: cyclists in formation are 40% more efficient than riders going it alone.",
    concepts: [
      { name: "The Cohort Principle", desc: "A group headed the same direction you are. Online communities, in-real-life masterminds, topic-specific conferences, industry groups — vet each against your actual goal." },
      { name: "Posture vs. Imposter", desc: "Show up real. You feel like an imposter when your need to impress outweighs your desire to progress. If you're the most experienced person in the room, you're in the wrong room." },
      { name: "Select · Connect · Engage", desc: "Select rooms with intentionality, connect with generosity and honesty, engage with consistency and proactivity. Groups only work as far as you work the group." }
    ],
    trap: "Mistaking 'kind and supportive' for 'right' — a room that only says 'nice job' can be a cushioned dead end.",
    quote: { text: "Be more interested than interesting.", by: "Chris Robinson" },
    toolTitle: "The Right-Rooms Audit",
    toolIntro: "Run the room you spend the most time in through the four marks of a right room. Then decide: invest deeper, or find a room with bigger windows."
  },
  {
    num: 6, id: "action", title: "Action",
    tagline: "Take the next easiest step.",
    summary: "Two-speed-transmission thinking wrecks this step: overdrive (zero to 75 on Monday, hobbled by Tuesday) or too slow (frozen at the cave entrance). The multi-speed alternative: to multiply your actions, you must first divide. Chris needed $4,000 a month to make his coaching dream viable — insurmountable, until he divided it: ten clients at $400. Then divided again: find one. Pick a way (not 'the' way — that's Santa Claus math), stop the video when it says go do this, and go do it. Action answers questions. And beware the twins of inaction — procrastination and perfectionism — because underneath both is usually fear.",
    concepts: [
      { name: "Divide to Multiply", desc: "Big goal ÷ reality = a number. That number ÷ units = one next easiest step. Don't spin your wheels on client #100; go book client #1." },
      { name: "The Myth of The Way", desc: "There isn't one magical path. There are multiple ways — pick one and stick with it. No freewheeling in the action kitchen; improvised recipes can't be replicated." },
      { name: "Don't PEEK Too Soon", desc: "Crops, babies, and dreams all have a gestation period. Digging up the seeds daily to check on them undoes the planting. A result at day 45 is data, not a verdict." },
      { name: "The 8%", desc: "Only 8% of people reach their goals — the ones who set specific targets, gather, get guidance, build support, and act consistently. Work the framework and you're in the 8%." }
    ],
    trap: "Confusing frenzy with focus — or waiting for certainty. Certainty is a signpost on the way to complacency; risk is the mileage sign on the way to the top.",
    quote: { text: "Be consistent every day that ends with day.", by: "Chris Robinson" },
    toolTitle: "The Divide-to-Multiply Calculator",
    toolIntro: "Put your big number in, divide it down to one human-sized unit, and walk away knowing today's next easiest step."
  },
  {
    num: 7, id: "evaluate", title: "Evaluate",
    tagline: "You can't expect what you won't inspect.",
    summary: "Action and evaluation run on a loop together: act, get a result, run it through four questions, adjust, act again. Stay unemotional about the result while staying passionate about the goal — you are not your result, good or bad. Think like a scientist in a lab: the experiment is the experiment; you are you. And remember the two yellow caution signs: a result does not equal you, and evaluation is not the destination. Done correctly, evaluation always leads you back to action — and eventually, back to Step 1 for your next lap. All seven steps run on a loop.",
    concepts: [
      { name: "The Four Questions", desc: "What did I do? What did I learn? What did I like? What would I change or do differently? Answered honestly, they turn every result into a replicable recipe." },
      { name: "Evaluation Errors", desc: "Don't judge only by 'am I there yet.' Don't ignore small wins — they're the embers of momentum. Don't compare (stay in your lane). Don't set fantasy timelines. Don't diagnose the flat tire and then just stand there — change it." },
      { name: "Own the Result", desc: "Don't complain about the results you didn't get from the effort you didn't give. Tell yourself the truth with honesty and honor — that's how a good friend treats you." }
    ],
    trap: "Setting up permanent camp in the land of evaluation — good at finding problems, never moving on the fixes.",
    quote: { text: "Success leaves clues.", by: "Chris Robinson" },
    toolTitle: "The Four-Question Debrief",
    toolIntro: "Log an action you actually took — not one you talked about taking — and run it through the four questions. Keep your entries; watch your recipe sharpen lap after lap."
  }
];

/* ---------- 30-Day Drive Challenge ---------- */
OC.challengePhases = [
  { name: "Wake-Up", step: 0, days: [1, 3], color: "#8A6FBF" },
  { name: "Clarity", step: 1, days: [4, 7], color: "#3D7AB5" },
  { name: "Gathering", step: 2, days: [8, 11], color: "#2E8C7A" },
  { name: "Filtering", step: 3, days: [12, 15], color: "#5E9732" },
  { name: "Guidance", step: 4, days: [16, 19], color: "#C98A00" },
  { name: "Relationships", step: 5, days: [20, 23], color: "#D96C2C" },
  { name: "Action", step: 6, days: [24, 27], color: "#C0392B" },
  { name: "Evaluate & Loop", step: 7, days: [28, 30], color: "#7A4E9E" }
];

OC.challenge = [
  { day: 1,  title: "Hit the rumble strip",        task: "Take the Drift Check above. Write down the one area of your life where you know you've been coasting.", anchor: "Consider this your interruption." },
  { day: 2,  title: "Contentment vs. complacency", task: "Write one sentence in the true-contentment pattern: “I'm content with what I've built, AND I'm excited to make it better by…”", anchor: "Contentment fuels growth; complacency excuses stagnation." },
  { day: 3,  title: "Order the critique tsunami",  task: "Ask someone whose judgment you respect: “Would you give me some feedback on how I'm really doing?” Then only listen and take notes.", anchor: "Chris asked John Maxwell at dinner in Cambodia — and filled pages." },
  { day: 4,  title: "Write the big letter",        task: "One sentence: what does your next chapter look like? Make it specific enough to steer by.", anchor: "You cannot have what you cannot see." },
  { day: 5,  title: "Build your I-Exam Chart",     task: "Use the Clarity tool: put your vision at the top and write at least five “I will…” lines beneath it.", anchor: "What's near the bottom of the chart is just as important as the top." },
  { day: 6,  title: "Diagnose your vision",        task: "Hyperopia (big dream, no daily steps) or myopia (busy details, no horizon)? Name yours and write the correcting move.", anchor: "The goal is 20/20: distance and close vision at once." },
  { day: 7,  title: "Find a bigger window",        task: "Reach out to one person who's gone further than you and ask for 20 minutes. New environments expand vision.", anchor: "You can stay nearsighted on Everest — or find the next peak." },
  { day: 8,  title: "Open your BVACC list",        task: "Gather (don't read!) three resources tied directly to your vision — a book, a video, a podcast. Log them in the Gathering tool.", anchor: "This is gathering, not reading. Not yet." },
  { day: 9,  title: "Ask the gatherers",           task: "Ask two people who are where you want to be: “What are you reading and listening to?” Add their answers to your list.", anchor: "Find the people accomplishing it, and borrow their inputs." },
  { day: 10, title: "Get to ten — and stop",       task: "Round out your BVACC list to ten resources. Ten is enough. Resist face three of the Hydra: more, more, more.", anchor: "Learn a little, do a little." },
  { day: 11, title: "Gather your resolve",         task: "Write your why in two sentences, ending with Chris's battle cry: “I can build this.” Put it where you'll see it.", anchor: "Resolve is the blade that cuts through all doubt." },
  { day: 12, title: "Test-drive your pile",        task: "Skim covers, subtitles, and contents of your ten resources. Pick the top three; bless the rest and release them for now.", anchor: "You have to know what you need in order to succeed." },
  { day: 13, title: "Crush pass #1",               task: "Fast pass over resource #1: titles, bullets, quotes, anything designed to stand out. Then put it down and answer: “If I had to teach this tomorrow, what would I teach?”", anchor: "Prime the mind, then let it hunt." },
  { day: 14, title: "Crush pass #2 + map it",      task: "Second pass with a highlighter, reading the paragraphs after anything you mark. Then sketch a one-page mind map from memory.", anchor: "Mind mapping turns reading into retention." },
  { day: 15, title: "Write your first index card", task: "Use the Filtering tool: answer the five questions — read, listen, call, do, looking for — for today. Then live the card.", anchor: "Tasks will always try to hijack your day." },
  { day: 16, title: "Name your not-yet-knowns",    task: "List three to five specific things you can't learn from books — things you'd want to watch someone do.", anchor: "Some things are taught; others are caught." },
  { day: 17, title: "Vet three trail angels",      task: "Name three people known for what you want to learn. Run each through the Mentor Vetting Checklist in the Guidance tool.", anchor: "Verify if their results are hype or true fruit." },
  { day: 18, title: "Seek to serve",               task: "Send one message today: “I'd love to learn more about X. If there's any way I can volunteer or help you, please let me know.” No pitch. No ask.", anchor: "Mouth closed, expectations absent, ears and heart open." },
  { day: 19, title: "Pay to play",                 task: "Pick the course, coach, or conference that best fits your goal — and commit to it. Put your wallet where your dreams are.", anchor: "You wouldn't ask a doctor for a free diagnosis." },
  { day: 20, title: "Audit your main room",        task: "Run the group you spend the most time in through the Right-Rooms Audit in the Relationships tool.", anchor: "Kind and supportive isn't the same as right." },
  { day: 21, title: "Scout one new room",          task: "Find one community — online, in-person, or a topic-specific event — filled with people headed where you're headed.", anchor: "The right rooms have bigger windows." },
  { day: 22, title: "Walk in and be real",         task: "Introduce yourself in the new room. One rule: be more interested than interesting.", anchor: "Posture, not imposter." },
  { day: 23, title: "Invite the push",             task: "Share your specific goal with someone who understands it, and ask: “What would you push me on?”", anchor: "The right encouragement believes in something bigger than the status quo." },
  { day: 24, title: "Divide to multiply",          task: "Run your big goal through the Action calculator. Divide until you're holding one human-sized next step.", anchor: "To multiply your actions, you must first divide." },
  { day: 25, title: "Take the next easiest step",  task: "Do it before noon if you can. Then celebrate it — out loud. Celebration wires your brain for the next action.", anchor: "Action is the antidote to a hesitant mindset." },
  { day: 26, title: "Learn a little, do a little", task: "Open your course or book, and the moment it says “go do this” — stop and go do it. Don't advance until it's done.", anchor: "Hear an action, stop the video, take the action." },
  { day: 27, title: "Repeat without peeking",      task: "Do yesterday's action again. Don't dig up the seeds to check on them — trust the gestation period.", anchor: "A result at day 45 is data, not a verdict." },
  { day: 28, title: "Run the four questions",      task: "In the Evaluate tool, debrief this week's action: What did I do? What did I learn? What did I like? What would I change?", anchor: "You can't expect what you won't inspect." },
  { day: 29, title: "Make one adjustment",         task: "Pick a single change from yesterday's debrief and act on it today. Diagnosing the flat tire isn't fixing it.", anchor: "Evaluation done correctly leads back to action." },
  { day: 30, title: "Start lap two",               task: "Retake the Drift Check and compare scores. Then schedule your next lap through all seven steps — the framework runs on a loop.", anchor: "What do you want? Go get it. Do something today to get there." }
];
