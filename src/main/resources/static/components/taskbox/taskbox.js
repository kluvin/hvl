import { createOptionElement } from "../utils/options.js";

const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css"
href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
<dialog>
<!-- Modal content -->
<span>&times;</span>
<div>
<div>Title:</div>
<div>
<input type="text" size="25" maxlength="80"
placeholder="Task title" autofocus/>
</div>
</div>
<div>Status:</div><div><select></select></div>
<p><button type="submit">Add task</button></p>
</dialog>
`;

class TaskBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._renderTemplate();
    this._cacheElements();
    this._callbacks = [];
    this._wireEvents();
  }

  show() {
    if (this._input) this._input.value = "";
    if (this._dialog && typeof this._dialog.showModal === "function") {
      this._dialog.showModal();
      if (this._input) this._input.focus();
    }
  }

  setStatuseslist(list) {
    if (!this._select) return;
    this._select.innerHTML = "";
    if (Array.isArray(list)) {
      list.forEach((status) => {
        this._select.appendChild(createOptionElement(status));
      });
    }
  }

  newtaskCallback(callback) {
    if (typeof callback === "function") {
      this._callbacks.push(callback);
    }
  }

  close() {
    if (this._dialog && typeof this._dialog.close === "function") {
      this._dialog.close();
    }
  }

  _renderTemplate() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  _cacheElements() {
    this._dialog = this.shadowRoot.querySelector("dialog");
    this._close = this.shadowRoot.querySelector("span");
    this._input = this.shadowRoot.querySelector("input");
    this._select = this.shadowRoot.querySelector("select");
    this._submit = this.shadowRoot.querySelector("button[type=submit]");
  }

  _wireEvents() {
    this._wireCloseControl();
    this._wireDialogCancel();
    this._wireSubmitAction();
  }

  _wireCloseControl() {
    if (!this._close) return;
    this._close.addEventListener("click", () => {
      this.close();
    });
  }

  _wireDialogCancel() {
    if (!this._dialog) return;
    this._dialog.addEventListener("cancel", () => {
      this.close();
    });
  }

  _wireSubmitAction() {
    if (!this._submit) return;
    this._submit.addEventListener("click", () => {
      this._handleSubmit();
    });
  }

  _handleSubmit() {
    const title = (this._input?.value || "").trim();
    const status = this._select?.value || "";
    if (title === "" || status === "") return;
    this._notifyCallbacks({ title, status });
  }

  _notifyCallbacks(task) {
    this._callbacks.forEach((cb) => cb(task));
  }
}

customElements.define("task-box", TaskBox);
