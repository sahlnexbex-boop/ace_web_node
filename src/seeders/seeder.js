import User from "../models/user.model.js";

export const runSeeder = async () => {
  try {
    const defaultUser = {
      user_name: "admin",
      email: "admin@gmail.com",
      password: "admin@123",
      status: 1,
      created_by: 0,
    };

    const existingUser = await User.findOne({
      where: { email: defaultUser.email },
    });

    if (existingUser) {
      console.log(" Admin user already exists:", existingUser.user_name);
      return;
    }

    // const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

    await User.create({
      ...defaultUser,
    });

    console.log(" Default admin user created successfully!", ...defaultUser);
  } catch (error) {
    console.error(" Seeder error:", error);
  }
};
