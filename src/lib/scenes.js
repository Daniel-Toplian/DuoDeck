const APPLE_R = 11;

function apple(cx, cy) {
  return `
    <g>
      <circle cx="${cx}" cy="${cy}" r="${APPLE_R}" fill="#e23636" stroke="#00000033"/>
      <path d="M ${cx} ${cy - APPLE_R} q -1 -6 3 -9" stroke="#7a4a21" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="${cx + 6}" cy="${cy - APPLE_R - 4}" rx="5" ry="2.6" fill="#3aa757"
               transform="rotate(-28 ${cx + 6} ${cy - APPLE_R - 4})"/>
    </g>`;
}

function boxClosed(bx, by, w = 44, h = 30, d = 10) {
  return `
    <g stroke="#00000033">
      <polygon points="${bx},${by} ${bx + d},${by - d} ${bx + w + d},${by - d} ${bx + w},${by}" fill="#dbb27a"/>
      <polygon points="${bx + w},${by} ${bx + w + d},${by - d} ${bx + w + d},${by + h - d} ${bx + w},${by + h}" fill="#a87f48"/>
      <rect x="${bx}" y="${by}" width="${w}" height="${h}" fill="#c99a5b"/>
    </g>`;
}

function boxOpenBack(bx, by, w = 44, d = 10) {
  return `
    <g stroke="#00000033">
      <polygon points="${bx},${by} ${bx + d},${by - d} ${bx + w + d},${by - d} ${bx + w},${by}" fill="#8a6a3e"/>
    </g>`;
}

function boxOpenFront(bx, by, w = 44, h = 30, d = 10) {
  return `
    <g stroke="#00000033">
      <polygon points="${bx + w},${by} ${bx + w + d},${by - d} ${bx + w + d},${by + h - d} ${bx + w},${by + h}" fill="#a87f48"/>
      <rect x="${bx}" y="${by}" width="${w}" height="${h}" fill="#c99a5b"/>
    </g>`;
}

function shadow(cx, cy, rx) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4" fill="#00000022"/>`;
}

const SCENES = {
  on: () => shadow(65, 86, 32) + boxClosed(38, 52) + apple(65, 31),
  under: () => shadow(65, 88, 30) + boxClosed(38, 28) + apple(65, 77),
  inside: () => shadow(65, 86, 32) + boxOpenBack(38, 52) + apple(65, 50) + boxOpenFront(38, 52),
  outside: () =>
    shadow(35, 86, 32) + shadow(100, 88, 14) + boxOpenBack(8, 52) + boxOpenFront(8, 52) + apple(100, 77),
  front: () => shadow(60, 88, 34) + boxClosed(38, 45) + apple(60, 74),
  behind: () => shadow(65, 86, 32) + apple(50, 38) + boxClosed(38, 52),
  beside: () => shadow(51, 86, 32) + shadow(86, 88, 14) + boxClosed(24, 52) + apple(86, 77),
  between: () =>
    shadow(21, 84, 22) +
    shadow(91, 84, 22) +
    shadow(60, 88, 14) +
    boxClosed(6, 56, 30, 24, 8) +
    boxClosed(76, 56, 30, 24, 8) +
    apple(60, 77),
};

export const SCENE_KEYS = Object.keys(SCENES);

export function sceneMarkup(sceneKey, { size = 'lg' } = {}) {
  const body = SCENES[sceneKey];
  if (!body) return '';
  return `<svg class="scene scene-${size === 'sm' ? 'sm' : 'lg'}" viewBox="0 0 120 100"
       xmlns="http://www.w3.org/2000/svg" role="img" aria-label="position scene">${body()}</svg>`;
}
