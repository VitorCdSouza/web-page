document.addEventListener("DOMContentLoaded", () => {
    const todoListElement = document.getElementById("todos");
    const addTodoButton = document.getElementById("add-todo-btn");

    // get all todos
    function loadTodos() {
        fetch("http://127.0.0.1:5000/todos?per_page=100")
            .then(response => response.json())
            .then(data => {
                todoListElement.innerHTML = '';
                data.todos.forEach(todo => {
                    const todoItem = document.createElement("li");
                    todoItem.innerHTML = `
                        <span>${todo.title} - ${todo.status}</span>
                        <button onclick="deleteTodo(${todo.id})">Remover</button>
                        <button class="todo-status" onclick="updateTodoStatus(${todo.id}, '${todo.status}')">Atualizar Status</button>
                    `;
                    todoListElement.appendChild(todoItem);
                });
            });
    }

    // load todos when page started
    loadTodos();
});
