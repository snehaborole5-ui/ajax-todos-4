const cl = console.log;

const spinner = document.getElementById('spinner');
const postContainer = document.getElementById('postContainer');
const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('userId');
const addPostBtn = document.getElementById('addPostBtn');
const updatePostBtn = document.getElementById('updatePostBtn');

const BASE_URL = `https://jsonplaceholder.typicode.com`;
const POST_URL = `${BASE_URL}/posts`;

let postsArr = [];
let updateId = null;

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    });
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip({
        boundary: 'window'
    });
}

function fetchPosts() {
    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', POST_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let data = JSON.parse(xhr.response);
            postsArr = [...data];
            createPostCards(postsArr.reverse());
        } else {
            snackbar('Error while fetching data', 'error');
        }
    };
    xhr.onerror = function() {
        spinner.style.display = 'none';
        snackbar('Network Error!', 'error');
    };
}

function createPostCards(arr) {
    let result = '';
    arr.forEach(post => {
        result += `
            <div class="col-md-4 mb-3" id='${post.id}'>
                <div class="card h-100 shadow-sm bg-white border-0">
                    <div class="card-header bg-white">
                        <h3 class="h6 truncate-text mb-0" data-toggle="tooltip" title="${post.title}">
                           ${post.title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted truncate-text" data-toggle="tooltip" title="${post.body}">
                            ${post.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between bg-white border-top-0">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-success">Edit</button>
                        <button onclick="onRemove(this)" class="btn btn-sm btn-outline-warning">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    postContainer.innerHTML = result;
    initTooltips();
}

function onPostSubmit(eve) {
    eve.preventDefault();

    let POST_OBJ = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    };

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('POST', POST_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(POST_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            
            res.title = res.title || POST_OBJ.title;
            res.body = res.body || POST_OBJ.body;
            res.userId = res.userId || POST_OBJ.userId;

        
            $('#postModal').modal('hide');
            postForm.reset();

            let col = document.createElement('div');
            col.className = 'col-md-3 mb-3';
            col.id = res.id;
            col.innerHTML = `
                <div class="card h-100 shadow-sm bg-white border-0">
                    <div class="card-header bg-white">
                        <h3 class="h6 truncate-text mb-0" data-toggle="tooltip" title="${res.title}">
                            ${res.title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted truncate-text" data-toggle="tooltip" title="${res.body}">
                            ${res.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between bg-white border-top-0">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-success">Edit</button>
                        <button onclick="onRemove(this)" class="btn btn-sm btn-outline-warning">Remove</button>
                    </div>
                </div>
            `;
            postContainer.prepend(col);
            initTooltips();
            snackbar(`New post with id ${res.id} created !!!`, 'success');
        }
    };
}

function onEdit(ele) {
    updateId = ele.closest('.col-md-4').id;
    let EDIT_URL = `${BASE_URL}/posts/${updateId}`;

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', EDIT_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            titleControl.value = res.title;
            bodyControl.value = res.body;
            userIdControl.value = res.userId;

            addPostBtn.classList.add('d-none');
            updatePostBtn.classList.remove('d-none');
            
            $('#postModal').modal('show');
        }
    };
}

function onUpdatePost() {
    let UPDATE_OBJ = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    };

    spinner.style.display = 'flex';
    let UPDATE_URL = `${BASE_URL}/posts/${updateId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', UPDATE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(UPDATE_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            
            $('#postModal').modal('hide');

            let card = document.getElementById(updateId);
            let heading = card.querySelector('h3');
            let paragraph = card.querySelector('p');

            $(heading).tooltip('dispose');
            $(paragraph).tooltip('dispose');

            heading.innerHTML = UPDATE_OBJ.title;
            paragraph.innerHTML = UPDATE_OBJ.body;

            heading.setAttribute('title', UPDATE_OBJ.title);
            paragraph.setAttribute('title', UPDATE_OBJ.body);

            initTooltips();
            postForm.reset();

            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('highlight');
            setTimeout(() => { card.classList.remove('highlight'); }, 3000);

            updateId = null;
            addPostBtn.classList.remove('d-none');
            updatePostBtn.classList.add('d-none');
            snackbar('Post updated successfully !!!', 'success');
        }
    };
}

function onRemove(ele) {
    let REMOVE_ID = ele.closest('.col-md-4').id;

    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this post?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove'
    }).then(result => {
        if (result.isConfirmed) {
            spinner.style.display = 'flex';
            let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}`;

            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', REMOVE_URL);
            xhr.send(null);

            xhr.onload = function () {
                spinner.style.display = 'none';
                if (xhr.status >= 200 && xhr.status <= 299) {
                    let card = document.getElementById(REMOVE_ID);
                    $(card.querySelector('h3')).tooltip('dispose');
                    $(card.querySelector('p')).tooltip('dispose');
                    card.remove();
                    snackbar('Post removed successfully !!!', 'success');
                }
            };
        }
    });
}


$('#postModal').on('hidden.bs.modal', function () {
    postForm.reset();
    updateId = null;
    addPostBtn.classList.remove('d-none');
    updatePostBtn.classList.add('d-none');
});

fetchPosts();
postForm.addEventListener('submit', onPostSubmit);
updatePostBtn.addEventListener('click', onUpdatePost);