const routes = new Map();
let fallback = null;

export function route(path, handler) {
  routes.set(path, handler);
}

export function setFallback(handler) {
  fallback = handler;
}

export function navigate(path) {
  if (location.hash === `#${path}`) render();
  else location.hash = path;
}

export function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  const handler = routes.get(path) ?? fallback;
  handler?.();
}

export function startRouter() {
  addEventListener('hashchange', render);
  render();
}
