import { createOptionElement } from "../utils/options.js";
import {
  registerComponent,
  renderTemplate,
  withElement,
} from "../utils/dom.js";

const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css"
href="${new URL("taskbox.css", import.meta.url)}"/>
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
    renderTemplate(this.shadowRoot, template);
    this._cacheElements();
    this._callbacks = [];
    this._wireEvents();
  }

  show() {
    if (this._input) this._input.value = "";
    withElement(this._dialog, (dialog) => {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
        withElement(this._input, (input) => input.focus());
      }
    });
  }

  setStatuseslist(list) {
    withElement(this._select, (select) => {
      select.innerHTML = "";
      if (Array.isArray(list)) {
        list.forEach((status) => {
          select.appendChild(createOptionElement(status));
        });
      }
    });
  }

  newtaskCallback(callback) {
    if (typeof callback === "function") {
      this._callbacks.push(callback);
    }
  }

  close() {
    withElement(this._dialog, (dialog) => {
      if (typeof dialog.close === "function") {
        dialog.close();
      }
    });
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
    withElement(this._close, (closeButton) => {
      closeButton.addEventListener("click", () => {
        this.close();
      });
    });
  }

  _wireDialogCancel() {
    withElement(this._dialog, (dialog) => {
      dialog.addEventListener("cancel", () => {
        this.close();
      });
    });
  }

  _wireSubmitAction() {
    withElement(this._submit, (submitButton) => {
      submitButton.addEventListener("click", () => {
        this._handleSubmit();
      });
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

registerComponent("task-box", TaskBox);
