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
    INSERT INTO todos (title, done, user_id)
    VALUES (${req.body.title}, false, auth.user_id());
  `;
  const todos = await getTodos(token);
  res.send(todos.join(""));
});

router.post("/:id/toggle", async (req, res) => {
  const token = req.cookies.__token_jwt;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const sql = getDb(token);
  await sql`
    UPDATE todos
    SET done = NOT done
    WHERE id = ${req.params.id} AND user_id = auth.user_id();
  `;
  const todos = await getTodos(token);
  res.send(todos.join(""));
});

router.delete("/:id", async (req, res) => {
  const token = req.cookies.__token_jwt;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const sql = getDb(token);
  await sql`
    DELETE FROM todos
    WHERE id = ${req.params.id} AND user_id = auth.user_id();
  `;
  const todos = await getTodos(token);
  res.send(todos.join(""));
});

export default router;
