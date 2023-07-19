/* eslint-disable no-param-reassign */
// @ts-check

import axios from 'axios';

const routes = {
  tasksPath: () => '/api/tasks',
};

const baseURL = 'https://web-js-frontend-architecture-complex-state-5832991.evaluator4-5.hexlet.io';

const fullURL = new URL(routes.tasksPath(), baseURL);
// const fullURL = null;

class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'APIError';
  }
}

function createError(err) {
  return new APIError(
    err.message,
    err.code,
    err.response?.status ?? null,
  );
}

async function createTask(task) {
  try {
    await axios.post(fullURL ? fullURL.href : routes.tasksPath(), task);
  } catch (err) {
    throw createError(err);
  }
}

async function fetchTasks() {
  try {
    const response = await axios.get(fullURL ? fullURL.href : routes.tasksPath());
    return response.data;
  } catch (err) {
    throw createError(err);
  }
}

function createTaskEl(task) {
  const taskEl = document.createElement('li');
  taskEl.classList.add('list-group-item');
  taskEl.textContent = task.name;

  return taskEl;
}

function renderTasks(taskContainer, tasks) {
  tasks.forEach((task) => {
    taskContainer.append(createTaskEl(task));
  });
}

function renderTask(taskContainer, task) {
  taskContainer.prepend(createTaskEl(task));
}

function renderError(container, error) {
  const messageEl = document.createElement('li');
  messageEl.classList.add('list-group-item');
  messageEl.textContent = `${error.status ? error.status : ''} ${error.code} ${error.message}`;
  container.replaceChildren(messageEl);
}

export default async function app() {
  const state = {
    taskList: {
      tasks: [],
      errors: [],
    },
  };

  const taskListEl = document.getElementById('tasks');
  const inputEl = document.querySelector('.form-inline > input[type="text"]');
  const formEl = document.querySelector('.form-inline');

  await (async function displayTasksOnLaunch() {
    try {
      const data = await fetchTasks();
      state.taskList.tasks = data.items;

      if (state.taskList.tasks.length > 0) {
        renderTasks(taskListEl, state.taskList.tasks);
      }

      inputEl.focus();
    } catch (err) {
      state.taskList.errors.push(err);
      const { taskList: { errors } } = state;
      const lastError = errors[errors.length - 1];

      renderError(taskListEl, lastError);
    }
  }());

  async function handleTask(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const task = {
      name: formData.get('name'),
    };

    try {
      await createTask(task);
      state.taskList.tasks.unshift(task);

      if (state.taskList.errors.length > 0) {
        state.taskList.errors = [];
        taskListEl.innerHTML = '';
        renderTasks(taskListEl, state.taskList.tasks);
      } else {
        renderTask(taskListEl, task);
      }

      formEl.reset();
      inputEl.focus();
    } catch (err) {
      state.taskList.errors.push(err);
      renderError(taskListEl, err);
    }
  }

  formEl.addEventListener('submit', handleTask);
}
