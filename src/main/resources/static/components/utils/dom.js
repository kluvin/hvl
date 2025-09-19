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
