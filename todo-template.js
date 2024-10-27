export default function todoTemplate(todo) {
  return `
  <li>
    <input
      type="checkbox"
      hx-post="/todos/${todo.id}/toggle"
      hx-target="#todo-list"
      hx-trigger="click"
      ${todo.done ? "checked=checked" : ""}
    />
    <p class=${todo.done ? "done" : "not-done"}>${todo.title}</p>
    <button hx-trigger="click" hx-delete="/todos/${
      todo.id
    }" hx-target="#todo-list">🗑️</button>
  </li>
  `;
}
