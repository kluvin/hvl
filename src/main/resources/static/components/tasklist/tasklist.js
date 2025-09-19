import { createOptionElement } from "../utils/options.js";
import {
    registerComponent,
    renderTemplate,
    withElement,
} from "../utils/dom.js";

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
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

    constructor() {
        super();

        /**
         * Fill inn rest of the code
         */
        this.attachShadow({ mode: "open" });
        renderTemplate(this.shadowRoot, template);
        this._container = this.shadowRoot.getElementById("tasklist");
        this._allstatuses = [];
        this._changestatusCallbacks = [];
        this._deletetaskCallbacks = [];
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        /**
         * Fill inn the code
         */
        this._allstatuses = Array.isArray(allstatuses) ? allstatuses.slice() : [];
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
            this._changestatusCallbacks.push(callback);
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
            this._deletetaskCallbacks.push(callback);
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
        withElement(this._ensureTableBody(), (tbody) => {
            const row = this._createRow(task);
            this._insertRowAtTop(tbody, row);
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
        withElement(this._findRowById(task.id), (row) => {
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
        withElement(this._getExistingTbody(), (tbody) => {
            withElement(this._findRowById(id), (row) => {
                row.remove();
                if (tbody.children.length === 0) {
                    this._container.innerHTML = "";
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
        const tbody = this._getExistingTbody();
        return tbody ? tbody.children.length : 0;
    }

    _ensureTableBody() {
        let table = this._container.querySelector("table");
        let tbody = table ? table.querySelector("tbody") : null;
        if (tbody) return tbody;
        const fragment = tasktable.content.cloneNode(true);
        this._container.appendChild(fragment);
        table = this._container.querySelector("table");
        return table ? table.querySelector("tbody") : null;
    }

    _createRow(task) {
        const fragment = taskrow.content.cloneNode(true);
        const row = fragment.querySelector("tr");
        const taskIdString = String(task.id);
        row.dataset.id = taskIdString;
        this._fillRowCells(row, task);
        this._populateStatusSelect(row, task.id);
        this._wireDeleteButton(row, task.id);
        return row;
    }

    _fillRowCells(row, task) {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
            cells[0].textContent = task.title ?? "";
            cells[1].textContent = task.status ?? "";
        }
    }

    _populateStatusSelect(row, taskId) {
        withElement(row.querySelector("select"), (select) => {
            if (Array.isArray(this._allstatuses)) {
                this._allstatuses.forEach((status) => {
                    select.appendChild(createOptionElement(status));
                });
            }
            select.addEventListener("change", () => {
                const value = select.value;
                if (value !== "0") {
                    this._changestatusCallbacks.forEach((cb) => cb(taskId, value));
                    select.value = "0";
                }
            });
        });
    }

    _wireDeleteButton(row, taskId) {
        withElement(row.querySelector("button"), (button) => {
            button.addEventListener("click", () => {
                this._deletetaskCallbacks.forEach((cb) => cb(taskId));
            });
        });
    }

    _insertRowAtTop(tbody, row) {
        if (tbody.firstChild) {
            tbody.insertBefore(row, tbody.firstChild);
        } else {
            tbody.appendChild(row);
        }
    }

    _findRowById(id) {
        const tbody = this._getExistingTbody();
        if (!tbody) return null;
        const targetId = String(id);
        return Array.from(tbody.querySelectorAll("tr")).find(
            (tr) => tr.dataset.id === targetId,
        ) || null;
    }

    _getExistingTbody() {
        const table = this._container.querySelector("table");
        return table ? table.querySelector("tbody") : null;
    }
}
registerComponent('task-list', TaskList);
