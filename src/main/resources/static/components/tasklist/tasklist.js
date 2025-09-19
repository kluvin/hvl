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
        this.shadowRoot.appendChild(template.content.cloneNode(true));
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
        let table = this._container.querySelector("table");
        let tbody = table ? table.querySelector("tbody") : null;
        if (!table || !tbody) {
            const frag = tasktable.content.cloneNode(true);
            this._container.appendChild(frag);
            table = this._container.querySelector("table");
            tbody = table ? table.querySelector("tbody") : null;
        }

        const rowFragment = taskrow.content.cloneNode(true);
        const row = rowFragment.querySelector("tr");
        row.dataset.id = String(task.id);

        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
            cells[0].textContent = task.title ?? "";
            cells[1].textContent = task.status ?? "";
        }

        const select = row.querySelector("select");
        if (select) {
            if (Array.isArray(this._allstatuses)) {
                this._allstatuses.forEach((s) => {
                    const opt = document.createElement("option");
                    opt.value = String(s);
                    opt.textContent = String(s);
                    select.appendChild(opt);
                });
            }
            select.addEventListener("change", () => {
                const value = select.value;
                if (value !== "0") {
                        this._changestatusCallbacks.forEach((cb) => cb(task.id, value));
                    select.value = "0";
                }
            });
        }

        const btn = row.querySelector("button");
        if (btn) {
            btn.addEventListener("click", () => {
                this._deletetaskCallbacks.forEach(cb => cb(task.id));
            });
        }

        if (tbody.firstChild) {
            tbody.insertBefore(row, tbody.firstChild);
        } else {
            tbody.appendChild(row);
        }
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        /**
         * Fill inn the code
         */
        const table = this._container.querySelector("table");
        const tbody = table ? table.querySelector("tbody") : null;
        if (!tbody) return;
        const targetId = String(task.id);
        const row = Array.from(tbody.querySelectorAll("tr")).find((tr) => tr.dataset.id === targetId);
        if (!row) return;
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
            cells[1].textContent = task.status ?? "";
        }
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        /**
         * Fill inn the code
         */
        const table = this._container.querySelector("table");
        const tbody = table ? table.querySelector("tbody") : null;
        if (!tbody) return;
        const targetId = String(id);
        const row = Array.from(tbody.querySelectorAll("tr")).find((tr) => tr.dataset.id === targetId);
        if (!row) return;
        row.remove();
        if (tbody.children.length === 0) {
            this._container.innerHTML = "";
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        /**
         * Fill inn the code
         */
        const table = this._container.querySelector("table");
        const tbody = table ? table.querySelector("tbody") : null;
        return tbody ? tbody.children.length : 0;
    }
}
customElements.define('task-list', TaskList);
