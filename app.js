//import base modules
import express from "express";
import cors from "cors";

//import routes
import userRoutes from "./routes/user.route.js";
import likeRoutes from "./routes/like.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

// Import Azure Connection routes
import blobConnection from "./routes/blob-connection.route.js";

import expressWs from "express-ws";

//create express app
const app = express();

//expressWs
expressWs(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public', { maxAge: 7 * 24 * 60 * 60 * 1000 }));

// Accept all origin requests
//cors config
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

//import logical routes
app.use("/api", userRoutes);
app.use("/api", likeRoutes);
app.use("/api", chatRoutes);
app.use("/api", messageRoute);
app.use("/api", blobConnection);
app.use("*", (req, res) => {
  res.status(404).json({ message: "error 404" });
});

//server up
const port = process.env.PORT || 8080;


app.listen(port, () => {
  console.log("Server Up running in port:" + port + "/");
});
