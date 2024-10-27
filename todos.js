import express from "express";
import { neon } from "@neondatabase/serverless";
import todoTemplate from "./todo-template.js";
import cookieParser from "cookie-parser";

const getDb = (authToken) =>
  neon(process.env.DATABASE_AUTHENTICATED_URL, { authToken });

const router = express.Router();

router.use(cookieParser());

async function getTodos(token) {
  const sql = getDb(token);
  const rows = await sql`
    SELECT * FROM todos;
  `;

  // const rows = [
  //   { id: 1, title: "Buy milk", done: false },
  //   { id: 2, title: "Buy eggs", done: true },
  //   { id: 3, title: "Buy bread", done: false },
  // ];

  return rows.map((row) => todoTemplate(row));
}

router.get("/", async (req, res) => {
  const token = req.cookies.__token_jwt;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  const todos = await getTodos(token);

  res.send(todos.join(""));
});

router.post("/", async (req, res) => {
  const token = req.cookies.__token_jwt;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const sql = getDb(token);
  await sql`
    INSERT INTO todos (title, done)
    VALUES (${req.body.title}, ${req.body.done});
  `;
  const todos = await getTodos(token);
  res.send(todos.join(""));
});

router.post("/:id/toggle", async (req, res) => {
  const token = req.cookies.__token_jwt;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const todos = await getTodos(token);
  res.send(todos.join(""));
});

router.delete("/:id", async (req, res) => {
  const token = req.cookies.__token_jwt;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const todos = await getTodos(token);
  res.send(todos.join(""));
});

export default router;
