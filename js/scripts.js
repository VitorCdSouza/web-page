document.addEventListener("DOMContentLoaded", () => {
    const todoListElement = document.getElementById("todos");
    const addTodoButton = document.getElementById("add-todo-btn");
    const errorMessageElement = document.getElementById("error-message");

    // get all todos
    function loadTodos() {
        fetch("http://127.0.0.1:5000/todos?per_page=100")
            .then(response => response.json())
            .then(data => {
                todoListElement.innerHTML = '';
                data.todos.forEach(todo => {
                    const todoItem = document.createElement("li");
                    todoItem.classList.add("todo-item");

                    const todoHeader = document.createElement("div");
                    todoHeader.classList.add("todo-header");

                    const titleElement = document.createElement("span");
                    titleElement.classList.add("todo-title");
                    titleElement.textContent = todo.title;

                    const statusElement = document.createElement("span");
                    statusElement.classList.add("todo-status");
                    statusElement.textContent = todo.status;

                    const removeButton = document.createElement("button");
                    removeButton.classList.add("todo-remove-btn");
                    removeButton.textContent = "Remover";
                    removeButton.onclick = () => deleteTodo(todo.id);

                    const updateButton = document.createElement("button");
                    updateButton.classList.add("todo-update-btn");
                    updateButton.textContent = "Atualizar Status";
                    updateButton.onclick = () => updateTodoStatus(todo.id, todo.status);

                    const descriptionElement = document.createElement("div");
                    descriptionElement.classList.add("todo-description");
                    descriptionElement.textContent = todo.description || "Sem descrição";

                    // adding elements to todo items
                    todoHeader.appendChild(titleElement);
                    todoHeader.appendChild(statusElement);
                    todoHeader.appendChild(removeButton);
                    todoHeader.appendChild(updateButton);

                    todoItem.appendChild(todoHeader);
                    todoItem.appendChild(descriptionElement);

                    todoListElement.appendChild(todoItem);
                });
            });
    }

    // add new todo
    addTodoButton.addEventListener("click", () => {
        const title = document.getElementById("new-todo-title").value;
        const description = document.getElementById("new-todo-description").value;

        const newTodo = {
            title: title,
            description: description
        };

        // reseting error div
        errorMessageElement.style.display = 'none';
        errorMessageElement.textContent = '';

        fetch("http://127.0.0.1:5000/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTodo),
        })
        .then(async response => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            return response.json();
        })
        .then(data => {
            errorMessageElement.style.display = 'none';
            loadTodos();
        })
        .catch(error => {
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        });
    });

    // update todo
    window.updateTodoStatus = (todoId, currentStatus) => {
        let newStatus;

        if (currentStatus === "pendente") {
            newStatus = "incompleta";
        } else if (currentStatus === "incompleta") {    
            newStatus = "completa";
        } else {
            newStatus = "pendente";
        }

        fetch(`http://127.0.0.1:5000/todos/${todoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
            loadTodos();
        });
    };

    // delete todo
    window.deleteTodo = (todoId) => {
        fetch(`http://127.0.0.1:5000/todos/${todoId}`, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            loadTodos();
        });
    };

    // load todos when page started
    loadTodos();
});
