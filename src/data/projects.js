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
    id: "frnd", // URL slug: never change
    featured: true,
    title: "F.R.N.D.",
    subtitle: "Field Relay Neighboring Data Points",
    category: "Edge AI · Networking",
    year: "2026",
    description:
      "An emergency chat network that works with no internet. A drone-carried hotspot connects any phone to a first responder, and an on-device LLM answers when no one is free.",
    // Same text as description, kept in case the home card still reads "blurb"
    blurb:
      "An emergency chat network that works with no internet. A drone-carried hotspot connects any phone to a first responder, and an on-device LLM answers when no one is free.",
    tags: ["Arduino Uno Q", "Raspberry Pi", "Python", "WebSockets", "llama.cpp"],

    role: "Edge AI + WebSocket link",
    team: "4 people",
    timeline: "48 hours",
    status: "Hackathon build",
    links: [
      { label: "Demo video", url: "https://www.youtube.com/watch?v=904H0sNUbPI" },
      { label: "Source", url: "https://github.com/vrushang1234/FRND" },
      { label: "Devpost", url: "https://devpost.com/software/frnd-field-neighbouring-relay-data-points" },
      { label: "Slides", url: "https://docs.google.com/presentation/d/1QBHZ0s09G_UWO0ZNscJArog1P4YoSNdYSzVraIYA6kE/edit?usp=sharing" },
    ],

    image: "/projects/drone-v1.webp",
    imageAlt: "Quadcopter with a GPS module and colored propellers on a cutting mat, next to a pencil and a quarter for scale",
    imageCaption: "A lightweight 4-motor quadcopter carries each relay node.",
    media: [
      { src: "/projects/EECS_drone.webp", alt: "The quadcopter from the UCI drone course", caption: "The drone that carries the relay node." },
      { src: "/projects/networkspace.webp", alt: "Diagram from our pitch: phones connect over WebSockets to a mesh of drone relays, which route to a first responder or the Uno Q LLM", caption: "The network as we pitched it at IrvineHacks 2026." },
    ],

    stats: [
      { value: "48 h", label: "idea to demo" },
      { value: "135M", label: "parameter model on the board" },
      { value: "4-bit", label: "quantized weights" },
      { value: "0", label: "apps or accounts needed" },
    ],

    heroAt: 2,
    hero: {
      type: "flow",
      steps: ["Phone joins drone Wi-Fi", "Gets a private room ID", "Pi relay routes the message", "First responder answers"],
      note: "No responder free: the Uno Q LLM answers, and the history waits for the human",
      caption: "How a message finds help.",
    },
    article: [
      {
        body: [
          "When a wildfire, flood or earthquake takes out the cell network, people lose the ability to reach help at the exact moment they need it. **Every emergency app assumes a connection that is already gone.**",
          "F.R.N.D. brings the network with it. Drones carry Raspberry Pis that each run an open Wi-Fi access point with NetworkManager (`nmcli`), and the Pis link into a mesh. A phone joins, opens a page and types: **no app, no account, no setup.** Each person gets a room ID automatically, so their conversation stays private.",
          "The drone is the delivery truck, not the product. Ours was a lightweight 4-motor quadcopter Vrushang built for a UCI drone course, but the same Pi would work on a truck or a pole. **What matters is what happens after a phone connects.**",
        ],
      },
      {
        heading: "The relay",
        body: [
          "Each Pi runs a Python WebSocket server built on `websockets` and `asyncio`, so several people and responders can talk at once. It tells its clients apart by URL path alone, and **a human first responder always gets the message first.** Responders see the chat only, with no camera feed from the drone.",
        ],
        table: {
          columns: ["Client", "Connects to", "Role"],
          rows: [
            ["Phone", "`/`", "Person in need, gets a private room"],
            ["Arduino Uno Q", "`/arduino`", "AI backup when no responder is free"],
          ],
        },
      },
      {
        heading: "The AI on the board",
        body: [
          "When no responder is free, the Arduino Uno Q answers so **no one is left in silence.** It runs SmolLM2-135M-Instruct from Hugging Face, quantized to 4-bit weights, through [yzma](https://github.com/hybridgroup/yzma), a Go wrapper for llama.cpp that calls the model in-process. No cloud and no model server: inference runs on the board's own Arm CPU.",
          "The prompt makes it act like a dispatcher. It keeps the person calm, asks where they are and what's happening, flags urgent cases, and gathers details like injuries and how many people are with them. **The chat doubles as a handoff:** when a first responder takes over, the whole history is already there.",
        ],
      },
      {
        heading: "My part",
        body: [
          "I owned the AI node. I researched the Uno Q (the 4 GB version), got yzma and the model running on it, and wrote the prompts that turn a general chat model into a calm first contact. Then I wired the board into the Pi relay over WebSockets so it could take over any conversation. I also helped write our Devpost and README.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "Getting yzma onto the Uno Q. The board was new and it was our first time using it, so I learned by studying how other builders had run models on it, then read up on how WebSockets work until the board could join the relay like any other client. **Under the drone and the AI, the whole project is one idea done carefully: a WebSocket connection.**",
          "We had one drone, so the demo ran a single relay node, and every feature worked: auto-replies, urgency flags and information gathering. **The mesh scales by adding Pis**, but we never measured how many phones one node can hold. That's the first test I'd run next.",
        ],
      },
    ],

    highlights: [
      "Human first, AI second: model is a safety net to ensure every connection is attended to",
      "One relay, two kinds of clients, told apart by URL path alone (`/` for phones, `/arduino` for the AI)",
      "A 135M-parameter, 4-bit model answers on a 4 GB board with no internet",
      "The chat history doubles as a handoff, so the responder reads what the AI already learned",
      "Works on any phone with Wi-Fi: no app, no account, no setup",
    ],
    builtWith: ["Arduino Uno Q", "Raspberry Pi", "Python", "asyncio", "WebSockets", "yzma", "llama.cpp", "SmolLM2", "Hugging Face", "Go", "NetworkManager", "JavaScript", "HTML", "CSS", "GitHub"],
    footnote: "Built at IrvineHacks 2026 (Qualcomm track) by Vrushang, Rachit, Steven and Ritvik.",
  },

  /* ---------- RC Rover ---------- */
  {
    id: "autonomous-rc-rover", // URL slug + thumbnail key: never change
    featured: true,
    title: "RC Rover",
    subtitle: "Joystick remote on a custom PCB, with an obstacle-avoiding auto mode",
    category: "PCB · Embedded",
    year: "2026",
    description:
      "A rover driven by a joystick remote over ESP-NOW, with a custom KiCad PCB and a button that flips it into an auto mode that scans for the clearest path.",
    // Same text as description, kept in case the home card still reads "blurb"
    blurb:
      "A rover driven by a joystick remote over ESP-NOW, with a custom KiCad PCB and a button that flips it into an auto mode that scans for the clearest path.",
    tags: ["ESP32-C3", "ESP-NOW", "KiCad", "C++", "Ultrasonic"],

    role: "Everything: PCB, firmware, build",
    team: "Solo",
    timeline: "3 to 4 weeks",
    status: "Complete",
    links: [
      { label: "Test video", url: "" }, // paste the YouTube link here (empty = hidden)
      { label: "Source", url: "https://github.com/ritviks123/RC-Rover" },
    ],
    image: "/projects/rover-v1.webp",
    imageAlt: "The rover on a wooden chassis: an ultrasonic sensor in a purple 3D-printed mount up front, a breadboard with the ESP32-C3 and L293D, and two yellow gearbox wheels",
    imageCaption: "The rover: one ultrasonic sensor up front, everything else on a breadboard.",
    media: [
      {
        src: "/projects/rover-top-v1.webp",
        alt: "Top-down view of the rover's breadboard: ESP32-C3, L293D motor driver, buzzer, and jumper wires running to the sensor and motors",
        caption: "From above: the ESP32-C3 at the back, the L293D H-bridge in the middle, the buzzer beside it.",
      },
      {
        src: "/projects/rover-remote-v1.webp",
        alt: "The finished remote: an analog joystick module plugged into the edge of a green custom PCB, with a red LED, a green LED and an ESP32-C3 board soldered on",
        caption: "The remote, built on my PCB. The joystick plugs into a header on the board's edge.",
      },
      {
        src: "/projects/rover-pcb-v1.webp",
        alt: "The bare green PCB as it arrived from the manufacturer, before any parts were soldered",
        caption: "The board as it arrived from the fab, before soldering.",
      },
      {
        src: "/projects/rover-kicad-v1.webp",
        alt: "KiCad PCB layout of the remote: red front traces, blue back copper, the ESP32-C3 footprint, joystick header J1, and two LED and resistor pairs",
        caption: "The layout in KiCad: two copper layers, the joystick header J1 at the top edge.",
      },
      {
        src: "/projects/rover-schematic-v1.webp",
        alt: "KiCad schematic: an ESP32-C3 core board with the joystick on IO0, IO1 and IO3, and two LEDs through resistors on IO8 and IO10",
        caption: "The schematic: joystick on IO0, IO1 and IO3, status LEDs on IO8 and IO10.",
      },
    ],

    stats: [
      { value: "25 cm", label: "auto mode backs off" },
      { value: "8", label: "directions scanned" },
      { value: "50 ms", label: "between joystick packets" },
      { value: "200 / 160", label: "motor trim (PWM)" },
    ],

    heroAt: 2,
    hero: {
      type: "flow",
      steps: ["Measure distance ahead", "Under 25 cm: beep, back up", "Turn in 8 steps, measure each", "Face the clearest path", "Drive forward"],
      note: "Every direction under 15 cm: back up further and scan again",
      caption: "Auto mode, one loop.",
    },
    article: [
      {
        body: [
          "The capstone of IEEE at UCI's Open Project Space: a rover you drive with a joystick, where the remote runs on a PCB you design and have manufactured yourself. I built it solo in 3 to 4 weeks, then went past the spec. **One press of the joystick button turns it into a rover that finds its own way around obstacles.**",
          "Two ESP32-C3 boards do the talking. The remote sends the joystick's position over **ESP-NOW**, a direct board-to-board Wi-Fi link with no router in between, and the rover turns each packet into motor commands through an L293D H-bridge.",
        ],
      },
      {
        heading: "The remote",
        body: [
          "The remote is the part that had to be a real board. I drew the schematic and laid out the PCB in KiCad to the manufacturer's design rules, then ordered it. The joystick plugs into a header on the board's edge, and two LEDs show what the rover is doing: **red when it's idle, green when it's moving or driving itself.**",
          "Every 50 ms the remote reads the joystick, scales each axis to one byte, and sends a packet. A deadzone around the joystick's real resting point (209 and 217 on mine, not the middle) keeps the rover from creeping when nobody's touching it.",
        ],
      },
      {
        heading: "Auto mode",
        body: [
          "The rover sees with one ultrasonic sensor. While the way is clear past 25 cm, it drives forward. Closer than that, it stops, beeps and backs up to give itself room. Then it turns in 8 short steps, measuring at each one, and heads for the clearest. **One sensor can't look everywhere, so the rover turns the sensor instead.**",
          "Press the button again and you're driving instantly, even mid-scan. Every wait in auto mode checks the button every 10 ms instead of freezing the board, so the rover never ignores you.",
        ],
      },
      {
        heading: "My part",
        body: [
          "Everything, solo: the remote's schematic and PCB layout, ordering the board, wiring the rover, and both sketches. The ESP-NOW link runs on a library I didn't write (WiFiConfig); everything built on top of it is mine.",
          "I met every capstone requirement, then added more: a **deeper obstacle algorithm** than the spec asked for, a **backup beeper** like a reversing truck, and the mode LEDs on the remote.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "Debugging auto mode. The logic was simple on paper, but on the floor the rover wouldn't drive straight, so every scan and every 'forward' drifted off course. The cause wasn't the code: **the two motors weren't equally efficient.** Same PWM, different speeds.",
          // Check: confirm this matches what you actually tuned.
          "I trimmed them by testing until it tracked straight: one motor runs at 200 out of 255, the other at 160. Then I tuned how long each scan step turns and how far it backs up, until the rover could pick a path and hold it.",
        ],
      },
    ],

    highlights: [
      "One sensor, eight looks: the rover turns to scan instead of adding more sensors",
      "Never stuck in auto: every wait checks the button every 10 ms, so the joystick takes over instantly",
      "Same PWM isn't same speed: trimming the motors to 200 and 160 made it drive straight",
      "A deadzone around the joystick's real resting point stops the rover creeping",
      "ESP-NOW links the two boards directly, with no router",
    ],
    builtWith: ["ESP32-C3", "ESP-NOW", "C++", "Arduino IDE", "KiCad", "L293D H-bridge", "Ultrasonic sensor", "PWM", "Analog joystick"],
    footnote: "Capstone project for IEEE at UCI Open Project Space.",
  },

    /* ---------- IoT Weather Station ---------- */
  {
    id: "iot-weather-station", // URL slug + thumbnail key: never change
    featured: true,
    title: "IoT Weather Station",
    subtitle: "Two ESP32s, an LCD, and a cloud link in progress",
    category: "IoT · Embedded",
    year: "2026",
    description:
      "A two-board ESP32 weather station that reports temperature, humidity and daylight every 10 seconds. Next step: sending it to AWS so anyone can see it live.",
    // Same text as description, kept in case the home card still reads "blurb"
    blurb:
      "A two-board ESP32 weather station that reports temperature, humidity and daylight every 10 seconds. Next step: sending it to AWS so anyone can see it live.",
    tags: ["ESP32-C3", "ESP-NOW", "I2C", "AHT20", "C++"],

    role: "Everything, solo",
    team: "Solo",
    timeline: "Ongoing",
    status: "In progress: cloud link",
    links: [
      { label: "Source", url: "" }, // paste the GitHub repo link here (empty = hidden)
    ],

    image: "/projects/weather-tx-v1.webp",
    imageAlt: "The transmitter: an ESP32-C3 on a breadboard with an AHT20 temperature and humidity sensor and a photoresistor",
    imageCaption: "The transmitter: reads the sensors and sends a report every 10 seconds.",
    media: [
      {
        src: "/projects/weather-rx-v1.webp",
        alt: "The receiver: an ESP32-C3 on a breadboard wired to a 16x2 LCD showing temperature, humidity and day or night",
        caption: "The receiver: shows the latest report on a 16x2 LCD.",
      },
    ],

    stats: [
      { value: "10 s", label: "between reports" },
      { value: "3", label: "readings per report" },
      { value: "2", label: "ESP32 boards" },
    ],

    heroAt: 2,
    hero: {
      type: "compare",
      columns: [
        { title: "Today", items: ["AHT20 + photoresistor on an ESP32", "ESP-NOW to a second ESP32", "16x2 LCD", "Data stays in the room"] },
        { title: "Next", items: ["Same sensor station", "MQTT to a broker on AWS", "Live public dashboard", "Anyone can see it"] },
      ],
      caption: "Where it is, and where it's going.",
    },
    article: [
      {
        body: [
          "A two-board weather station: an outdoor ESP32 reads temperature, humidity and light every 10 seconds and sends a report to an indoor ESP32, which shows it on an LCD. It started as Project 6 of IEEE at UCI's Open Project Space, and I'm now taking it past the course.",
          "**The goal: readings anyone can see on a public dashboard, not just whoever is standing next to the screen.**",
        ],
      },
      {
        heading: "The station",
        body: [
          "The transmitter reads an AHT20 temperature and humidity sensor over I2C and a photoresistor on an analog pin, where a reading above 2000 (out of 4095) counts as day. It packs all three into one report and sends it over **ESP-NOW**, a direct board-to-board Wi-Fi link with no router in between.",
          "The receiver keeps the latest report and redraws its 16x2 LCD every 10 seconds, also over I2C: temperature and humidity on the top line, day or night on the bottom.",
        ],
      },
      {
        heading: "Next: the cloud",
        body: [
          "Right now the data stops at the LCD. The plan is for the transmitter to publish each report over **MQTT**, a lightweight publish/subscribe protocol built for small devices, to a broker on AWS. A dashboard subscribes to it and shows live readings to anyone.",
          "I'm researching Amazon MQ for the broker and how to connect an ESP32 to it securely. This section will grow as the cloud link comes together.",
        ],
      },
      {
        heading: "My part",
        body: [
          "Everything, solo. I built both stations, wrote both sketches, and met every Project 6 requirement: readings every 10 seconds, sent the moment they're taken, shown on the LCD exactly as sent.",
          "The ESP-NOW link runs on a library I didn't write (WiFiConfig). The cloud extension is my own work, beyond what the course asked for.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "AWS. Wiring sensors is familiar ground; cloud infrastructure is not. A broker, credentials, certificates and permissions all have to line up before a single reading arrives, and each piece has its own settings to get right.",
          "**I'm still working through it.** This article will be updated when the first reading reaches the cloud.",
        ],
      },
    ],

    highlights: [
      "One I2C bus per board: the AHT20 on the transmitter, the LCD on the receiver",
      "Day or night from a single analog read: above 2000 out of 4095 is day",
      "ESP-NOW links the boards directly, with no router",
      "Next up: MQTT to AWS so the readings leave the room",
    ],
    builtWith: ["ESP32-C3", "C++", "Arduino IDE", "ESP-NOW", "AHT20", "Photoresistor", "I2C", "16x2 LCD"],
    footnote: "Started as Project 6 of IEEE at UCI Open Project Space.",
  },

  /* ===== More work (small gallery on /projects) ===== */

    /* ---------- This website ---------- */
  {
    id: "ritviksingh-net", // URL slug + thumbnail key: never change
    featured: false, // set to true to show it in the big rows instead
    title: "ritviksingh.net",
    subtitle: "Designed like a circuit board, built by directing Claude",
    category: "Web · React",
    year: "2026",
    description:
      "This portfolio, drawn like a circuit board and built in 3 weeks by directing Claude against a written spec. The traces between cards are computed live from the page.",
    // Same text as description, kept in case the home card still reads "blurb"
    blurb:
      "This portfolio, drawn like a circuit board and built in 3 weeks by directing Claude against a written spec. The traces between cards are computed live from the page.",
    tags: ["React", "Vite", "Firebase", "Cloudflare", "Claude"],

    role: "Spec, design decisions, QA",
    team: "Solo, directing Claude",
    timeline: "3 weeks",
    status: "Live",
    links: [
      { label: "Live site", url: "https://ritviksingh.net" },
      { label: "Source", url: "https://github.com/ritviks123/my-website" },
    ],

    image: "/projects/site-home-v1.webp",
    imageAlt: "The ritviksingh.net homepage: a black chip with copper pins showing the name Ritvik Singh, with circuit traces running across a green board",
    imageCaption: "The homepage: the name lives inside a chip, and the board's traces run from it down the page.",
    media: [
      { src: "/projects/site-projects-v1.webp", alt: "The Projects page: project cards as chips, connected by computed wiring", caption: "Projects: every card is a chip, wired to its neighbors." },
      { src: "/projects/site-article-v1.webp", alt: "A project article: spec strip, photo carousel, key numbers, and sections as chips in a two-column grid", caption: "An article page: sections become chips in a 2-column grid." },
      { src: "/projects/site-work-v1.webp", alt: "The Work page: job, education and certification chips", caption: "Work: experience and education as chips." },
      { src: "/projects/site-about-v1.webp", alt: "The About page: photo, bio and now chips", caption: "About." },
      { src: "/projects/site-resume-v1.webp", alt: "The Resume page: a download button and the resume PDF inside a chip", caption: "Resume: the PDF sits inside its own chip." },
      { src: "/projects/site-phone-v1.webp", alt: "The site on a phone: chips stacked in one column with no wiring", caption: "On a phone: the wiring switches off and chips stack cleanly." },
    ],

    stats: [
      { value: "3 wk", label: "start to live" },
      { value: "7", label: "page templates" },
      { value: "~$10", label: "per year, just the domain" },
      { value: "1", label: "spec every chat starts from" },
    ],

    heroAt: 2,
    hero: {
      type: "flow",
      steps: ["Write the spec", "Claude lays out options", "I make the call", "Claude writes one step", "I test, then commit"],
      note: "Next feature: new branch, fresh chat, same spec",
      caption: "The loop behind every feature on this site.",
    },
    article: [
      {
        body: [
          "This site is my portfolio, drawn like a circuit board. Every card is a chip with copper pins, and the traces between them are computed from where the chips actually sit on the page. **The goal was a design you remember, one that says hardware before you read a word.**",
          "I built it in about 3 weeks by directing Claude. Claude wrote most of the code; I wrote the spec, made every design call, and tested every change before it shipped. **The real engineering wasn't any one component. It was the system for getting an AI to build what I actually meant.**",
        ],
      },
      {
        heading: "The board",
        body: [
          "The chips are plain HTML. One stylesheet turns existing cards into chip packages and draws their pins in CSS, so no extra markup is needed. The wiring is a single SVG behind the page: code measures every chip, works out where its pins are, and routes traces between neighbors with 45° jogs and vias, skipping any route that would cross text.",
          "Wires draw in only once the chips they connect have scrolled into view, and they re-measure whenever the page resizes or fonts load. **Every screen was planned:** below 900px the wiring switches off and the chips stack cleanly, so phones get a fast, readable page instead of a squeezed circuit.",
        ],
      },
      {
        heading: "Shipping it",
        body: [
          "It's a Vite + React app on Firebase Hosting, with the domain registered and served through Cloudflare. Pages always revalidate while built files cache for a year, so a deploy shows up at once without slowing repeat visits. **The only cost is the domain: about $10 a year.**",
          "Security got the same care as design: security headers on every response, SPF and DMARC records so nobody can send email pretending to be the domain, two-factor on every account, and the contact form's key kept in a local env file that never reaches GitHub.",
        ],
      },
      {
        heading: "My part",
        body: [
          "I owned every decision. Before any code, I wrote the spec: the environment (Windows, PowerShell, Vite, React Router), exact color tokens, fonts, breakpoints, hover rules, class naming, and a list of **locked decisions Claude was never allowed to undo.**",
          "At every fork, Claude's job was to lay out options and trade-offs; mine was to choose. Every change went on its own branch, passed a production build, and merged through a pull request after I'd checked it on real devices.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "Getting Claude to do what I meant across weeks of long chats. Long chats drift: answers grow and early rules fade. So I wrote **handoff docs** that set how Claude must reply (one step at a time, exact Find/Replace blocks, a short checklist) and opened every new chat with one, so a fresh session picked up exactly where the last left off.",
          "I also kept the work **modular**, with a separate chat for each part of the site (layout, content, each article), so every change had a place to trace back to. The two real problems were design balance (how much circuit before it fights the content; the homepage ended up deliberately simpler than the inner pages) and the domain, which refused to verify until I found the IP typed into the DNS record's name instead of its value.",
        ],
      },
    ],

    highlights: [
      "A spec beats a clever prompt: every chat starts from the same rules, so weeks of separate sessions still agree",
      "One chat per part of the site, so every change has a place to trace back to",
      "Wires are computed, not drawn: they re-measure on resize, font load and scroll so they always land on a pin",
      "Built for every screen: wiring turns on at 900px, phones get clean stacked chips",
      "SPF and DMARC records stop anyone sending email as the domain",
      "The domain came down to one field: the IP belongs in the record's value, not its name",
    ],
    builtWith: ["React", "Vite", "React Router", "CSS", "SVG", "Firebase Hosting", "Cloudflare", "Web3Forms", "GitHub", "Claude"],
  },
];


/* ===== Home page grid: which projects, in what order (2 per row) ===== */
export const homeProjectIds = ['frnd', 'autonomous-rc-rover', 'iot-weather-station', 'ritviksingh-net'];