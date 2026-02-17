import express from "express";
import {
    createDynamicEvent,
    getAllDynamicEvents,
    getDynamicEventById,
    updateDynamicEvent,
    deleteDynamicEvent,
} from "../controllers/dynamicEvent.controller.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const { upload, handleUpload } = dynamicUpload("dynamic-events");

router.post("/", upload.single("dynmc_event_image"), handleUpload, createDynamicEvent);
router.get("/", getAllDynamicEvents);
router.get("/:id", getDynamicEventById);
router.put("/:id", upload.single("dynmc_event_image"), handleUpload, updateDynamicEvent);
router.delete("/:id", deleteDynamicEvent);

export default router;
