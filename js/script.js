"use strict";

(function () {
  const todoList = {
    formId: null,
    form: null,
    currentElemId: 0,
    todoContainerId: `todoItems`,
    todoContainer: null,
    deleteAllElemsBtn: null,

    init(todoListFormID) {
      if (typeof todoListFormID !== "string" || todoListFormID.length === 0) {
        throw new Error("Todo list ID is not valid");
      }

      this.formId = todoListFormID;
      this.findForm();
      this.getTodoContainer();
      this.getDeleteAllElems();
      this.addFormEvents();
    },

    findForm() {
      const form = document.getElementById(this.formId);

      if (form === null || form.nodeName !== "FORM") {
        throw new Error("There is no such form on the page");
      }

      this.form = form;
      return form;
    },

    getTodoContainer() {
      const container = document.getElementById(this.todoContainerId);
      container ? (this.todoContainer = container) : null;
    },

    getDeleteAllElems() {
      this.deleteAllElemsBtn = this.form.querySelector(`.delete-all-elems`);
    },

    addFormEvents() {
      this.form.addEventListener("submit", (event) => this.formHandler(event));

      document.addEventListener(
        "DOMContentLoaded",
        this.preFillHandler.bind(this)
      );

      this.todoContainer.addEventListener(
        `change`,
        this.checkTodoElem.bind(this)
      );

      this.todoContainer.addEventListener(
        `click`,
        this.deleteElement.bind(this)
      );

      this.deleteAllElemsBtn.addEventListener(
        `click`,
        this.deleteAllTodoElems.bind(this)
      );
    },

    formHandler(event) {
      event.preventDefault();
      this.currentElemId += 1;

      let data = {
        id: this.formId,
        completed: false,
        elemId: this.currentElemId,
        ...this.findInputs(),
      };

      this.setData(data);
      this.todoContainer.prepend(this.createTemplate(data));
      event.target.reset();
    },

    findInputs() {
      return Array.from(
        this.form.querySelectorAll("input[type=text], textarea")
      ).reduce((accum, item) => {
        if (item.value.trim() === ``) {
          alert(`Enter a value in the fields`);
          throw new Error(`Input error`);
        }

        accum[item.name] = item.value;
        return accum;
      }, {});
    },

    setData(data) {
      if (!this.validateData(data)) throw new Error(`Validation Error.`);

      const keyInDataBase = data.id;
      delete data.id;

      if (!localStorage.getItem(keyInDataBase)) {
        let arr = [];
        arr.push(data);
        localStorage.setItem(keyInDataBase, JSON.stringify(arr));
        return;
      }

      const existingData = JSON.parse(localStorage.getItem(keyInDataBase));
      existingData.push(data);
      localStorage.setItem(keyInDataBase, JSON.stringify(existingData));
    },

    validateData(data) {
      if (Object.keys(data).length === 0) return false;

      for (const key in data) {
        if (data[key] === ``) return false;
      }

      return true;
    },

    checkTodoElem({ target }) {
      const elemId = target.getAttribute(`data-elem-id`);
      const statusExecution = target.checked;

      this.changeCompleted(elemId, this.formId, statusExecution);
    },

    changeCompleted(elemId, dataBaseKey, statusExecution) {
      const data = JSON.parse(localStorage.getItem(dataBaseKey));
      const currentElem = data.find((todoItem) => todoItem.elemId === +elemId);
      currentElem.completed = statusExecution;
      localStorage.setItem(dataBaseKey, JSON.stringify(data));
    },

    deleteElement({ target }) {
      if (!target.classList.contains(`delete-btn`)) return;

      this.deleteItem(this.formId, target.getAttribute(`data-elem-id`));
      const todoElemContainer = this.findParentElemByClass(
        target,
        "taskWrapper"
      );
      todoElemContainer.parentElement.remove();
    },

    deleteItem(dataBaseKey, elemId) {
      if (!elemId) throw new Error(`Element id is not defined`);

      const data = JSON.parse(localStorage.getItem(dataBaseKey));
      const currentElemIndex = data.findIndex(
        (todoItem) => todoItem.elemId === +elemId
      );
      data.splice(currentElemIndex, 1);
      localStorage.setItem(dataBaseKey, JSON.stringify(data));
    },

    findParentElemByClass(currentElem, parentClassName) {
      if (currentElem === null) return null;

      if (currentElem.classList.contains(parentClassName)) {
        return currentElem;
      }

      return this.findParentElemByClass(
        currentElem.parentElement,
        parentClassName
      );
    },

    deleteAllTodoElems() {
      this.deleteAll(this.formId);
      this.todoContainer.innerHTML = "";
    },

    deleteAll(dataBaseKey) {
      localStorage.removeItem(dataBaseKey);
    },

    createTemplate({ title, description, elemId, completed }) {
      const todoItem = this.createElement("div", "col-4");
      const taskWrapper = this.createElement("div", "taskWrapper");

      todoItem.append(taskWrapper);

      const taskHeading = this.createElement("div", "taskHeading", title);
      const taskDescription = this.createElement(
        "div",
        "taskDescription",
        description
      );
      let checkboxElemWrapper = this.createElement(`label`, `completed`);
      let innerContentCheckBox = `<input data-elem-id="${elemId}" type="checkbox" class="form-check-input" >`;
      checkboxElemWrapper.innerHTML = innerContentCheckBox;

      let checkboxElemStatus = this.createElement(
        `span`,
        `status-action`,
        "status"
      );
      let innerContentDeleteBtn = `<button class="btn btn-danger delete-btn" data-elem-id="${elemId}">Delete</button>`;

      taskWrapper.append(taskHeading);
      taskWrapper.append(taskDescription);
      taskWrapper.append(checkboxElemWrapper);
      checkboxElemWrapper.append(checkboxElemStatus);
      taskWrapper.innerHTML += innerContentDeleteBtn;

      todoItem.querySelector(`input[type=checkbox]`).checked = completed;

      return todoItem;
    },

    createElement(nodeName, classes, innerContent) {
      const el = document.createElement(nodeName);

      if (Array.isArray(classes)) {
        classes.forEach((singleClassName) => {
          el.classList.add(singleClassName);
        });
      } else {
        el.classList.add(classes);
      }

      if (innerContent) {
        el.innerHTML = innerContent;
      }

      return el;
    },

    preFillHandler() {
      const data = this.getData();

      if (!data || !data.length) return;

      this.currentElemId = data[data.length - 1].elemId;
      const todoContainer = document.getElementById(this.todoContainerId);

      data.forEach((todoItem) => {
        const template = this.createTemplate(todoItem);
        todoContainer.prepend(template);
      });
    },

    getData() {
      return JSON.parse(localStorage.getItem(this.formId));
    },
  };

  todoList.init("todoForm");
})();
