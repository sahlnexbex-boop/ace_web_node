import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = express.Router();

const { upload,handleUpload } = dynamicUpload("services", "service_image");

router.post(
  "/",
  verifyAccessToken,
  upload.fields([
    { name: "service_image", maxCount: 1 },
    { name: "other_images", maxCount: 10 },
  ]),
 handleUpload,
  createService
);

router.get("/", getServices);
router.get("/:id", getServiceById);

router.put(
  "/:id",
  verifyAccessToken,
  upload.fields([
    { name: "service_image", maxCount: 1 },
    { name: "other_images", maxCount: 10 },
  ]),
 handleUpload,
  updateService
);

router.delete("/:id", verifyAccessToken, deleteService);

export default router;
