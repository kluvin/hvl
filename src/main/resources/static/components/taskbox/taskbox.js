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
	#shadow;
	#dialog;
	#close;
    #input;
    #select;
    #submit;
	#callbacks = [];
		
  constructor() {
	super();
	this.#shadow = this.attachShadow({ mode: "closed" });
    renderTemplate(this.#shadow, template);
    this.#cacheElements();
    this.#wireEvents();
  }

  show() {
    withElement(this.#input, (input) => { this.#input.value = ""});
    withElement(this.#dialog, (dialog) => {
	// withElement() checks for null already 
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
        withElement(this.#input, (input) => input.focus());
      }
    });
  }

  setStatuseslist(list) {
	// withElement() checks for null already 
    withElement(this.#select, (select) => {
      select.innerText = "";
      if (Array.isArray(list)) {
        list.forEach((status) => {
          select.appendChild(createOptionElement(status));
        });
      }
    });
  }

  newtaskCallback(callback) {
    if (typeof callback === "function") {
      this.#callbacks.push(callback);
    }
  }

  close() {
    withElement(this.#dialog, (dialog) => {
      if (typeof dialog.close === "function") {
        dialog.close();
      }
    });
	
	if (this.#input) this.#input.value = "";
	if (this.#select) this.#select.selectedIndex = 0;
  }

  #cacheElements() {
    this.#dialog = this.#shadow.querySelector("dialog");
    this.#close = this.#shadow.querySelector("span");
    this.#input = this.#shadow.querySelector("input");
    this.#select = this.#shadow.querySelector("select");
    this.#submit = this.#shadow.querySelector("button[type=submit]");
  }

  #wireEvents() {
    this.#wireCloseControl();
    this.#wireDialogCancel();
    this.#wireSubmitAction();
  }

  #wireCloseControl() {
    withElement(this.#close, (closeButton) => {
      closeButton.addEventListener("click", () => {
        this.close();
      });
    });
  }

  #wireDialogCancel() {
    withElement(this.#dialog, (dialog) => {
      dialog.addEventListener("cancel", () => {
        this.close();
      });
    });
  }

  #wireSubmitAction() {
    withElement(this.#submit, (submitButton) => {
      submitButton.addEventListener("click", () => {
        this.#handleSubmit();
      });
    });
  }

  #handleSubmit() {
    const title = (this.#input?.value || "").trim();
    const status = this.#select?.value || "";
    if (title === "" || status === "") return;
    this.#notifyCallbacks({ title, status });
  }

  #notifyCallbacks(task) {
    this.#callbacks.forEach((cb) => cb(task));
  }
}

registerComponent("task-box", TaskBox);
