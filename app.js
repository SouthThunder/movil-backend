//import base modules
import express from "express";
import cors from "cors";

//import routes
import userRoutes from "./routes/user.route.js";
import testRoute from "./routes/test.route.js";

// Import Azure Connection routes
import blobConnection from "./routes/blob-connection.route.js";
import documentAnalyzerRoute from "./routes/document-intelligence.route.js";

// Import Workspace Routes
import workSpaceRoute from "./routes/workspace.route.js";
import transactionEntityRoute from "./routes/transactionEntity.route.js";

// Import ChatBot Routes
import chatBotRoute from "./routes/chatbot.route.js";

// Import CosmosDB Routes
import InvoiceRoute from './routes/invoice.route.js'

//create express app
const app = express();
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
app.use("/api", testRoute);
app.use("/api", blobConnection);
app.use("/api", workSpaceRoute);
app.use("/api", documentAnalyzerRoute);
app.use("/api", transactionEntityRoute);
app.use("/api", chatBotRoute);
app.use("/api", InvoiceRoute);
app.use("*", (req, res) => {
  res.status(404).json({ message: "error 404" });
});

//server up
const port = process.env.PORT || 8080;


app.listen(port, () => {
  console.log("Server Up running in port:" + port + "/");
});
