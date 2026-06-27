const cl = console.log;


const spinner = document.getElementById('spinner');
const todoContainer = document.getElementById('todoContainer');
const todoForm = document.getElementById('todoForm');
const titleControl = document.getElementById('title');
const userIdControl = document.getElementById('userId');
const completedControl = document.getElementById('completed');
const addTodoBtn = document.getElementById('addTodoBtn');
const updateTodoBtn = document.getElementById('updateTodoBtn');


const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalIcon = document.getElementById('closeModalIcon');
const todoModal = document.getElementById('todoModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');

const BASE_URL = `https://jsonplaceholder.typicode.com`;
const TODO_URL = `${BASE_URL}/todos`;

let todosArr = [];
let updateId = null;


function openModal(isEdit = false) {
    if(isEdit) {
        modalTitle.innerText = "Update Todo Details";
        addTodoBtn.classList.add('d-none');
        updateTodoBtn.classList.remove('d-none');
    } else {
        modalTitle.innerText = "Add New Todo";
        addTodoBtn.classList.remove('d-none');
        updateTodoBtn.classList.add('d-none');
        todoForm.reset();
    }
    todoModal.style.display = 'block';
    modalBackdrop.style.display = 'block';
}

function closeModal() {
    todoModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
    todoForm.reset();
    updateId = null;
}


openModalBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
closeModalIcon.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal); 

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000,
        showConfirmButton: false
    });
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
}

function saveToLocalStorage(data) {
    localStorage.setItem('myTodosList', JSON.stringify(data));
}

function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem('myTodosList'));
}


function fetchTodos() {
    const localData = getFromLocalStorage();
    if (localData && localData.length > 0) {
        todosArr = localData;
        renderTodoRows(todosArr);
        return;
    }

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', TODO_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let data = JSON.parse(xhr.response);
            todosArr = [...data].reverse(); 
            saveToLocalStorage(todosArr);
            renderTodoRows(todosArr);
        } else {
            snackbar('Error while fetching the data!', 'error');
        }
    };
    xhr.onerror = function() {
        spinner.style.display = 'none';
        snackbar('Network Error!', 'error');
    };
}


function renderTodoRows(arr) {
    let result = '';
    arr.forEach(todo => {
        let statusIcon = todo.completed 
            ? `<svg class="status-icon status-success" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>` 
            : `<svg class="status-icon status-danger" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;
            
        result += `
            <tr id='todo-${todo.id}'>
                <td>${todo.id}</td>
                <td data-toggle="tooltip" title="${todo.title}">${todo.title}</td>
                <td class="text-center">${statusIcon}</td>
                <td class="text-center">
                    <button onclick="onEdit('${todo.id}')" class="btn-action btn-edit-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </td>
                <td class="text-center">
                    <button onclick="onRemove('${todo.id}')" class="btn-action btn-remove-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    todoContainer.innerHTML = result;
    initTooltips();
}

// Form Submit
function onTodoSubmit(eve) {
    eve.preventDefault();

    let TODO_OBJ = {
        title: titleControl.value,
        userId: Number(userIdControl.value),
        completed: completedControl.value === 'true'
    };

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('POST', TODO_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(TODO_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            
            // Unique ID Generation logic
            res.id = todosArr.length > 0 ? Math.max(...todosArr.map(t => Number(t.id))) + 1 : 1;
            res.title = res.title || TODO_OBJ.title;
            res.userId = res.userId || TODO_OBJ.userId;
            res.completed = res.hasOwnProperty('completed') ? res.completed : TODO_OBJ.completed;

            todosArr.unshift(res);
            saveToLocalStorage(todosArr);

            let tr = document.createElement('tr');
            tr.id = `todo-${res.id}`;
            let statusIcon = res.completed 
                ? `<svg class="status-icon status-success" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>` 
                : `<svg class="status-icon status-danger" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;

            tr.innerHTML = `
                <td>${res.id}</td>
                <td data-toggle="tooltip" title="${res.title}">${res.title}</td>
                <td class="text-center">${statusIcon}</td>
                <td class="text-center">
                    <button onclick="onEdit('${res.id}')" class="btn-action btn-edit-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </td>
                <td class="text-center">
                    <button onclick="onRemove('${res.id}')" class="btn-action btn-remove-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            `;
            todoContainer.insertBefore(tr, todoContainer.firstChild);
            
            closeModal();
            initTooltips();
            snackbar(`New todo with id ${res.id} created !!!`, 'success');
        }
    };
}

// Edit Mode
function onEdit(id) {
    updateId = id;
    let todoToEdit = todosArr.find(t => t.id == updateId);

    if (todoToEdit) {
        titleControl.value = todoToEdit.title;
        userIdControl.value = todoToEdit.userId;
        completedControl.value = todoToEdit.completed ? "true" : "false";

        openModal(true); 
    }
}

// Update Mode
function onUpdateTodo() {
    let UPDATE_OBJ = {
        id: Number(updateId),
        title: titleControl.value,
        userId: Number(userIdControl.value),
        completed: completedControl.value === 'true'
    };

    spinner.style.display = 'flex';
    let UPDATE_URL = `${BASE_URL}/todos/${updateId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', UPDATE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(UPDATE_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            
            let index = todosArr.findIndex(t => t.id == updateId);
            if(index !== -1) {
                todosArr[index] = UPDATE_OBJ;
                saveToLocalStorage(todosArr);
            }

            let row = document.getElementById(`todo-${updateId}`);
            if(row) {
                let cells = row.getElementsByTagName('td');
                
                cells[1].innerHTML = UPDATE_OBJ.title;
                cells[1].setAttribute('data-original-title', UPDATE_OBJ.title);
                
                cells[2].innerHTML = UPDATE_OBJ.completed 
                    ? `<svg class="status-icon status-success" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>` 
                    : `<svg class="status-icon status-danger" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;
                
                
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('highlight');
                setTimeout(() => { row.classList.remove('highlight'); }, 3000);
            }

            initTooltips();
            closeModal();
            snackbar('Todo updated successfully !!!', 'success');
        }
    };
}

// Remove
function onRemove(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this todo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove'
    }).then(result => {
        if (result.isConfirmed) {
            spinner.style.display = 'flex';
            let REMOVE_URL = `${BASE_URL}/todos/${id}`;

            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', REMOVE_URL);
            xhr.send(null);

            xhr.onload = function () {
                spinner.style.display = 'none';
                if (xhr.status >= 200 && xhr.status <= 299) {
                    todosArr = todosArr.filter(t => t.id != id);
                    saveToLocalStorage(todosArr);

                    let row = document.getElementById(`todo-${id}`);
                    if(row) row.remove();
                    snackbar('Todo removed successfully !!!', 'success');
                }
            };
        }
    });
}


fetchTodos();

todoForm.addEventListener('submit', onTodoSubmit);
updateTodoBtn.addEventListener('click', onUpdateTodo);