/*
  projects.js: every project page is built from this file.

  Cards (home + /projects) use:
    id, featured, title, subtitle, category, year, blurb, tags, image, imageAlt

  The article page (/projects/:projectId) uses:
    year · tagline · status   the small mono meta line (the page draws the ● dot)
    description               the bold lede under the title
    links: [{ label, url }]   empty url = link hidden
    badges: [...]             small mono chips in the link row
    hero                      the big framed card under the links (see "Diagrams" below)
    article: [{ heading (optional), body: [paragraphs], diagram (optional), table (optional) }]
    highlights: [...]         sidebar bullets
    builtWith: [...]          sidebar chips
    footnote                  one muted line at the end (team, origin)

  Text formatting inside any string:
    **bold**   `code`   [link text](https://...)

  Diagrams (hero or article diagram):
    { type: "flow", steps: [...], note: "...", caption: "..." }
    { type: "compare", columns: [{ title, items: [...] }, { title, items: [...] }], caption: "..." }

  Empty link url = link hidden, so add links whenever you have them.
*/

export const projects = [
  /* ===== Featured (big rows on /projects, cards on home) ===== */

  /* ---------- F.R.N.D. ---------- */
  {
    id: "frnd",
    featured: true,
    title: "F.R.N.D.",
    subtitle: "Field Relay Neighboring Data Points",
    category: "Embedded AI",
    year: "2026",
    tagline: "Nobody left in silence",
    status: "Hackathon build, IrvineHacks 2026",
    blurb:
      "An emergency chat network with no internet, no app and no account. A drone-carried hotspot connects phones to first responders, with an on-device LLM as backup.",
    description:
      "Field Relay Neighboring Data Points: an emergency chat network that needs no internet, no app and no account. A drone-carried Raspberry Pi turns any phone into a line to a first responder, and when no human is free, an LLM running on an Arduino Uno Q answers instead. Built in 3 days by a 4-person team for the Qualcomm sponsor track.",
    tags: ["Raspberry Pi", "Arduino Uno Q", "WebSockets", "Llama"],
    image: "/projects/drone-v1.webp",
    imageAlt: "Quadcopter with a GPS module and colored propellers on a cutting mat, next to a pencil and a quarter for scale",
    links: [
      { label: "Demo video", url: "" }, // add link later
      { label: "Source", url: "" }, // add link later
      { label: "Devpost", url: "" }, // add link later
    ],
    badges: ["IrvineHacks 2026", "Qualcomm track"],
    hero: {
      type: "flow",
      steps: ["Phone joins drone Wi-Fi", "Page opens, room ID assigned", "Pi relay picks a responder", "Human first responder"],
      note: "No human free: the Uno Q LLM answers instead",
      caption: "How a message finds its responder.",
    },
    article: [
      {
        body: [
          "When a wildfire or flood takes out the cell network, people lose the ability to reach help at the exact moment they need it. **Every emergency app assumes a connection that is already gone.**",
          "F.R.N.D. brings the network to the people. A Raspberry Pi on a drone creates an open Wi-Fi hotspot with NetworkManager (`nmcli`). A phone joins it, opens the page and types: **no app download, no account, no setup.** Each person gets a unique room ID automatically, so messages stay private between them and their responder, and 8 phones chatted at once in testing without crossing lines.",
          "The Pi tells its clients apart by URL path alone: phones connect to `/`, and the AI connects to `/arduino`. Relay logic forwards each message to whichever responder is available, and **a human first responder is always the first choice.**",
          "When no human is free, the Arduino Uno Q answers automatically, so **no one is left waiting in silence.** It runs our custom Llama model locally through yzma, calling it in-process with no external server. The Uno Q had gone on sale less than 5 months before the event ([release coverage](https://gigazine.net/gsc_news/en/20251008-qualcomm-acquire-arduino)), and its first reply arrived in about 4 seconds at 5 tokens per second.",
          "My part was the link between the network and the brain. I set up the WebSocket connection between the relay and the API, then learned Llama and Hugging Face to download our custom model onto the Uno Q. No quantization was needed: the 4 GB Uno Q holds the full model in LPDDR4 RAM, with 32 GB of eMMC storage for the weights.",
          "The drone is the delivery truck, not the product. Flying the hotspot covers a wide area with no ground setup, but the same Pi would work on a vehicle or a pole. **The engineering that matters is what happens after a phone connects.**",
        ],
      },
    ],
    highlights: [
      "Human first, AI second: the LLM only answers when no responder is free, so the model is a safety net, not the dispatcher",
      "One relay serves two kinds of clients, told apart by nothing more than a URL path (`/` for phones, `/arduino` for the AI)",
      "Room IDs are assigned on connect, so private conversations need no login",
      "No quantization needed: the 4 GB Uno Q holds the full custom Llama in RAM, and yzma runs it in-process with no model server to crash in the field",
      "Built for natural disasters, wildfire evacuations, search and rescue, and military operations",
    ],
    // yzma is a Go library: if your Uno Q code was written in Go, add "Go" here.
    builtWith: ["Arduino Uno Q", "Raspberry Pi", "Python", "Hugging Face", "Llama", "yzma", "WebSockets", "NetworkManager", "React"],
    footnote: "Team: Vrushang, Rachit, Steven and Ritvik",
  },

  /* ---------- Autonomous RC Rover ---------- */
  {
    id: "autonomous-rc-rover",
    featured: true,
    title: "Autonomous RC Rover",
    subtitle: "Custom PCB, sensor fusion, PD control",
    category: "Embedded · PCB",
    year: "2026",
    tagline: "A controller tuned by watching its own mistakes",
    status: "Complete, IEEE OPS capstone",
    blurb:
      "A self-steering rover on a 2-layer PCB I designed in KiCad, with a PD controller that fuses IR and ultrasonic distance. 90% obstacle avoidance in testing.",
    description:
      "A rover that steers around obstacles on its own, built as the capstone of IEEE at UCI's year-long embedded systems program. Five separate modules collapse onto one 2-layer PCB I designed in KiCad, and a PD controller on the ESP32 fuses IR and ultrasonic distance into a single steering signal. 90% obstacle avoidance in testing, with every gain earned from data, not guessed.",
    tags: ["ESP32", "KiCad", "C++", "PD control"],
    image: "/projects/rover-v1.webp",
    imageAlt: "",
    links: [
      { label: "Test-run video", url: "" }, // add link later
      { label: "Source", url: "" }, // add link later
      { label: "KiCad files", url: "" }, // add link later
    ],
    badges: ["90% avoidance", "2-layer PCB", "ESP32"],
    hero: {
      type: "flow",
      steps: ["Read IR + ultrasonic", "Fuse into one error", "PD controller", "PWM duty per motor", "L293D drives motors"],
      note: "The rover moves, and the next loop reads the sensors again",
      caption: "The control loop: 5 stages, 1 feedback path.",
    },
    article: [
      {
        body: [
          "A rover that works on a bench can fail on the floor. Breadboard prototypes are fragile: jumpers shake loose as the chassis vibrates, and long wires running past the motors pick up noise the sensors then read as distance. **A noisy distance reading is worse than none, because the rover swerves at walls that aren't there.**",
          "So the first decision was the board. I merged 5 separate modules (the ESP32, an L293D motor driver, IR and ultrasonic sensors, and power regulation) onto one 2-layer KiCad PCB. **A full ground plane gives motor current a short path home**, which keeps its noise off the sensor lines.",
          "The second decision was how to see. IR and ultrasonic sensors fail in opposite ways: IR struggles with dark or shiny surfaces, ultrasonic with soft or angled ones. The firmware fuses both into one distance error, so **one sensor's blind spot is covered by the other.**",
          "That error drives a PD loop. The P term reacts to how far off the rover is; the D term reacts to how fast that is changing and damps the swing. Think of P as the steering wheel and D as the hand that stops you from oversteering. The output becomes a PWM duty cycle for each motor through the L293D H-bridge.",
          "The gains weren't calculated. They were found. Every loop printed its error over serial, and I tuned Kp and Kd against those live traces: **too much P and the rover weaves, too little D and it overshoots into the wall.** Across 40+ timed 30-second runs, the collision rate fell from 90% to 10%.",
        ],
      },
    ],
    highlights: [
      "A ground plane is a noise fix, not a layout nicety: it shortens the path motor current takes home, away from the sensor traces",
      "Two cheap sensors beat one good one when they fail differently: IR misses dark surfaces, ultrasonic misses soft and angled ones",
      "The D term is a brake on the steering: it reacts to how fast the error changes, not how big it is",
      // Check: confirm this matches your real reasoning.
      "No integral term on purpose: dodging a wall doesn't require holding an exact distance, and I-term windup would only add lag",
      "Gains tuned against live serial traces over 40+ runs, cutting collisions from 90% to 10%",
    ],
    builtWith: ["C++", "ESP32", "KiCad", "L293D H-bridge", "IR sensor", "Ultrasonic sensor", "PWM", "PD control"],
    footnote: "Capstone of IEEE at UCI Open Project Space: 7 guided builds, then this one designed from scratch.",
  },

  /* ---------- IoT Weather Station ---------- */
  {
    id: "iot-weather-station",
    featured: true,
    title: "IoT Weather Station",
    subtitle: "ESP32, MQTT, Amazon MQ, 9x battery life",
    category: "IoT",
    year: "2026",
    tagline: "The fix for battery life wasn't a bigger battery",
    status: "Evolved from IEEE OPS Project 6",
    blurb:
      "A class radio project rebuilt as a cloud-connected ESP32 node publishing to Amazon MQ, with battery life stretched from 3 days to 4 weeks.",
    description:
      "A class radio project grown into a cloud-connected sensor node. It started as two Arduino Nanos, a DHT11 and an NRF24 radio printing to an LCD. I rebuilt it on an ESP32 that publishes over MQTT to an Amazon MQ broker, and made the same battery last 4 weeks instead of 3 days.",
    tags: ["ESP32", "MQTT", "Amazon MQ", "Low power"],
    image: "/projects/weather-v1.webp",
    imageAlt: "",
    links: [
      { label: "Source", url: "" }, // add link later
      { label: "Dashboard screenshot", url: "" }, // add link later
    ],
    badges: ["9x battery life", "under 2 s to dashboard", "Amazon MQ"],
    hero: {
      type: "compare",
      columns: [
        {
          title: "OPS Project 6",
          items: ["2 Arduino Nanos", "DHT11 + light sensor", "NRF24 radio link", "LCD over I2C", "Data stays in the room"],
        },
        {
          title: "The rebuild",
          items: ["1 ESP32", "DHT11", "MQTT over TLS to Amazon MQ", "Live dashboard, under 2 s", "Deep sleep: 4 weeks per battery"],
        },
      ],
      caption: "Same sensor, new reach.",
    },
    article: [
      {
        body: [
          "It began as Open Project Space Project 6. An outdoor Arduino Nano read a DHT11 and a light sensor every 10 seconds, then radioed the report over an NRF24 to an indoor Nano, which printed it on an LCD over I2C. One build, three protocols: single-wire to the sensor, SPI to the radio, I2C to the display. **But the data never left the room.**",
          "After earning the AWS Certified Solutions Architect Associate, I wanted to use it on hardware. I moved the node to an ESP32 and replaced the radio link with MQTT. Each reading is published to an Amazon MQ broker running the ActiveMQ engine, which accepts MQTT over TLS on port 8883 ([AWS docs](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/general.html)), and a dashboard subscribes to it. **A managed broker meant no server of my own to patch**, and readings reach the dashboard in under 2 seconds.",
          "The first battery version died in 3 days. An ESP32 left awake with Wi-Fi on burns power every second, even though a reading takes a fraction of one. **The battery wasn't too small. The board was awake for no reason.**",
          "Before it could sleep, it had to stop misbehaving. Sensor timing faults could hang a read and keep the chip awake, so they had to be isolated first.",
          "Then came the duty cycle: wake on a timer, read the DHT11, connect, publish to Amazon MQ, and drop into deep sleep until the next reading. In deep sleep the ESP32 draws microamps instead of the tens of milliamps it pulls awake, so nearly all of its life is spent asleep. Runtime went from 3 days to 4 weeks, about 9 times longer, on the same battery.",
        ],
        diagram: {
          type: "flow",
          steps: ["Wake on timer", "Read DHT11", "Connect Wi-Fi", "Publish to Amazon MQ"],
          note: "Deep sleep for the rest of the cycle, then wake again",
          caption: "4 awake steps take seconds. Deep sleep fills the rest, which is where the 9x comes from.",
        },
      },
    ],
    highlights: [
      "9x battery life with no new hardware: the fix was the schedule, not the battery",
      "Within Amazon MQ, only the ActiveMQ engine speaks MQTT, so the engine choice decided whether the ESP32 could publish to the broker directly",
      "One sensor node, three protocols in its first life: single-wire to the DHT11, SPI to the NRF24 radio, I2C to the LCD",
      "Timing faults fixed before sleep was added, because a board that hangs on a bad read can never get back to sleep",
      "Under 2 seconds from sensor read to dashboard over MQTT",
    ],
    builtWith: ["ESP32", "C++", "MQTT", "Amazon MQ (ActiveMQ)", "DHT11", "Arduino Nano", "NRF24L01", "I2C LCD"],
    footnote:
      "Started as IEEE at UCI Open Project Space Project 6; the ESP32 rebuild, cloud link and power work are my own.",
  },

  /* ===== More work (small gallery on /projects) ===== */

  /* ---------- This website ---------- */
  {
    id: "ritviksingh-net",
    featured: false, // set to true to show it in the big rows instead
    title: "ritviksingh.net",
    subtitle: "This site: spec-driven, AI-written, human-verified",
    category: "Web",
    year: "2026",
    tagline: "The spec the AI wasn't allowed to break",
    status: "Live",
    blurb:
      "This site: a 7-page React portfolio built by directing Claude and Cursor against a written spec. 100 in all four Lighthouse categories.",
    description:
      "A 7-page React portfolio built in 3 to 4 weeks by directing Claude and Cursor against a written spec, scoring 100 in all four Lighthouse categories. Every feature branch passed a production build before it merged. The AI wrote the code; it never got to make a decision.",
    tags: ["React", "Vite", "Firebase", "Cloudflare"],
    image: "/og-image.png",
    imageAlt: "Preview card for ritviksingh.net",
    links: [
      { label: "Live site", url: "https://ritviksingh.net" },
      { label: "Source", url: "https://github.com/ritviks123/my-website" },
    ],
    badges: ["Lighthouse 100 · 100 · 100 · 100", "about $10/year"],
    hero: {
      type: "flow",
      steps: ["Write the spec", "AI writes the code", "I check it", "Build + preview", "Merge by PR"],
      note: "Next feature: new branch, same spec",
      caption: "The build loop, repeated for every feature.",
    },
    article: [
      {
        body: [
          "Ask an AI for a website one prompt at a time and you get a collage. Each answer is reasonable on its own, and no two pages agree on a color, a spacing or a hover rule. **The AI isn't wrong. It just has no memory of what it promised.**",
          "So before any code, I wrote the spec. It pinned the environment (Windows, PowerShell, Vite, React Router v8), exact color tokens, fonts, breakpoints, hover rules and class names. It also listed **locked decisions the AI was told never to undo**, plus process rules: one branch per feature, a production build before every merge, and a checklist after every step.",
          "The first weeks went to deciding, not building. I weighed hosting, frameworks, page structure and layout, and at every fork the AI's job was to lay out options and trade-offs. I made the calls: Vite over Create React App, Firebase Hosting, Web3Forms over Firebase for the contact form.",
          "The hero had one job: **show that the same person designs the hardware and writes the software.** So it's a circuit board drawn in code, with signal pulses running along its traces. Beside it, a serial monitor types a boot log one character at a time, the way a microcontroller talks over UART.",
          "The bugs were the honest part. A finished footer vanished because I pulled `main` before its pull request had actually merged. **The hero image that \"wouldn't load\" had never existed**: the server was quietly answering with the app's own 404 page. The domain refused to verify because the IP sat in the DNS Name field instead of the value. All six fixes are written up below.",
          "It ships for about $10 a year, and the domain is the only cost. The repo holds **42 commits across 8 feature branches**, each merged through a pull request. The AI wrote most of the code; the spec, every decision and every check were mine, and I can walk through how any part of it works.",
        ],
      },
      {
        heading: "All six corrections",
        table: {
          columns: ["Problem", "Cause", "Fix"],
          rows: [
            ["Footer vanished after a merge", "Pulled `main` before the PR merged", "Merged the PR, rebuilt the branch from the updated `main`"],
            ["Article pages were unstyled", "Their CSS was overwritten during an earlier file swap", "Found it with a project-wide search, restored and reorganized the stylesheets"],
            ["Hero image was broken", "The file never existed; the server returned the app's 404 page", "Recreated the image at the right path"],
            ["Underlines kept showing on hover", "A global `a:hover` rule overrode component styles", "Removed it, set one hover rule site-wide"],
            ["Domain wouldn't verify", "IP typed into the DNS Name field, Cloudflare proxy on", "`@` as the name, IP as the value, DNS only"],
            ["Deploys looked delayed", "Browser caching", "Added Cache-Control headers"],
          ],
        },
      },
    ],
    highlights: [
      "A missing file can fail without an error: the host answered the \"broken\" hero request with the app's own 404 page, so the bug looked like an image problem and was really a path problem",
      "Locked decisions beat clever prompts: telling the AI what it may never undo kept 7 pages consistent across weeks of separate sessions",
      "A pull request can look merged when it isn't: pulling `main` too early made a finished footer disappear",
      "Domain verification hinged on one field: the IP belongs in the record's value, not its name, with the Cloudflare proxy off",
      "Pages always revalidate while build files cache for a year, so a deploy shows up at once without slowing repeat visits",
      "SPF and DMARC records stop anyone from sending email that pretends to come from the domain",
    ],
    builtWith: ["React", "Vite", "React Router v8", "CSS", "Firebase Hosting", "Cloudflare DNS", "Web3Forms", "GitHub", "Claude", "Cursor"],
    footnote: "",
  },
];