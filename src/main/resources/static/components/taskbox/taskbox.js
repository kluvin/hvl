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
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._dialog = this.shadowRoot.querySelector("dialog");
    this._close = this.shadowRoot.querySelector("span");
    this._input = this.shadowRoot.querySelector("input");
    this._select = this.shadowRoot.querySelector("select");
    this._submit = this.shadowRoot.querySelector("button[type=submit]");

    this._callbacks = [];

    if (this._close) {
      this._close.addEventListener("click", () => { this.close(); });
    }
    if (this._dialog) {
      this._dialog.addEventListener("cancel", () => { this.close(); });
    }
    if (this._submit) {
      this._submit.addEventListener("click", () => {
        const title = (this._input?.value || "").trim();
        const status = this._select?.value || "";
        if (title === "" || status === "") return;
        const task = { title, status };
        this._callbacks.forEach((cb) => cb(task));
      });
    }
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
      list.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = String(s);
        opt.textContent = String(s);
        this._select.appendChild(opt);
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
}

customElements.define("task-box", TaskBox);


