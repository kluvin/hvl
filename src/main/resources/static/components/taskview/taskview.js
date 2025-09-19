import '../tasklist/tasklist.js';
import '../taskbox/taskbox.js';
const template = document.createElement("template");
const html = (strings, ...values) =>
  String.raw({ raw: strings }, ...values);

template.innerHTML = html`
  <link rel="stylesheet" type="text/css"
    href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>
  <h1>Tasks</h1>
  <div id="message"><p>Waiting for server data.</p></div>
  <div id="newtask">
    <button type="button" disabled>New task</button>
  </div>
  <!-- The task list -->
  <task-list></task-list>
  <!-- The Modal --> 
  <task-box></task-box>
`;
class TaskView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._message = this.shadowRoot.querySelector("#message p");
    this._button = this.shadowRoot.querySelector("#newtask button");
    this._tasklist = this.shadowRoot.querySelector("task-list");
    this._taskbox = this.shadowRoot.querySelector("task-box");
    this._serviceurl = this.getAttribute("data-serviceurl") || "./api";
    this._wired = false;
  }

  connectedCallback() {
    this._load();
  }

  async _load() {
    try {
      const statusesRes = await fetch(`${this._serviceurl}/allstatuses`, { method: "GET" });
      const statusesJson = await statusesRes.json();
      if (statusesJson && statusesJson.responseStatus && Array.isArray(statusesJson.allstatuses)) {
        this._tasklist.setStatuseslist(statusesJson.allstatuses);
        this._taskbox.setStatuseslist(statusesJson.allstatuses);
        if (this._button) this._button.disabled = false;
      }
    } catch (e) {}
    this._wireCallbacks();

    try {
      const tasksRes = await fetch(`${this._serviceurl}/tasklist`, { method: "GET" });
      const tasksJson = await tasksRes.json();
      if (tasksJson && tasksJson.responseStatus && Array.isArray(tasksJson.tasks)) {
        for (const t of tasksJson.tasks) {
          this._tasklist.showTask(t);
        }
        if (this._message) this._message.textContent = tasksJson.tasks.length > 0 ? `Found ${tasksJson.tasks.length} tasks.` : "No tasks in list.";
      }
    } catch (e) {}
  }

  _wireCallbacks() {
    if (this._wired) return;
    this._wired = true;
    this._tasklist.changestatusCallback((id, newStatus) => {
      this._putStatus(id, newStatus);
    });
    this._tasklist.deletetaskCallback((id) => {
      this._deleteTask(id);
    });
    if (this._button) {
      this._button.addEventListener("click", () => {
        this._taskbox.show();
      });
    }
    this._taskbox.newtaskCallback((task) => {
      this._postTask(task);
    });
  }

  async _putStatus(id, status) {
    try {
      const res = await fetch(`${this._serviceurl}/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json && json.responseStatus) {
        this._tasklist.updateTask({ id, status });
      }
    } catch (e) {}
  }

  async _deleteTask(id) {
    try {
      const res = await fetch(`${this._serviceurl}/task/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json && json.responseStatus) {
        this._tasklist.removeTask(id);
        const n = this._tasklist.getNumtasks();
        if (this._message) this._message.textContent = n > 0 ? `Found ${n} tasks.` : "No tasks in list.";
      }
    } catch (e) {}
  }

  async _postTask(task) {
    try {
      const res = await fetch(`${this._serviceurl}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(task)
      });
      const json = await res.json();
      if (json && json.responseStatus && json.task) {
        this._tasklist.showTask(json.task);
        const n = this._tasklist.getNumtasks();
        if (this._message) this._message.textContent = n > 0 ? `Found ${n} tasks.` : "No tasks in list.";
        this._taskbox.close();
      }
    } catch (e) {}
  }
}

customElements.define("task-view", TaskView);
