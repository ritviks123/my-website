export const projects = [
  /* ===== Featured (big rows on /projects, cards on home) ===== */
  {
    id: 'pcb-power-supply',
    featured: true,
    title: 'Variable Bench Power Supply',
    subtitle: 'Adjustable voltage, current limiting, custom PCB',
    category: 'Circuitry',
    year: '2025',
    blurb:
      'A benchtop supply with adjustable voltage and current limiting, designed from schematic through fabricated PCB.',
    description:
      'Two or three sentences for the projects page: what it is, the design choices that make it interesting, and the result. This is longer than the blurb on the home card.',
    tags: ['KiCad', 'Analog Design', 'PCB', 'LTspice', 'Soldering'],
    image: '',
    imageAlt: '',
    repo: 'https://github.com/ritviks123',
    live: '',
    article: [
      {
        heading: 'Overview',
        body: ['What the project is and why you built it.'],
      },
      {
        heading: 'How it works',
        body: ['The main blocks of the circuit, the key parts, and how they connect.'],
      },
      {
        heading: 'Challenges',
        body: ['What went wrong, how you debugged it, and what fixed it.'],
      },
      {
        heading: 'Results',
        body: ['What it can do now, with numbers if you have them.'],
      },
    ],
  },
  {
    id: 'embedded-sensor-logger',
    featured: true,
    title: 'Embedded Sensor Logger',
    subtitle: 'Low-power data logging on STM32',
    category: 'Embedded',
    year: '2025',
    blurb:
      'A microcontroller-based data logger that samples sensor readings and writes them to storage for later analysis.',
    description:
      'Two or three sentences: what it measures, how the firmware is structured, and what the data showed.',
    tags: ['C', 'STM32', 'I2C', 'SPI', 'FreeRTOS'],
    image: '',
    imageAlt: '',
    repo: '',
    live: '',
    article: [
      {
        heading: 'Overview',
        body: ['What it logs, and the problem it solves.'],
      },
      {
        heading: 'How it works',
        body: ['Sensors, microcontroller, storage, and how data flows between them.'],
      },
    ],
  },
  {
    id: 'placeholder-software',
    featured: true,
    title: 'Your Software Project',
    subtitle: 'One-line hook for the project',
    category: 'Software',
    year: '2024',
    blurb: 'One or two sentences on what it does and what problem it solved.',
    description:
      'Two or three sentences: who it is for, how it works, and what makes it useful.',
    tags: ['Python', 'Tool'],
    image: '',
    imageAlt: '',
    repo: '',
    live: '',
    article: [
      {
        heading: 'Overview',
        body: ['What the tool does and who it is for.'],
      },
    ],
  },

  /* ===== More work (small gallery on /projects) ===== */
  {
    id: 'small-project-one',
    featured: false,
    title: 'Small Project One',
    subtitle: 'Short hook',
    category: 'Circuitry',
    year: '2024',
    blurb: 'One sentence about this smaller build.',
    tags: ['Breadboard'],
    image: '',
    imageAlt: '',
    repo: '',
    live: '',
    article: [{ heading: 'Overview', body: ['A short write-up.'] }],
  },
  {
    id: 'small-project-two',
    featured: false,
    title: 'Small Project Two',
    subtitle: 'Short hook',
    category: 'Embedded',
    year: '2024',
    blurb: 'One sentence about this smaller build.',
    tags: ['Arduino'],
    image: '',
    imageAlt: '',
    repo: '',
    live: '',
    article: [{ heading: 'Overview', body: ['A short write-up.'] }],
  },
  {
    id: 'small-project-three',
    featured: false,
    title: 'Small Project Three',
    subtitle: 'Short hook',
    category: 'Software',
    year: '2023',
    blurb: 'One sentence about this smaller build.',
    tags: ['Script'],
    image: '',
    imageAlt: '',
    repo: '',
    live: '',
    article: [{ heading: 'Overview', body: ['A short write-up.'] }],
  },
];