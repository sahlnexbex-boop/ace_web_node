import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import courseTypeRoutes from "./routes/courseType.routes.js";
import courseCategoryRoutes from "./routes/courseCategory.routes.js";
import courseRoutes from "./routes/course.routes.js";
import resultRoutes from "./routes/result.routes.js";
import topperRoutes from "./routes/topper.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import rankHoldersRoutes from "./routes/rankHolders.routes.js"
import serviceRotes from "./routes/service.routes.js"
import successStoriesRoutes from "./routes/successStories.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";
import blogsRoutes from "./routes/blogs.routes.js";
import eventRoutes from "./routes/event.routes.js";
import webinarRoutes from "./routes/webinar.routes.js";
import newsroutes from "./routes/news.routes.js";
import affairRoutes from "./routes/currentAffair.routes.js";
import publicationRoutes from "./routes/publication.routes.js";
import videoClassRoutes from "./routes/videoClass.routes.js";
import studyServiceRoutes from "./routes/studyService.routes.js";
import carouselRoutes from "./routes/carousel.routes.js";
import shortsRoutes from "./routes/shorts.routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//  Serve files from project-root/uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/course-types", courseTypeRoutes);
app.use("/api/course-category", courseCategoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/topper", topperRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/rankholders", rankHoldersRoutes);
app.use("/api/social-service", serviceRotes);
app.use("/api/success-stories", successStoriesRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/webinars", webinarRoutes);
app.use("/api/news", newsroutes);
app.use("/api/affairs", affairRoutes);
app.use("/api/publication", publicationRoutes);
app.use("/api/video-class", videoClassRoutes);
app.use("/api/study-service", studyServiceRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api/shorts", shortsRoutes);

const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection error:", err));
