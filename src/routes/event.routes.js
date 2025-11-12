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
const {upload,handleUpload} = dynamicUpload("events", "event_image");

router.post("/", verifyAccessToken, upload.single("event_image"),handleUpload, createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", verifyAccessToken, upload.single("event_image"),handleUpload, updateEvent);
router.delete("/:id", verifyAccessToken, deleteEvent);

export default router;
