export const projects = [
  {
    id: 'pcb-power-supply',
    title: 'Variable Bench Power Supply',
    category: 'Circuitry',
    year: '2025',
    blurb:
      'A benchtop supply with adjustable voltage and current limiting, designed from schematic through fabricated PCB.',
    tags: ['KiCad', 'Analog Design', 'PCB'],
    image: '',
    imageAlt: '',
    repo: 'https://github.com/ritviks123',
    article: [
      {
        heading: 'Overview',
        body: [
          'What the project is and why you built it. One or two short paragraphs.',
        ],
      },
      {
        heading: 'How it works',
        body: [
          'The main blocks of the circuit, the key parts, and how they connect.',
          'Add a second paragraph like this one if you need it.',
        ],
      },
      {
        heading: 'Challenges',
        body: [
          'What went wrong, how you debugged it, and what fixed it. Recruiters love this section.',
        ],
      },
      {
        heading: 'Results',
        body: [
          'What it can do now, with numbers if you have them (voltage range, current limit, ripple).',
        ],
      },
    ],
  },
  {
    id: 'embedded-sensor-logger',
    title: 'Embedded Sensor Logger',
    category: 'Embedded',
    year: '2025',
    blurb:
      'A microcontroller-based data logger that samples sensor readings and writes them to storage for later analysis.',
    tags: ['C', 'STM32', 'I2C'],
    image: '',
    imageAlt: '',
    repo: '',
    article: [
      {
        heading: 'Overview',
        body: ['What it logs, and the problem it solves.'],
      },
      {
        heading: 'How it works',
        body: [
          'Sensors, the microcontroller, the storage, and how data flows between them.',
        ],
      },
      {
        heading: 'Challenges',
        body: ['Timing, bus errors, power, or anything else you had to solve.'],
      },
      {
        heading: 'Results',
        body: ['Sample rate, accuracy, battery life, or a chart of real data.'],
      },
    ],
  },
  {
    id: 'placeholder-software',
    title: 'Your Software Project',
    category: 'Software',
    year: '2024',
    blurb: 'One or two sentences on what it does and what problem it solved.',
    tags: ['Python', 'Tool'],
    image: '',
    imageAlt: '',
    repo: '',
    article: [
      {
        heading: 'Overview',
        body: ['What the tool does and who it is for.'],
      },
      {
        heading: 'How it works',
        body: ['The main pieces and how they fit together.'],
      },
    ],
  },
];