export function renderTemplate(shadowRoot, template) {
  if (!(shadowRoot instanceof ShadowRoot) || !(template instanceof HTMLTemplateElement)) return;
  const fragment = template.content.cloneNode(true);
  shadowRoot.appendChild(fragment);
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
