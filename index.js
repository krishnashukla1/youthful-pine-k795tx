// index.js
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// In-memory storage for todos
let todos = [];

// Serve a simple HTML page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo App</title>
        <style>
            body { font-family: Arial, sans-serif; }
            ul { list-style: none; padding: 0; }
            li { margin: 10px 0; }
            button { margin-left: 10px; }
        </style>
    </head>
    <body>
        <h1>Todo App</h1>
        <input id="todoInput" placeholder="Add a new todo..." />
        <button id="addButton">Add Todo</button>
        <ul id="todoList"></ul>

        <script>
            // Function to fetch and display todos
            function fetchTodos() {
                fetch('/api/todos')
                    .then(response => response.json())
                    .then(data => {
                        const todoList = document.getElementById('todoList');
                        todoList.innerHTML = ''; // Clear the list before rendering
                        data.forEach(todo => {
                            const li = document.createElement('li');
                            li.textContent = todo.title;

                            // Create update button
                            const updateButton = document.createElement('button');
                            updateButton.textContent = 'Update';
                            updateButton.onclick = () => updateTodo(todo.id);

                            // Create delete button
                            const deleteButton = document.createElement('button');
                            deleteButton.textContent = 'Delete';
                            deleteButton.onclick = () => deleteTodo(todo.id);

                            li.appendChild(updateButton);
                            li.appendChild(deleteButton);
                            todoList.appendChild(li);
                        });
                    });
            }

            // Add todo
            document.getElementById('addButton').onclick = function() {
                const input = document.getElementById('todoInput');
                const title = input.value;
                if (title) {
                    fetch('/api/todos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title })
                    })
                    .then(response => response.json())
                    .then(() => {
                        input.value = '';
                        fetchTodos(); // Refresh the todo list
                    });
                }
            };

            // Update todo
            function updateTodo(id) {
                const newTitle = prompt('Enter new title:');
                if (newTitle) {
                    fetch('/api/todos/' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newTitle })
                    })
                    .then(() => fetchTodos()); // Refresh the todo list
                }
            }

            // Delete todo
            function deleteTodo(id) {
                fetch('/api/todos/' + id, {
                    method: 'DELETE'
                })
                .then(() => fetchTodos()); // Refresh the todo list
            }

            // Initial fetch of todos
            fetchTodos();
        </script>
    </body>
    </html>
    `);
});

// API to get all todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// API to add a new todo
app.post("/api/todos", (req, res) => {
  const newTodo = {
    id: Date.now(),
    title: req.body.title,
    completed: false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// API to update a todo
app.put("/api/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (todo) {
    todo.title = req.body.title;
    res.json(todo);
  } else {
    res.status(404).send("Todo not found");
  }
});

// API to delete a todo
app.delete("/api/todos/:id", (req, res) => {
  todos = todos.filter((todo) => todo.id !== parseInt(req.params.id));
  res.sendStatus(204);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
