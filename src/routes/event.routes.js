import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const uploadEventImage = dynamicUpload("events", "event_image");

router.post("/", verifyAccessToken, uploadEventImage.single("event_image"), createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", verifyAccessToken, uploadEventImage.single("event_image"), updateEvent);
router.delete("/:id", verifyAccessToken, deleteEvent);

export default router;
