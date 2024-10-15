document.addEventListener("DOMContentLoaded", () => {
    const todoListElement = document.getElementById("todos");
    const addTodoButton = document.getElementById("add-todo-btn");
    const errorMessageElement = document.getElementById("error-message");
    const loginRegisterForm = document.getElementById("login-register-form");
    const loginButton = document.getElementById("login-btn");
    const registerButton = document.getElementById("register-btn");

    let token = localStorage.getItem("token");

    // check if user is logged in
    if (token) {
        loginRegisterForm.style.display = "none";
        document.querySelector('.todo-form').style.display = "block";
        document.querySelector('.todo-list').style.display = "block";
        loadTodos();
    }

    // login
    loginButton.addEventListener("click", () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        fetch("https://api.vtrcordeiro.online/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
        .then(async response => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            return response.json();
        })
        .then(data => {
            const token = data.access_token;
            console.log("Token:", token);
            localStorage.setItem("token", token);
            loginRegisterForm.style.display = "none";
            document.querySelector('.todo-form').style.display = "block";
            document.querySelector('.todo-list').style.display = "block";
            location.reload();
        })
        .catch(error => {
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        });
    });

    registerButton.addEventListener("click", () => {
        const registerEmail = document.getElementById("register-email").value;
        const registerPassword = document.getElementById("register-password").value;

        fetch("https://api.vtrcordeiro.online/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: registerEmail, password: registerPassword }),
        })
        .then(async response => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            return response.json();
        })
        .then(data => {
            console.log("Registro bem-sucedido:", data);
            loginRegisterForm.style.display = "none";
            alert("Registro bem-sucedido! Agora você pode fazer login.");
            location.reload();
        })
        .catch(error => {
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        });
    });

    // get all todos
    async function loadTodos() {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        if (!token) return;
    
        try {
            const response = await fetch("https://api.vtrcordeiro.online/todos/?per_page=100", {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error("Erro na resposta da API: " + response.statusText);
            }
    
            const data = await response.json();
            console.log("Dados recebidos:", data);
    
            todoListElement.innerHTML = '';
            if (data.todos.length === 0) {
                todoListElement.innerHTML = "<li>Sem tarefas para mostrar.</li>";
                return;
            }
    
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
    
                todoHeader.appendChild(titleElement);
                todoHeader.appendChild(statusElement);
                todoHeader.appendChild(removeButton);
                todoHeader.appendChild(updateButton);
    
                todoItem.appendChild(todoHeader);
                todoItem.appendChild(descriptionElement);
    
                todoListElement.appendChild(todoItem);
            });
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        }
    }

    // add new todo
    addTodoButton.addEventListener("click", async () => {
        const title = document.getElementById("new-todo-title").value;
        const description = document.getElementById("new-todo-description").value;

        const newTodo = {
            title: title,
            description: description
        };

        errorMessageElement.style.display = 'none';
        errorMessageElement.textContent = '';

        try {
            const response = await fetch("https://api.vtrcordeiro.online/todos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newTodo),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            await response.json();
            loadTodos();
        } catch (error) {
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        }
    });

    // update todo
    window.updateTodoStatus = async (todoId, currentStatus) => {
        let newStatus;

        if (currentStatus === "pendente") {
            newStatus = "incompleta";
        } else if (currentStatus === "incompleta") {    
            newStatus = "completa";
        } else {
            newStatus = "pendente";
        }

        try {
            const response = await fetch(`https://api.vtrcordeiro.online/todos/${todoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            await response.json();
            loadTodos();
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        }
    };

    // delete todo
    window.deleteTodo = async (todoId) => {
        try {
            const response = await fetch(`https://api.vtrcordeiro.online/todos/${todoId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            await response.json();
            loadTodos();
        } catch (error) {
            console.error("Erro ao remover tarefa:", error);
            errorMessageElement.textContent = error.message;
            errorMessageElement.style.display = 'block';
        }
    };

    loadTodos();
});
