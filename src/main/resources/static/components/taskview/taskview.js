import "../tasklist/tasklist.js";
import "../taskbox/taskbox.js";
import {
  createTask,
  deleteTask,
  getStatuses,
  getTasks,
  updateTaskStatus,
} from "../utils/taskApi.js";
import {
  registerComponent,
  renderTemplate,
  withElement,
} from "../utils/dom.js";

const template = document.createElement("template");
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);

template.innerHTML = html`
  <link
    rel="stylesheet"
    type="text/css"
    href="${import.meta.url.match(/.*\//)[0]}/taskview.css"
  />
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
    renderTemplate(this.shadowRoot, template);
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
    await this._loadStatuses();
    this._wireCallbacks();
    await this._loadTasks();
  }

  _wireCallbacks() {
    if (this._wired) return;
    this._wired = true;
    this._wireTaskListCallbacks();
    this._wireNewTaskButton();
    this._wireTaskBoxCallback();
  }

  async _putStatus(id, status) {
    const success = await updateTaskStatus(this._serviceurl, id, status);
    if (success) {
      this._tasklist.updateTask({ id, status });
    }
  }

  async _deleteTask(id) {
    const success = await deleteTask(this._serviceurl, id);
    if (success) {
      this._tasklist.removeTask(id);
      this._refreshTaskCount();
    }
  }

  async _postTask(task) {
    const createdTask = await createTask(this._serviceurl, task);
    if (createdTask) {
      this._tasklist.showTask(createdTask);
      this._refreshTaskCount();
      this._closeTaskBox();
    }
  }

  async _loadStatuses() {
    const statuses = await getStatuses(this._serviceurl);
    if (statuses) {
      this._applyStatuses(statuses);
    }
  }

  _applyStatuses(statuses) {
    this._tasklist.setStatuseslist(statuses);
    this._taskbox.setStatuseslist(statuses);
    this._enableNewTaskButton();
  }

  _enableNewTaskButton() {
    withElement(this._button, (button) => {
      button.disabled = false;
    });
  }

  async _loadTasks() {
    const tasks = await getTasks(this._serviceurl);
    if (tasks) {
      this._displayTasks(tasks);
    }
  }

  _displayTasks(tasks) {
    tasks.forEach((task) => {
      this._tasklist.showTask(task);
    });
    this._updateMessageForCount(tasks.length);
  }

  _wireTaskListCallbacks() {
    this._tasklist.changestatusCallback((id, newStatus) => {
      this._putStatus(id, newStatus);
    });
    this._tasklist.deletetaskCallback((id) => {
      this._deleteTask(id);
    });
  }

  _wireNewTaskButton() {
    withElement(this._button, (button) => {
      button.addEventListener("click", () => {
        this._taskbox.show();
      });
    });
  }

  _wireTaskBoxCallback() {
    withElement(this._taskbox, (taskBox) => {
      taskBox.newtaskCallback((task) => {
        this._postTask(task);
      });
    });
  }

  _refreshTaskCount() {
    const total = this._tasklist.getNumtasks();
    this._updateMessageForCount(total);
  }

  _updateMessageForCount(count) {
    withElement(this._message, (message) => {
      message.textContent =
        count > 0 ? `Found ${count} tasks.` : "No tasks in list.";
    });
  }

  _closeTaskBox() {
    withElement(this._taskbox, (taskBox) => {
      taskBox.close();
    });
  }
}

registerComponent("task-view", TaskView);
