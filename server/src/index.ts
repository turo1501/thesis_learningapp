import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import { seedCourses } from "./utils/seedData";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
} from "@clerk/express";
/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import roleChangeRoutes from "./routes/roleChangeRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgessRoutes";
import chatRoutes from "./routes/chatRoutes";
import blogPostRoutes from "./routes/blogPostRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import memoryCardRoutes from "./routes/memoryCardRoutes";
import userNoteRoutes from "./routes/userNoteRoutes";
import commentRoutes from "./routes/commentRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import { authenticate } from "./middleware/authMiddleware";
import { resetPassword } from "./controllers/userClerkController";

/* CONFIGURATIONS */
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(clerkMiddleware());

/* ROUTES */
app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.use("/courses", courseRoutes);
app.use("/users/clerk", requireAuth(), authenticate, userClerkRoutes);
app.post("/users/password-reset", resetPassword);
app.use("/role-change", requireAuth(), authenticate, roleChangeRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users/course-progress", requireAuth(), authenticate, userCourseProgressRoutes);
app.use("/chat", requireAuth(), authenticate, chatRoutes);
app.use("/blog-posts", blogPostRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/meetings", meetingRoutes);
app.use("/dashboard", requireAuth(), authenticate, dashboardRoutes);
app.use("/analytics", requireAuth(), authenticate, analyticsRoutes);
app.use("/memory-cards", memoryCardRoutes);
app.use("/user-notes", requireAuth(), authenticate, userNoteRoutes);
app.use("/comments", commentRoutes);

/* ERROR MIDDLEWARE */
app.use(errorHandler);

/* SERVER */
const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    
    // Seed sample courses to the database
    await seedCourses();
  });
}

// aws production environment
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    await seed();
    await seedCourses();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data seeded successfully" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};