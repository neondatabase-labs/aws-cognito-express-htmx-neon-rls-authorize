import jwt from "jsonwebtoken";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import todos from "./todos.js";
import auth from "./auth.js";

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

const app = express();

app.use(express.static("public"));
app.use(morgan("combined"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/todos", todos);
app.use("/auth", auth);
app.use(cookieParser());

app.get("/", (req, res) => {
  if (req.cookies.__token_jwt) {
    return res.redirect("/app");
  }
  res.sendFile("index.html", { root: "html" });
});

app.get("/app", (req, res) => {
  if (!req.cookies.__token_jwt) {
    return res.redirect("/");
  }
  res.sendFile("app.html", { root: "html" });
});

app.get("/verify", (req, res) => {
  if (req.cookies.__token_jwt) {
    return res.redirect("/app");
  }
  res.sendFile("verify.html", { root: "html" });
});

app.get("signup", (req, res) => {
  if (req.cookies.__token_jwt) {
    return res.redirect("/app");
  }
  res.sendFile("signup.html", { root: "html" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
