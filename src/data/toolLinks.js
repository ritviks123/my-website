import { projects } from './projects';

/* ===== Swap later: links the project data doesn't spell out ===== */
// Tool name → project ids, for tools a project used but doesn't list in tags or builtWith
const EXTRA_LINKS = {
  AWS: ['iot-weather-station'],
  SPI: ['iot-weather-station'],
};
/* ================================================================ */

// "ESP32" matches "ESP32", "Arduino" matches "Arduino Uno Q", but "C" does NOT match "C++"
function matches(tool, label) {
  const t = tool.toLowerCase();
  const l = label.toLowerCase();
  return l === t || l.startsWith(`${t} `);
}

export function projectUsesTool(project, tool) {
  if (!tool) return false;
  if (EXTRA_LINKS[tool]?.includes(project.id)) return true;
  const labels = [...(project.tags || []), ...(project.builtWith || [])];
  return labels.some((label) => matches(tool, label));
}

export function projectsUsingTool(tool) {
  return projects.filter((project) => project.featured && projectUsesTool(project, tool));
}