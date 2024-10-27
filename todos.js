import express from "express";
import { neon } from "@neondatabase/serverless";
import todoTemplate from "./todo-template.js";
import cookieParser from "cookie-parser";

const getDb = (authToken) =>
  neon(process.env.DATABASE_AUTHENTICATED_URL, { authToken });

const router = express.Router();

router.use(cookieParser());

async function getTodos() {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM todos;
  `;

  return rows.map((row) => todoTemplate(row));
}

// Define your routes here
router.get("/", async (req, res) => {
  // Logic to get all todos
  const todos = await getTodos();

  res.send(todos.join(""));
});

router.post("/", async (req, res) => {
  const token = req.cookies.__token_jwt.trim();
  console.log(token);
  const sql = getDb(token);
  await sql`
    INSERT INTO todos (title, done)
    VALUES (${req.body.title}, ${req.body.done});
  `;
  const todos = await getTodos();
  res.send(todos.join(""));
});

router.post("/:id/toggle", async (req, res) => {
  // Logic to update a todo by id
  res.send(`Update todo with id ${req.params.id}`);
});

router.delete("/:id", async (req, res) => {
  // Logic to delete a todo by id
  res.send(`Delete todo with id ${req.params.id}`);
});

export default router;
