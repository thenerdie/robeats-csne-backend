import express from "express";

import usersRouter from "./routes/users";
import scoresRouter from "./routes/scores";

const app = express();
app.use(express.json());

function setupRoutes() {
  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  app.use("/users", usersRouter);
  app.use("/scores", scoresRouter);
}

setupRoutes();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
