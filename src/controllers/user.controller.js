import User from "../models/user.model.js";
import { Op } from "sequelize";

export const createUser = async (req, res) => {
  try {
    const { user_name, email, password, status } = req.body;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { user_name }] }
    });
    if (existingUser)
      return res.status(400).json({ message: "Email or username already used" });

    const newUser = await User.create({
      user_name,
      email,
      password,
      status: status === 0 || status === 1 ? status : 1
    });

    const { password: _, ...data } = newUser.toJSON();
    res.status(201).json({
      message: "User created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? { [Op.or]: [{ user_name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }] }
      : {};

    const users = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ["password"] }
    });

    res.json({
      total: users.count,
      page: parseInt(page),
      pages: Math.ceil(users.count / limit),
      data: users.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(
        {
            message: "User found successfully",
            data: user
        }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = id;
    const { user_name, email, password, status } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const duplicate = await User.findOne({
      where: {
        [Op.and]: [
          { user_id: { [Op.ne]: id } },
          { [Op.or]: [{ email }, { user_name }] }
        ]
      }
    });
    if (duplicate)
      return res.status(400).json({ message: "Email or username already used" });

    user.user_name = user_name || user.user_name;
    user.email = email || user.email;
    if (password) user.password = password;
    user.status = status === 0 || status === 1 ? status : user.status;
    user.updated_by = 0;
    user.updated_at = new Date();

    await user.save();
    const { password: _, ...data } = user.toJSON();
    res.json({
      message: "User updated successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { user_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
