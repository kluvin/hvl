import { createOptionElement } from "../utils/options.js";
import {
  registerComponent,
  renderTemplate,
  withElement,
} from "../utils/dom.js";

const template = document.createElement("template");
template.innerText = `
    <link rel="stylesheet" type="text/css" href="${new URL(
      "tasklist.css",
      import.meta.url
    )}"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerText = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerText = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
 * TaskList
 * Manage view with list of tasks
 */
class TaskList extends HTMLElement {
  #container;
  #allstatuses = [];
  #changestatusCallbacks = [];
  #deletetaskCallbacks = [];

  constructor() {
    super();

    /**
     * Fill inn rest of the code
     */
    const shadow = this.attachShadow({ mode: "closed" });
    renderTemplate(shadow, template);
    this.#container = shadow.getElementById("tasklist");
  }

  /**
   * @public
   * @param {Array} list with all possible task statuses
   */
  setStatuseslist(allstatuses) {
    /**
     * Fill inn the code
     */
    this.#allstatuses = Array.isArray(allstatuses) ? allstatuses.slice() : [];
  }

  /**
   * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
   * @public
   * @param {function} callback
   */
  changestatusCallback(callback) {
    /**
     * Fill inn the code
     */
    if (typeof callback === "function") {
      this.#changestatusCallbacks.push(callback);
    }
  }

  /**
   * Add callback to run on click on delete button of a task
   * @public
   * @param {function} callback
   */
  deletetaskCallback(callback) {
    /**
     * Fill inn the code
     */
    if (typeof callback === "function") {
      this.#deletetaskCallbacks.push(callback);
    }
  }

  /**
   * Add task at top in list of tasks in the view
   * @public
   * @param {Object} task - Object representing a task
   */
  showTask(task) {
    /**
     * Fill inn the code
     */
    withElement(this.#ensureTableBody(), (tbody) => {
      const row = this.#createRow(task);
      this.#insertRowAtTop(tbody, row);
    });
  }

  /**
   * Update the status of a task in the view
   * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
   */
  updateTask(task) {
    /**
     * Fill inn the code
     */
    withElement(this.#findRowById(task.id), (row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        cells[1].textContent = task.status ?? "";
      }
    });
  }

  /**
   * Remove a task from the view
   * @param {Integer} task - ID of task to remove
   */
  removeTask(id) {
    /**
     * Fill inn the code
     */
    withElement(this.#getExistingTbody(), (tbody) => {
      withElement(this.#findRowById(id), (row) => {
        row.remove();
        if (tbody.rows.length === 0) {
          this.#container.innerText = "";
        }
      });
    });
  }

  /**
   * @public
   * @return {Number} - Number of tasks on display in view
   */
  getNumtasks() {
    /**
     * Fill inn the code
     */
    const tbody = this.#getExistingTbody();
    return tbody ? tbody.rows.length : 0;
  }

  #ensureTableBody() {
    let table = this.#container.querySelector("table");
    let tbody = table ? table.querySelector("tbody") : null;
    if (tbody !== null) return tbody;
    const fragment = tasktable.content.cloneNode(true);
    this.#container.appendChild(fragment);
    table = this.#container.querySelector("table");
    return table ? table.querySelector("tbody") : null;
  }

  #createRow(task) {
    const fragment = taskrow.content.cloneNode(true);
    const row = fragment.querySelector("tr");
    const taskIdString = String(task.id);
    row.dataset.id = taskIdString;
    this.#fillRowCells(row, task);
    this.#populateStatusSelect(row, task.id);
    this.#wireDeleteButton(row, task.id);
    return row;
  }

  #fillRowCells(row, task) {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 2) {
      cells[0].textContent = task.title ?? "";
      cells[1].textContent = task.status ?? "";
    }
  }

  #populateStatusSelect(row, taskId) {
    withElement(row.querySelector("select"), (select) => {
      if (Array.isArray(this.#allstatuses)) {
        this.#allstatuses.forEach((status) => {
          select.appendChild(createOptionElement(status));
        });
      }
      select.addEventListener("change", () => {
        const value = select.value;
        if (value !== "0") {
          this.#changestatusCallbacks.forEach((cb) => cb(taskId, value));
          select.value = "0";
        }
      });
    });
  }

  #wireDeleteButton(row, taskId) {
    withElement(row.querySelector("button"), (button) => {
      button.addEventListener("click", () => {
        this.#deletetaskCallbacks.forEach((cb) => cb(taskId));
      });
    });
  }

  #insertRowAtTop(tbody, row) {
    if (tbody.firstChild !== null) {
      tbody.insertBefore(row, tbody.firstChild);
    } else {
      tbody.appendChild(row);
    }
  }

  #findRowById(id) {
    const tbody = this.#getExistingTbody();
    return tbody ? tbody.querySelector(`tr[data-id="${id}"]`) : null;
  }

  #getExistingTbody() {
    const table = this.#container.querySelector("table");
    return table ? table.querySelector("tbody") : null;
  }
}
registerComponent("task-list", TaskList);
