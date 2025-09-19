export function renderTemplate(shadowRoot, template) {
  if (!shadowRoot || !template) return;
  const content = template.content ?? null;
  const fragment = content ? content.cloneNode(true) : null;
  if (fragment) {
    shadowRoot.appendChild(fragment);
  }
}

export function withElement(element, callback) {
  if (!element || typeof callback !== "function") return null;
  return callback(element);
}

export function registerComponent(tagName, constructor) {
  if (typeof tagName !== "string" || !constructor) return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, constructor);
  }
}

export function emit(target, type, detail = {}) {
  if (!target || typeof target.dispatchEvent !== "function") return;
  if (typeof type !== "string" || type.length === 0) return;
  target.dispatchEvent(
    new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail,
    })
  );
}

export function on(target, listeners = {}) {
  if (!target || typeof target.addEventListener !== "function") return;
  Object.entries(listeners).forEach(([type, handler]) => {
    if (typeof type === "string" && typeof handler === "function") {
      target.addEventListener(type, handler);
    }
  });
}
