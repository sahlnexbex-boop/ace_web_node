import Branch from "../models/branches.model.js";
import { Op, Sequelize } from "sequelize";

export const createBranch = async (req, res) => {
    try {
        const { branch_name, branch_address, branch_phone, status, V2_branch } = req.body;

        if (!branch_name || !branch_phone) {
            return res.status(400).json({ status: 0, message: "branch_name & branch_phone is required" });
        }

        const existingBranch = await Branch.findOne({
            where: {
                branch_name: branch_name,
                branch_phone: branch_phone,
            },
        });

        if (existingBranch) {
            return res.status(400).json({ status: 0, message: "Branch already exists" });
        }

        const branch = await Branch.create({
            branch_name,
            branch_address,
            branch_phone,
            status: status !== undefined ? status : 1,
            V2_branch: V2_branch !== undefined ? V2_branch : null,
        });
        return res.status(201).json({
            status: true,
            message: "Branch created successfully",
            data: branch,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 0, message: "Internal server error" });
    }
}

export const getAllBranches = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status, } = req.query;
        const where = {};
        if (search) {
            where[Op.or] = [
                { branch_name: { [Op.like]: `%${search}%` } },
                { branch_address: { [Op.like]: `%${search}%` } },
                { branch_phone: { [Op.like]: `%${search}%` } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const { rows, count } = await Branch.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });
        return res.status(200).json({
            message: "Branches fetched successfully",
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit),
            data: rows,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 0, message: "Internal server error" });
    }
}

export const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await Branch.findByPk(id);
        if (!branch) {
            return res.status(404).json({ status: 0, message: "Branch not found" });
        }
        return res.status(200).json({
            status: true,
            message: "Branch fetched successfully",
            data: branch,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 0, message: "Internal server error" });
    }
}

export const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_name, branch_address, branch_phone, status, V2_branch } = req.body;

        const branch = await Branch.findByPk(id);
        if (!branch) {
            return res.status(404).json({ status: 0, message: "Branch not found" });
        }

        if (branch_name) branch.branch_name = branch_name;
        if (branch_address) branch.branch_address = branch_address;
        if (branch_phone) branch.branch_phone = branch_phone;
        if (status !== undefined) branch.status = status;
        if (V2_branch !== undefined) branch.V2_branch = V2_branch;

        await branch.save();
        return res.status(200).json({
            status: true,
            message: "Branch updated successfully",
            data: branch,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 0, message: "Internal server error" });
    }
}

export const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await Branch.findByPk(id);
        if (!branch) {
            return res.status(404).json({ status: 0, message: "Branch not found" });
        }
        await branch.destroy();
        return res.status(200).json({
            status: true,
            message: "Branch deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 0, message: "Internal server error" });
    }
}
