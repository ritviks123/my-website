import { useState } from 'react';
import ProjectThumb from './ProjectThumb';
import './MediaCarousel.css';

/* ===== Swap later ===== */
const SECONDS_PER_SLIDE = 6; // auto-advance speed
const ANIMATION_CAPTION = 'Animated overview';
/* ====================== */

/*
  Project media, one slide at a time: the animated thumbnail first, then project.image,
  then every image in project.media ([{ src, alt, caption }]).
  Moves on by itself; pauses while hovered or focused; arrows, previews and ← → keys jump.
  Arrows and previews appear on hover (always shown on touch screens, which can't hover).
*/
function MediaCarousel({ project }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState([]); // images that failed to load get skipped

  const slides = [
    { key: 'animation', kind: 'thumb', caption: ANIMATION_CAPTION },
    ...(project.image ? [{ src: project.image, alt: project.imageAlt, caption: project.imageCaption }] : []),
    ...(project.media ?? []),
  ]
    .map((slide) => ({ key: slide.src, kind: 'image', ...slide }))
    .filter((slide) => !broken.includes(slide.src));

  const count = slides.length;
  const current = Math.min(index, count - 1);
  const go = (i) => setIndex((i + count) % count);
  const slide = slides[current];

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') go(current + 1);
    if (event.key === 'ArrowLeft') go(current - 1);
  };

  return (
    <section
      className={`carousel${paused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label={`${project.title} media`}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={count > 1 ? onKeyDown : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="carousel-frame">
        {slides.map((s, i) => (
          <div
            key={s.key}
            className={`carousel-slide${i === current ? ' is-active' : ''}`}
            aria-hidden={i !== current}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {s.kind === 'thumb' ? (
              <div className="carousel-thumb">
                <ProjectThumb project={project} />
              </div>
            ) : (
              <img
                src={s.src}
                alt={s.alt || ''}
                loading={i < 2 ? 'eager' : 'lazy'}
                onError={() => setBroken((list) => [...list, s.src])}
              />
            )}
          </div>
        ))}

        {count > 1 && (
          <>
            <button type="button" className="carousel-arrow is-prev" onClick={() => go(current - 1)} aria-label="Previous slide">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="carousel-arrow is-next" onClick={() => go(current + 1)} aria-label="Next slide">
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}

        {/* Previews of every slide: show up when you hover the carousel */}
        {count > 1 && (
          <div className="carousel-strip">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                className={`carousel-pick${i === current ? ' is-active' : ''}`}
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === current}
              >
                {s.kind === 'thumb' ? <ProjectThumb project={project} /> : <img src={s.src} alt="" loading="lazy" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* One bar per slide; the active bar fills up, then the carousel moves on */}
      {count > 1 && (
        <div className="carousel-progress" aria-hidden="true">
          {slides.map((s, i) => (
            <span key={s.key} className="carousel-segment">
              <span
                key={i === current ? `on-${current}` : 'off'}
                className={`carousel-fill${i < current ? ' is-done' : ''}${i === current ? ' is-active' : ''}`}
                style={{ animationDuration: `${SECONDS_PER_SLIDE}s` }}
                onAnimationEnd={i === current ? () => go(current + 1) : undefined}
              />
            </span>
          ))}
        </div>
      )}

      <div className="carousel-meta">
        <p className="carousel-caption" aria-live="polite">
          {slide.caption || slide.alt || ''}
        </p>
        {count > 1 && (
          <span className="carousel-count">
            {current + 1} / {count}
          </span>
        )}
      </div>

    </section>
  );
}

export default MediaCarousel;