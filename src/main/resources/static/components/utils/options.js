export function createOptionElement(value) {
  const opt = document.createElement("option");
  opt.value = String(value);
  opt.textContent = String(value);
  return opt;
}
