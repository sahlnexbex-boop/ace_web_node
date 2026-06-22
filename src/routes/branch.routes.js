import express from "express";
import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
} from "../controllers/branch.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

router.post("/", verifyAccessToken, createBranch);
router.get("/", getAllBranches);
router.get("/:id", getBranchById);
router.put("/:id", verifyAccessToken, updateBranch);
router.delete("/:id", verifyAccessToken, deleteBranch);

export default router;
