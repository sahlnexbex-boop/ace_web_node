import sequelize from "./src/config/db.js";

async function fixDB() {
  try {
    await sequelize.query("ALTER TABLE courses CHANGE course_duration course_chapters INT;");
    console.log("Successfully altered courses table!");
  } catch (err) {
    if (err.message.includes("Unknown column")) {
         console.log("Column might already be changed or missing.");
    } else {
         console.error(err);
    }
  }
  process.exit(0);
}

fixDB();
