import type { Season } from './seasons';

/*
 * 🚨 Plain functions, CALLED (`Kettle({ season })`), never used as JSX tags:
 * Mithril takes a function tag for a closure component and expects it to
 * return `{ view }`, so `<Kettle />` crashes the whole page.
 *
 * Hearth's drawings: a kettle, a jar and a lamp, plus a sprig for each
 * season. Plain inline SVG coloured from the --hearth-* tokens, so Evening
 * recolours them with the rest of the page and nothing is downloaded.
 * Every one is decoration: aria-hidden, never focusable.
 */

const hidden = { 'aria-hidden': 'true', focusable: 'false' };

/** The steaming kettle on the welcome card, with a loaf beside it. */
export function Kettle({ season }: { season: Season | null }) {
  return (
    <svg className="HearthArt HearthArt--kettle" viewBox="0 0 220 130" {...hidden}>
      <ellipse cx="110" cy="122" rx="100" ry="8" className="HearthArt-shadow" />
      <path d="M30 118c-6-28 14-50 44-50s50 22 44 50z" className="HearthArt-loaf" />
      <path d="M50 88c8-8 16-8 24 0M66 80c8-8 16-8 24 0M82 90c8-8 16-8 24 0" className="HearthArt-score" />
      <path d="M130 118h66c3-26-8-42-33-42s-36 16-33 42z" className="HearthArt-kettle" />
      <path d="M196 98l14-10" className="HearthArt-spout" />
      <path d="M146 76c0-10 34-10 34 0" className="HearthArt-handle" />
      <circle cx="163" cy="70" r="5" className="HearthArt-knob" />
      <path d="M156 56c-6-6 6-10 0-18M170 56c-6-6 6-10 0-18" className="HearthArt-steam" />
      {season ? Sprig({ season, x: 6, y: 6 }) : null}
    </svg>
  );
}

/** Evening's welcome: the lamp is lit and the kettle is on. */
export function Lamp({ season }: { season: Season | null }) {
  return (
    <svg className="HearthArt HearthArt--lamp" viewBox="0 0 220 130" {...hidden}>
      <circle cx="186" cy="30" r="16" className="HearthArt-moon" />
      <circle cx="194" cy="24" r="14" className="HearthArt-moonCut" />
      <circle cx="70" cy="70" r="52" className="HearthArt-glow" />
      <path d="M50 52h40l10 30H40z" className="HearthArt-shade" />
      <rect x="66" y="82" width="8" height="34" className="HearthArt-stand" />
      <path d="M48 120h44" className="HearthArt-base" />
      <path d="M120 120h66c3-26-8-42-33-42s-36 16-33 42z" className="HearthArt-kettle" />
      <path d="M136 78c0-10 34-10 34 0" className="HearthArt-handle" />
      <path d="M146 62c-6-6 6-10 0-18M160 62c-6-6 6-10 0-18" className="HearthArt-steam" />
      {season ? Sprig({ season, x: 4, y: 4 }) : null}
    </svg>
  );
}

/**
 * A jar. Filled with the tag's colour on the shelf and on a discussion's
 * header; `face` gives it the little smile from the design.
 */
export function Jar({ color, face = false, className = '' }: { color?: string | null; face?: boolean; className?: string }) {
  const style = color ? { '--hearth-jar': color } : undefined;

  return (
    <svg className={'HearthArt HearthArt--jar ' + className} viewBox="0 0 170 150" style={style} {...hidden}>
      <ellipse cx="85" cy="142" rx="70" ry="6" className="HearthArt-shadow" />
      <rect x="42" y="38" width="86" height="104" rx="22" className="HearthArt-glass" />
      <rect x="50" y="28" width="70" height="18" rx="6" className="HearthArt-lid" />
      <path d="M48 92c14-10 24 6 38-2s24-10 36 0v28c0 10-8 18-18 18H66c-10 0-18-8-18-18z" className="HearthArt-fill" />
      <circle cx="70" cy="110" r="4" className="HearthArt-fleck" />
      <circle cx="92" cy="120" r="3" className="HearthArt-fleck" />
      <circle cx="106" cy="106" r="5" className="HearthArt-fleck" />
      {face
        ? [
            <circle cx="74" cy="70" r="3" className="HearthArt-eye" />,
            <circle cx="96" cy="70" r="3" className="HearthArt-eye" />,
            <path d="M78 77c4 3 10 3 14 0" className="HearthArt-smile" />,
          ]
        : null}
    </svg>
  );
}

/** The shelf's jar: smaller, with the tag's icon on a paper label. */
export function ShelfJar({ color }: { color?: string | null }) {
  const style = color ? { '--hearth-jar': color } : undefined;

  return (
    <svg className="HearthArt HearthArt--shelfJar" viewBox="0 0 96 112" style={style} {...hidden}>
      <rect x="14" y="18" width="68" height="90" rx="18" className="HearthArt-glass" />
      <rect x="20" y="8" width="56" height="16" rx="5" className="HearthArt-lid" />
      <path d="M18 64c12-8 20 5 30-1s20-8 30 0v26c0 9-7 16-16 16H34c-9 0-16-7-16-16z" className="HearthArt-fill" />
      <rect x="26" y="34" width="44" height="22" rx="6" className="HearthArt-label" />
    </svg>
  );
}

/** One quiet sprig in the corner of a drawing, by season. */
function Sprig({ season, x, y }: { season: Season; x: number; y: number }) {
  const t = `translate(${x} ${y})`;

  switch (season) {
    case 'winter':
      return (
        <g transform={t} className="HearthSprig HearthSprig--winter">
          <path d="M14 2v24M2 14h24M5.5 5.5l17 17M22.5 5.5l-17 17" />
          <path d="M40 18v12M34 24h12M36 20l8 8M44 20l-8 8" />
        </g>
      );
    case 'spring':
      return (
        <g transform={t} className="HearthSprig HearthSprig--spring">
          <circle cx="14" cy="8" r="5" />
          <circle cx="20" cy="14" r="5" />
          <circle cx="14" cy="20" r="5" />
          <circle cx="8" cy="14" r="5" />
          <circle cx="14" cy="14" r="3.5" className="HearthSprig-heart" />
        </g>
      );
    case 'summer':
      return (
        <g transform={t} className="HearthSprig HearthSprig--summer">
          <circle cx="16" cy="16" r="7" />
          <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M26 6l-3 3M9 23l-3 3" />
        </g>
      );
    default:
      return (
        <g transform={t} className="HearthSprig HearthSprig--autumn">
          <path d="M6 26C6 12 16 4 28 4c0 12-8 22-22 22z" />
          <path d="M6 26L22 10" className="HearthSprig-vein" />
        </g>
      );
  }
}
