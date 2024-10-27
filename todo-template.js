export default function todoTemplate(todo) {
  return `
  <li>
    <input
      type="checkbox"
      checked=${todo.done}
    />
    <p class={todo.done ? "done" : "not-done"}>${todo.title}</p>
    <button>🗑️</button>
  </li>
  `;
}
