// Swap later: rewrite in your own words, keep facts accurate

export const experience = [
  {
    id: 'zotbins',
    current: true,
    role: 'Electrical Engineering Intern',
    org: 'ZotBins',
    dates: 'Aug 2026 – Present',
    location: 'Irvine, CA',
    summary: 'Hardware subteam. Building off-grid power for the ZotBins smart bins.',
    bullets: [
      'Designing a solar power and energy storage subsystem so the bin servos run without a wall outlet.',
      'Designed and hand-assembled a 2-layer KiCad PCB with battery input, BJT/MOSFET switching, and custom footprints.',
      'Worked with 3 EECS faculty to scope the project into hardware plus formal research deliverables.',
      'Planning an MPPT study under repeatable partial shading to compare harvested energy against a fixed-duty baseline.',
    ],
  },
  {
    id: 'ieee-ops',
    current: false,
    role: 'Member',
    org: 'IEEE at UC Irvine, Open Project Space',
    dates: 'Sep 2025 – Jun 2026',
    location: 'Irvine, CA',
    summary: 'Hands-on build program covering embedded, analog, and wireless projects.',
    bullets: [
      'Completed 7 guided builds and a capstone across embedded firmware, analog circuits, and wireless IoT.',
      'Used KiCad schematic capture, SMD rework, and oscilloscope debugging on every build.',
      'Capstone: an autonomous RC rover on a custom 2-layer PCB with PID obstacle avoidance.',
    ],
  },
];

export const education = {
  degree: 'B.S. Computer Engineering',
  school: 'University of California, Irvine',
  dates: 'Expected May 2028',
  gpa: '3.83 / 4.00',
  coursework: [
    'Advanced C Programming',
    'Intro to Digital Systems',
    'Digital Logic Design Lab',
    'Organization of Digital Computers',
    'Computer Systems and C',
    'Drones',
    'Boolean Logic and Discrete Structures',
    'Multivariable Calculus',
    'Differential Equations',
    'Linear Algebra',
  ],
};

// year and url are optional: leave '' to hide them
export const certifications = [
  {
    name: 'Solutions Architect, Associate',
    issuer: 'AWS',
    year: '',
    url: '',
  },
];

export const tools = [
  {
    group: 'Languages',
    items: ['C', 'C++', 'Python', 'Java', 'JavaScript', 'Verilog', 'HTML'],
  },
  {
    group: 'Hardware',
    items: ['ESP32', 'Arduino', 'Raspberry Pi', 'Circuit design', 'SMD soldering', 'Oscilloscope', 'Multimeter'],
  },
  {
    group: 'Design & CAD',
    items: ['KiCad', 'SolidWorks', 'Fusion 360'],
  },
  {
    group: 'Tools & protocols',
    items: ['AWS', 'Git', 'Linux', 'MATLAB', 'MQTT', 'I2C', 'SPI', 'SQL'],
  },
];