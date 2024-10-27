import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const router = express.Router();

router.use(cookieParser());

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

router.post("/signup", async (req, res) => {
  const { password, email } = req.body;
  const username = email;
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    UserAttributes: [],
    Username: username,
    Password: password,
  };

  try {
    const command = new SignUpCommand(params);
    const response = await client.send(command);
    console.log(response);
    res
      .header("HX-Redirect", "/verify")
      .json({ message: "Signup successful" })
      .status(201)
      .end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
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
      .header("HX-Redirect", "/app")
      .json({ message: response.AuthenticationResult })
      .status(201)
      .end();
    console.log(response);
  } catch (error) {
    if (error.name === "UserNotConfirmedException") {
      res
        .header("HX-Redirect", "/verify")
        .json({ message: "User not confirmed" });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/verify", async (req, res) => {
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
        sameSite: "lax",
      }
    );
    res.cookie("__token_jwt_id", response.AuthenticationResult.IdToken, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });
    res
      .header("HX-Redirect", "/app")
      .json({ message: response.AuthenticationResult })
      .status(201)
      .end();
    res.header("HX-Redirect", "/app").json({ message: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("__token_jwt");
  res.header("HX-Redirect", "/").end();
});

export default router;
