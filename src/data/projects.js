/*
  projects.js: every project page is built from this file.

  Fields used by the cards (home + /projects):
    id, featured, title, subtitle, category, year, blurb, description, tags, image, imageAlt

  Fields used by the article page (/projects/:projectId):
    context   small mono meta line, e.g. "IrvineHacks 2026 · Qualcomm sponsor track"
    date      e.g. "March 2026"
    hook      bold one-liner under the title
    repo, live, links: [{ label, url }]   (empty url = link is hidden)
    article: [{ heading (optional), body: [paragraphs], flow (optional), table (optional) }]
      flow:  { steps: [...], loop: "...", caption: "..." }   (a small step diagram)
      table: { columns: [...], rows: [[...], [...]] }
    highlights: [...]   sidebar bullets
    builtWith: [...]    sidebar chips

  BEFORE DEPLOYING: search the project for "[FILL" (Ctrl+Shift+F).
  Every match is a fact only you know. Zero matches = safe to publish.
*/

export const projects = [
  /* ===== Featured (big rows on /projects, cards on home) ===== */

  /* ---------- F.R.N.D. ---------- */
  {
    id: "frnd",
    featured: true,
    title: "F.R.N.D.",
    subtitle: "Serverless emergency drone network",
    category: "Embedded AI",
    year: "2026",
    date: "March 2026",
    context: "IrvineHacks 2026 · Qualcomm sponsor track",
    hook: "When the network goes down, the help can't depend on it.",
    blurb:
      "An emergency assistant that runs Llama 3 on the hardware itself, reachable from any phone with no app, no internet and no cloud.",
    description:
      "An emergency assistant that runs Llama 3 on the hardware itself, reachable from any phone with no app, no internet and no cloud server. Built in 3 days by a 4-person team. [FILL: result, e.g. placed 2nd of N in the track]",
    tags: ["Arduino Uno Q", "Llama 3", "WebSockets", "Raspberry Pi"],
    image: "",
    imageAlt: "",
    repo: "", // [FILL] GitHub repo link, or leave empty to hide
    live: "",
    links: [
      { label: "Demo video", url: "" }, // [FILL] video link, or leave empty to hide
      { label: "Devpost", url: "" }, // [FILL] Devpost link, or leave empty to hide
    ],
    article: [
      {
        body: [
          "Almost every AI assistant assumes a data center on the other end of the line. In an emergency, that link is the first thing to fail: towers overload, power drops, and an app that calls the cloud returns an error at the worst possible moment.",
          "F.R.N.D. deletes the other end. The model runs on a board we carry in, and phones reach it over [FILL: the local link, e.g. the board's own Wi-Fi network]. There is nothing to download first and nothing upstream to go down.",
          "The model is a quantized Llama 3 running on the Arduino Uno Q, a board that first went on sale in late October 2025. Quantizing stores the model's weights in fewer bits, so a [FILL: size, e.g. 1B] model fits in the board's [FILL: 2 GB or 4 GB] of memory. Inference runs in-process through yzma, so there is no separate model server to start, crash or babysit.",
          "Phones and the model never talk to each other directly. A WebSocket relay bridges the Uno Q and a Raspberry Pi and splits traffic by URL path: phones connect on one path, the model on another. Each side gets its own channel, and [FILL: the problem this split solved].",
          "[FILL: What the drone does, e.g. carries the node into the area, extends range, relays messages between groups. The title promises a drone, so this paragraph matters.]",
        ],
      },
      {
        heading: "My part",
        body: [
          "[FILL: Which pieces you personally built, e.g. the WebSocket relay and the on-device model. Interviewers ask about this first.]",
        ],
      },
    ],
    highlights: [
      "On-device LLM: no cloud, no internet, no app install",
      "Quantized Llama 3 on a newly released Arduino Uno Q, running in-process through yzma at [FILL: X] tokens per second",
      "WebSocket relay that routes phone clients and the model client by URL path",
      "Designed, built and demoed in 3 days with 4 people for the Qualcomm sponsor track",
    ],
    builtWith: ["Arduino Uno Q", "Raspberry Pi", "Python", "Llama 3", "yzma", "WebSockets"],
  },

  /* ---------- Autonomous RC Rover ---------- */
  {
    id: "autonomous-rc-rover",
    featured: true,
    title: "Autonomous RC Rover",
    subtitle: "Custom PCB, sensor fusion, PD control",
    category: "Embedded · PCB",
    year: "2026",
    date: "April 2026",
    context: "IEEE Open Project Space capstone",
    hook: "Five modules, one board, and a controller tuned by watching its own mistakes.",
    blurb:
      "A rover that steers around obstacles on its own, running a PD controller on an ESP32 that sits on a 2-layer PCB I designed in KiCad.",
    description:
      "A rover that steers around obstacles on its own, running a PD controller on an ESP32 that sits on a 2-layer PCB I designed in KiCad. 90% obstacle avoidance in testing.",
    tags: ["ESP32", "KiCad", "C++", "PD control"],
    image: "",
    imageAlt: "",
    repo: "", // [FILL] GitHub repo link, or leave empty to hide
    live: "",
    links: [
      { label: "Test run video", url: "" }, // [FILL] video link, or leave empty to hide
      { label: "Board files", url: "" }, // [FILL] KiCad files link, or leave empty to hide
    ],
    article: [
      {
        body: [
          "The capstone brief was to design and build a custom rover. Breadboard prototypes are fragile: jumpers shake loose, and long wires next to motors pick up noise that sensors then read as distance.",
          "So the first decision was the board. I merged 5 separate modules (the ESP32, an L293D motor driver, IR and ultrasonic sensors, and power regulation) onto one 2-layer KiCad PCB. A full ground plane gives motor current a short return path, which keeps that noise off the sensor lines.",
          "The second decision was how to see. IR and ultrasonic sensors fail in different ways: IR struggles with dark or shiny surfaces, ultrasonic with soft or angled ones. The firmware fuses both into one distance error, so one sensor's blind spot is covered by the other.",
          "That error drives a PD loop. The P term reacts to how far off the rover is; the D term reacts to how fast that is changing and damps overshoot. Think of P as the steering wheel and D as the hand that stops you from oversteering. The output becomes a PWM duty cycle for each motor through the L293D H-bridge.",
        ],
        flow: {
          steps: ["Read IR + ultrasonic", "Fuse into one error", "PD controller", "PWM duty per motor", "L293D drives motors"],
          loop: "The rover moves, and the next loop reads the sensors again",
          caption:
            "Every loop reads both sensors, turns them into one error, and lets the PD controller set each motor's PWM duty.",
        },
      },
      {
        body: [
          "The gains weren't calculated. They were found. Every loop printed its error over serial, and I tuned Kp and Kd against those live traces: too much P and the rover weaves, too little D and it overshoots. That took obstacle avoidance from [FILL: X]% to 90% across [FILL: N] test runs.",
          // [FILL] Confirm this paragraph matches your real reasoning, then delete this comment.
          "There is no integral term. Dodging a wall doesn't require holding an exact distance, so the I term, which removes a steady offset, would add windup risk for little gain.",
        ],
      },
    ],
    highlights: [
      "5 modules consolidated onto one 2-layer KiCad PCB with a full ground plane",
      "IR and ultrasonic distance error fused into one control signal",
      "PD controller in C++ on an ESP32, driving two motors with PWM through an L293D H-bridge",
      "Gains tuned against live serial error traces, not guessed",
      "90% obstacle avoidance in testing",
    ],
    builtWith: ["C++", "ESP32", "KiCad", "L293D H-bridge", "IR sensor", "Ultrasonic sensor", "PWM"],
  },

  /* ---------- IoT Weather Station ---------- */
  {
    id: "iot-weather-station",
    featured: true,
    title: "IoT Weather Station",
    subtitle: "Deep sleep, MQTT, 9x battery life",
    category: "IoT",
    year: "2026",
    date: "January 2026",
    context: "Personal project",
    hook: "The fix for battery life wasn't a bigger battery.",
    blurb:
      "An ESP32 weather station that went from 3 days to 4 weeks on the same battery by sleeping between readings.",
    description:
      "An ESP32 that streams temperature and humidity to a live dashboard in under 2 seconds, and now runs 4 weeks on a battery that used to last 3 days.",
    tags: ["ESP32", "MQTT", "C++", "Low power"],
    image: "",
    imageAlt: "",
    repo: "", // [FILL] GitHub repo link, or leave empty to hide
    live: "",
    links: [],
    article: [
      {
        body: [
          "The first version worked, then died in 3 days. An ESP32 left awake with Wi-Fi on burns power every second, even though a temperature reading takes a fraction of one. The battery wasn't too small. The board was awake for no reason.",
          "Before the board could sleep, it had to stop misbehaving. Timing faults on the sensor bus [FILL: what they caused, e.g. failed reads that retried and kept the radio on] had to be isolated first. [FILL: How you found them, e.g. logic analyzer, serial timestamps, swapping wires.]",
          "Then the duty cycle: wake on a timer, read the DHT22, connect, publish over MQTT, and drop back into deep sleep for [FILL: X] minutes. In deep sleep the ESP32 draws microamps instead of the tens of milliamps it pulls awake, so nearly all of its life is spent asleep.",
        ],
        flow: {
          steps: ["Wake on timer", "Read DHT22", "Connect Wi-Fi", "Publish over MQTT"],
          loop: "Deep sleep for the rest of the cycle, then wake again",
          caption:
            "The four awake steps take seconds. Deep sleep fills the rest of every cycle, which is where the 9x comes from.",
        },
      },
      {
        body: [
          "The result: runtime went from 3 days to 4 weeks, about 9 times longer. Readings still reach the dashboard in under 2 seconds from the moment the sensor is read.",
        ],
      },
    ],
    highlights: [
      "9x battery life: 3 days to 4 weeks on the same battery",
      "Sensor-to-dashboard latency under 2 seconds over MQTT",
      "Timing faults isolated before sleep scheduling, so the board wakes, works and sleeps cleanly",
      "DHT22 temperature and humidity on an ESP32, written in C++",
    ],
    builtWith: ["ESP32", "C++", "MQTT", "DHT22", "[FILL: broker, e.g. Mosquitto]", "[FILL: dashboard, e.g. Node-RED]"],
  },

  /* ===== More work (small gallery on /projects) ===== */

  /* ---------- This website ---------- */
  {
    id: "ai-built-portfolio",
    featured: false, // set to true to show it in the big rows instead
    title: "React Frontend Built with AI",
    subtitle: "This site: spec-driven, AI-written, human-verified",
    category: "Web",
    year: "2026",
    date: "October 2026",
    context: "Live at ritviksingh.net",
    hook: "I wrote the spec. The AI wrote the code. Nothing shipped until it passed my checks.",
    blurb:
      "This site: a 7-page React portfolio built by directing Claude and Cursor, running in production for about $10 a year.",
    description:
      "A 7-page React portfolio built by directing Claude and Cursor, running in production for about $10 a year.",
    tags: ["React", "Vite", "Firebase", "Cloudflare"],
    image: "",
    imageAlt: "",
    repo: "", // [FILL] e.g. https://github.com/ritviks123/my-website (only if the repo is public)
    live: "https://ritviksingh.net",
    links: [],
    article: [
      {
        body: [
          "Most AI-built sites look like a patchwork. Each prompt gets answered on its own, so no two pages quite agree. The fix isn't a cleverer prompt. It's a spec the AI can't drift away from.",
          "So the first thing I wrote wasn't code. It was a brief: the environment (Windows, PowerShell, Vite, React Router v8), exact color tokens, fonts, breakpoints, hover rules and class names. It also listed locked decisions the AI was told never to undo, plus process rules: one branch per feature, a production build before every merge, and a checklist after every step.",
          "The roadmap was a 2024 tutorial series that was already out of date. The AI's job was to flag every stale step and tell me how to verify it before anything ran. Where the tutorial didn't fit, I overrode it: Web3Forms instead of Firebase for the contact form, and my own footer reference instead of the tutorial's.",
          "The AI proposed and I decided. At every fork it laid out options and trade-offs: phone menu style, hero animation, contact backend, deploy path, domain. I picked a live circuit and serial monitor for the hero over a heavy 3D model, because [FILL: your reason].",
          "Testing caught what reading code would not. Screenshots from an iPhone SE started the mobile fixes. A footer that vanished after a merge traced back to pulling main before the pull request had actually merged.",
          "The honest split: the AI wrote most of the code. What I own is the spec, every product decision, and the verification, and I can explain how each piece works.",
        ],
      },
      {
        heading: "Bugs worth telling",
        table: {
          columns: ["Problem", "Cause", "Fix"],
          rows: [
            ["Footer vanished after a merge", "Pulled main before the PR merged", "Merged the PR, rebuilt the branch from the updated main"],
            ["Article pages were unstyled", "Their CSS was overwritten during an earlier file swap", "Found it with a project-wide search, restored and reorganized the stylesheets"],
            ["Hero image was broken", "The file never existed; the server returned the app's 404 page", "Recreated the image at the right path"],
            ["Underlines kept showing on hover", "A global a:hover rule overrode component styles", "Removed it, set one hover rule site-wide"],
            ["Domain wouldn't verify", "IP typed into the DNS Name field, Cloudflare proxy on", "@ as the name, IP as the value, DNS only"],
            ["Deploys looked delayed", "Browser caching", "Added Cache-Control headers"],
          ],
        },
      },
    ],
    highlights: [
      "7 routes, with every project page generated from one data-driven template: a new project means new data, not new layout",
      "An animated SVG circuit hero with signal pulses along the traces, and a serial monitor that types a boot log one character at a time, like a microcontroller printing over UART",
      "Scroll reveal through IntersectionObserver with staggered timing, and reduced-motion support on every animation",
      "8 feature branches merged through pull requests, each production-built and previewed first",
      "SPF and DMARC records so nobody can send email pretending to be the domain, plus security headers",
      "Pages always revalidate while build files cache for a year; Lighthouse [FILL: category] score of 100 on mobile",
      "About $10 a year in total: the domain is the only cost",
    ],
    builtWith: [
      "React",
      "Vite",
      "React Router v8",
      "CSS",
      "Firebase Hosting",
      "Cloudflare DNS",
      "Web3Forms",
      "Git and GitHub",
      "Claude",
      "Cursor",
    ],
  },
];