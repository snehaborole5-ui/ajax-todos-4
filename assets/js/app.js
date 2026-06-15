const cl = console.log;
const todoform = document.getElementById('todoform')
const title = document.getElementById('title')
const userId = document.getElementById('userId')
const completed = document.getElementById('completed')
const Addtodo = document.getElementById('Addtodo')
const Updatetodo = document.getElementById('Updatetodo')
const todocontainer = document.getElementById('todocontainer')
const spinner = document.getElementById('spinner')



let todoArr =[]

let Base_url ='https://jsonplaceholder.typicode.com/todos'



function snackbar(msg,icon){
    swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

function showicon(status){
    if(status.toString() == 'true'){ 
        return `<i class="fa-regular fa-square-check fa-2x text-success"></i>`
    }else{
        return `<i class="fa-regular fa-circle-xmark fa-2x text-danger"></i>`
    }
}



function fetchtodos (){
    
    spinner.classList.remove('d-none')
    let xhr = new XMLHttpRequest()


    xhr.open('GET',Base_url)

    xhr.send(null)

    xhr.onload = function(){
        todoArr = JSON.parse(xhr.response)
        
        createposts(todoArr.reverse())
        
    }

}

fetchtodos()




function createposts(arr){
    let result = ''
    arr.forEach((ele,i) =>{
        result +=`<tr id=${ele.id}>
					    <td>${arr.length- i}</td>
						<td>${ele.userId}</td>
						<td>${ele.title}</td>
						<td>${showicon(ele.completed)}</td>
						<td><i class="fa-regular fa-pen-to-square fa-2x text-success" onclick='Onedit(${ele.id})'></i></td>
						<td><i class="fa-solid fa-trash fa-2x text-danger" onclick='Onremove(${ele.id})'></i></td>
		    	    </tr>`
    })


    todocontainer.innerHTML =result


    spinner.classList.add('d-none')
}


function onsubmit(ele){
    spinner.classList.remove('d-none')

    ele.preventDefault()

    let newtodo ={
        title : title.value,
        userId : userId.value,
        completed : completed.value
    }

    todoArr.unshift(newtodo)

    let xhr = new XMLHttpRequest()
    xhr.open('POST',Base_url)

    xhr.send(JSON.stringify(newtodo))

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status <= 299){
            let res = JSON.parse(xhr.response)


            createnewtodo(newtodo,res)
        }
    }

}


function createnewtodo(newtodo,res){
    let tr = document.createElement('tr')
    tr.id = res.id
    
    tr.innerHTML =`<td>${todoArr.length}</td>
						<td>${newtodo.userId}</td>
						<td>${newtodo.title}</td>
						<td>${showicon(newtodo.completed)}</td>
						<td><i class="fa-regular fa-pen-to-square fa-2x text-success" onclick='Onedit(${res.id})'></i></td>
						<td><i class="fa-solid fa-trash fa-2x text-danger" onclick='Onremove(${res.id})'></i></td>
		    	    `

    todocontainer.prepend(tr)
    spinner.classList.add('d-none')


    snackbar(`The new todo with id ${res.id} is Added Successfully!!!`,'success')

    todoform.reset()
}


function Onedit(id){
    spinner.classList.add('d-none')

    let editid = id;
    localStorage.setItem('editId',editid)
    let editUrl = `${Base_url}/${editid}`

    let xhr = new XMLHttpRequest()
    
    xhr.open('GET',editUrl)

    xhr.send(null)

    xhr.onload = function () {
        if(xhr.status >= 200 && xhr.status <= 299){
            let editObj = JSON.parse(xhr.response)

            title.value = editObj.title
            userId.value = editObj.userId
            completed.value = editObj.completed



            Addtodo.classList.add('d-none')
            Updatetodo.classList.remove('d-none')



        }

        spinner.classList.add('d-none')

    }


}

function onupdate(){
    spinner.classList.remove('d-none')

    let updateId = localStorage.getItem('editId')

    let updateObj ={
        title : title.value,
        userId : userId.value,
        completed : completed.value,
        id : updateId
    }


    let updateUrl = `${Base_url}/${updateId}`

    let xhr = new XMLHttpRequest()

    xhr.open('PUT',updateUrl)

    xhr.send(JSON.stringify(updateObj))

    xhr.onload = function () {
        if(xhr.status >= 200 && xhr.status <= 299){
            let tr = document.getElementById(updateId).children

            tr[1].innerText = updateObj.userId
            tr[2].innerText = updateObj.title
            tr[3].innerHTML = showicon(updateObj.completed)
            
            Addtodo.classList.remove('d-none')
            Updatetodo.classList.add('d-none')
            snackbar(`The  todo with id ${updateId} is Updated Successfully!!!`,'success')


        }

     spinner.classList.add('d-none')

    }



}


function Onremove(id){
    let removeId =id;

    let removeURl = `${Base_url}/${removeId}`


    Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
    }).then((result) => {
    if (result.isConfirmed){
        
        let xhr = new XMLHttpRequest()

        xhr.open('DELETE',removeURl)

        xhr.send(null)

        xhr.onload = function () {
            if(xhr.status >= 200 && xhr.status <= 299){
                let tr = document.getElementById(removeId)

                tr.remove()

                snackbar(`The todo Item with id ${removeId} is Removed Successfully!!!`,'success')
            }
        }
    }
    });











}







todoform.addEventListener('submit',onsubmit)
Updatetodo.addEventListener('click',onupdate)