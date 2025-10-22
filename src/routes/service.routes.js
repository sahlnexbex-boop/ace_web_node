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

const upload = dynamicUpload("services", "service_image");

router.post(
  "/",
  upload.fields([
    { name: "service_image", maxCount: 1 },
    { name: "other_images", maxCount: 10 },
  ]),
  verifyAccessToken,
  createService
);

router.get("/", verifyAccessToken, getServices);
router.get("/:id", verifyAccessToken, getServiceById);

router.put(
  "/:id",
  upload.fields([
    { name: "service_image", maxCount: 1 },
    { name: "other_images", maxCount: 10 },
  ]),
  verifyAccessToken,
  updateService
);

router.delete("/:id", verifyAccessToken, deleteService);

export default router;
