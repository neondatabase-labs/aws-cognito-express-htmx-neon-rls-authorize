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

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

const app = express();

app.use(express.static("public"));
app.use(morgan("combined"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/todos", todos);
app.use(cookieParser());

// const generateSecretHash = (username, clientId, clientSecret) => {
//   return crypto
//     .createHmac("SHA256", clientSecret)
//     .update(username + clientId)
//     .digest("base64");
// };

app.post("/signup", async (req, res) => {
  const { password, email } = req.body;
  const username = email;
  // const secretHash = generateSecretHash(
  //   username,
  //   process.env.COGNITO_CLIENT_ID,
  //   process.env.COGNITO_CLIENT_SECRET
  // );
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    // SecretHash: secretHash,
    UserAttributes: [],
    Username: username,
    Password: password,
  };

  try {
    const command = new SignUpCommand(params);
    const response = await client.send(command);
    console.log(response);
    res
      .header("HX-Redirect", "/verify.html")
      .json({ message: "Signup successful" })
      .status(201)
      .end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const username = email;
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);
    res.cookie("__token_jwt", response.AuthenticationResult.AccessToken, {
      httpOnly: false,
      secure: false,
    });
    res.cookie(
      "__token_jwt_refresh",
      response.AuthenticationResult.RefreshToken,
      {
        httpOnly: false,
        secure: false,
      }
    );
    res.cookie("__token_jwt_id", response.AuthenticationResult.IdToken, {
      httpOnly: false,
      secure: false,
    });
    res
      .header("HX-Redirect", "/todo-app.html")
      .json({ message: response.AuthenticationResult })
      .status(201)
      .end();
    console.log(response);
  } catch (error) {
    if (error.name === "UserNotConfirmedException") {
      res
        .header("HX-Redirect", "/verify.html")
        .json({ message: "User not confirmed" });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  };

  try {
    const command = new ConfirmSignUpCommand(params);
    const response = await client.send(command);
    res.cookie("__token_jwt", response.AuthenticationResult.AccessToken, {
      httpOnly: false,
      secure: false,
    });
    res.cookie(
      "__token_jwt_refresh",
      response.AuthenticationResult.RefreshToken,
      {
        httpOnly: false,
        secure: false,
      }
    );
    res.cookie("__token_jwt_id", response.AuthenticationResult.IdToken, {
      httpOnly: false,
      secure: false,
    });
    res
      .header("HX-Redirect", "/todo-app.html")
      .json({ message: response.AuthenticationResult })
      .status(201)
      .end();
    res.header("HX-Redirect", "/todo-app.html").json({ message: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/protected", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.COGNITO_CLIENT_SECRET);
    req.user = decoded;
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
  res.json({ message: "Protected data" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
