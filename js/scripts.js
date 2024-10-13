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
                    
                    todoItem.innerHTML = `
                        <span class="todo-title">${todo.title}</span>
                        <span class="todo-status">${todo.status}</span>
                        <button class="todo-remove-btn" onclick="deleteTodo(${todo.id})">Remover</button>
                        <button class="todo-update-btn" onclick="updateTodoStatus(${todo.id}, '${todo.status}')">Atualizar Status</button>
                    `;
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
        const newStatus = currentStatus === "pendente" ? "completa" : "pendente";

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
