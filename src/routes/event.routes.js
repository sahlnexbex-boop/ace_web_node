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
const {upload,handleUpload} = dynamicUpload("events", ["event_image", "other_images", "others_images"]);

router.post(
  "/",
  verifyAccessToken,
  upload.fields([
    { name: "event_image", maxCount: 1 },
    { name: "other_images", maxCount: 10 },
    { name: "others_images", maxCount: 10 },
  ]),
  handleUpload,
  createEvent
);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put(
  "/:id",
  verifyAccessToken,
  upload.fields([
    { name: "event_image", maxCount: 1 },
    { name: "other_images", maxCount: 10 },
    { name: "others_images", maxCount: 10 },
  ]),
  handleUpload,
  updateEvent
);
router.delete("/:id", verifyAccessToken, deleteEvent);

export default router;
