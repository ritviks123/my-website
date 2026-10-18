import { useEffect, useState } from 'react';
import { tools } from '../data/work';
import { projectsUsingTool } from '../data/toolLinks';
import './Toolkit.css';

/* ===== Swap these later ===== */
const LABEL = '/toolkit';
const HEADING = 'Tools I reach for.';
const CYCLE_MS = 3000;
/* ============================ */

// Tools used by at least one featured project, in list order (these take turns lighting up)
const LINKED = tools.flatMap((group) => group.items).filter((tool) => projectsUsingTool(tool).length > 0);

function Toolkit({ activeTool, onToolChange }) {
  const [pinned, setPinned] = useState(null);
  const [paused, setPaused] = useState(false);

  // Cycle through linked tools unless one is pinned, the mouse is over the list, or motion is reduced
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pinned || paused || reduce || LINKED.length === 0) return undefined;

    onToolChange((current) => current ?? LINKED[0]);
    const id = setInterval(() => {
      onToolChange((current) => LINKED[(LINKED.indexOf(current) + 1) % LINKED.length]);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [pinned, paused, onToolChange]);

  function handleClick(tool) {
    if (pinned === tool) {
      setPinned(null); // unpin: cycling resumes from here
    } else {
      setPinned(tool);
      onToolChange(tool);
    }
  }

  const litProjects = activeTool ? projectsUsingTool(activeTool) : [];

    return (
    <section className="toolkit" id="toolkit">
      <div className="toolkit-inner">
        <p className="toolkit-label">{LABEL}</p>
        <h2 className="toolkit-heading">{HEADING}</h2>
        <p className="toolkit-status">
          {activeTool ? (
            <>
              <span className="toolkit-status-tool">{activeTool}</span>
              {' → '}
              {litProjects.length ? litProjects.map((project) => project.title).join(' · ') : 'no featured projects yet'}
              {pinned && ' (pinned)'}
            </>
          ) : (
            'Pick a tool to see where it was used.'
          )}
        </p>
      </div>

      {/* Full-width row of tool cards */}
      <div className="toolkit-grid" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {tools.map((group, i) => (
          <div key={group.group} className="toolkit-card" data-wire={`tk-${i}`}>
            <h3 className="toolkit-group">{group.group}</h3>
            <ul className="toolkit-list">
              {group.items.map((tool) => {
                const linked = projectsUsingTool(tool).length > 0;
                const classes = ['toolkit-tool', tool === activeTool && 'is-active', !linked && 'is-unlinked']
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={tool}>
                    <button type="button" className={classes} aria-pressed={pinned === tool} onClick={() => handleClick(tool)}>
                      <span className={`toolkit-led${pinned === tool ? ' is-pinned' : ''}`} aria-hidden="true" />
                      <span className="toolkit-name">{tool}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Toolkit;