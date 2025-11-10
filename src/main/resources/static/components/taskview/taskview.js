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
    href="${new URL("taskview.css", import.meta.url)}"
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
  #message = null;
  #button = null;
  #tasklist = null;
  #taskbox = null;
  #serviceurl = "./api";

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "closed" });
    renderTemplate(shadow, template);
    this.#message = shadow.querySelector("#message p");
    this.#button = shadow.querySelector("#newtask button");
    this.#tasklist = shadow.querySelector("task-list");
    this.#taskbox = shadow.querySelector("task-box");
    const { serviceurl } = this.dataset;
    this.#serviceurl =
      typeof serviceurl === "string" && serviceurl.length > 0
        ? serviceurl
        : "./api";
    this.#wireCallbacks();
  }

  connectedCallback() {
    this.#load();
  }

  async #load() {
    await this.#loadStatuses();
    await this.#loadTasks();
  }

  #wireCallbacks() {
    this.#wireTaskListCallbacks();
    this.#wireNewTaskButton();
    this.#wireTaskBoxCallback();
  }

  async #putStatus(id, status) {
    if (!confirm("Are you sure you want to update this task?")) return;
    const success = await updateTaskStatus(this.#serviceurl, id, status);
    if (success) {
      this.#tasklist.updateTask({ id, status });
    }
  }

  async #deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const success = await deleteTask(this.#serviceurl, id);
    if (success) {
      this.#tasklist.removeTask(id);
      this.#refreshTaskCount();
    }
  }

  async #postTask(task) {
    const createdTask = await createTask(this.#serviceurl, task);
    if (createdTask !== null) {
      this.#tasklist.showTask(createdTask);
      this.#refreshTaskCount();
      this.#closeTaskBox();
    }
  }

  async #loadStatuses() {
    const statuses = await getStatuses(this.#serviceurl);
    if (Array.isArray(statuses)) {
      this.#applyStatuses(statuses);
    }
  }

  #applyStatuses(statuses) {
    this.#tasklist.setStatuseslist(statuses);
    this.#taskbox.setStatuseslist(statuses);
    this.#enableNewTaskButton();
  }

  #enableNewTaskButton() {
    withElement(this.#button, (button) => {
      button.disabled = false;
    });
  }

  async #loadTasks() {
    const tasks = await getTasks(this.#serviceurl);
    if (tasks !== null) {
      this.#displayTasks(tasks);
    }
  }

  #displayTasks(tasks) {
    tasks.forEach((task) => {
      this.#tasklist.showTask(task);
    });
    this.#updateMessageForCount(tasks.length);
  }

  #wireTaskListCallbacks() {
    this.#tasklist.changestatusCallback((id, newStatus) => {
      this.#putStatus(id, newStatus);
    });
    this.#tasklist.deletetaskCallback((id) => {
      this.#deleteTask(id);
    });
  }

  #wireNewTaskButton() {
    withElement(this.#button, (button) => {
      button.addEventListener("click", () => {
        this.#taskbox.show();
      });
    });
  }

  #wireTaskBoxCallback() {
    withElement(this.#taskbox, (taskBox) => {
      taskBox.newtaskCallback((task) => {
        this.#postTask(task);
      });
    });
  }

  #refreshTaskCount() {
    const total = this.#tasklist.getNumtasks();
    this.#updateMessageForCount(total);
  }

  #updateMessageForCount(count) {
    withElement(this.#message, (message) => {
      message.textContent =
        count > 0 ? `Found ${count} tasks.` : "No tasks in list.";
    });
  }

  #closeTaskBox() {
    withElement(this.#taskbox, (taskBox) => {
      taskBox.close();
    });
  }
}

registerComponent("task-view", TaskView);
