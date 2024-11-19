import express from "express";

import usersRouter from "./routes/users";
import scoresRouter from "./routes/scores";

import { accessSecret } from "./secret";

const app = express();
app.use(express.json());

const SECRET_NAME = "auth-token";

// Auth token
let authToken: string | undefined = undefined;

const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    while (authToken === undefined) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const authHeader = req.headers.authorization;

    const bearerPrefix = "Bearer ";

    if (authHeader && authHeader.startsWith(bearerPrefix)) {
        const token = authHeader.substring(bearerPrefix.length);
        if (token === authToken) {
            next();
            return;
        }
    }
    res.status(401).json({ error: 'Unauthorized' });
}

app.use(authMiddleware);

async function setupRoutes() {
  app.get("/", (_, res) => {
    res.send("Hello World");
  });

  app.use("/users", usersRouter);
  app.use("/scores", scoresRouter);

  authToken = await accessSecret(SECRET_NAME);
}

setupRoutes();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
