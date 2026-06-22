import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = __dirname;

const META_TABLE = "SequelizeMeta";

/**
 * Initializes the migration metadata table if it does not exist.
 */
async function ensureMetaTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ${META_TABLE} (
      name VARCHAR(255) PRIMARY KEY
    );
  `);
}

/**
 * Runs all pending migrations in alphabetical order.
 */
export async function runMigrations() {
  await ensureMetaTable();

  // Get executed migrations
  const rows = await sequelize.query(
    `SELECT name FROM ${META_TABLE} ORDER BY name ASC;`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const executed = new Set(rows.map((r) => r.name));

  // Get all migration files in src/migrations
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js") && file !== "migrator.js")
    .sort();

  const pending = files.filter((file) => !executed.has(file));

  if (pending.length === 0) {
    console.log("No pending migrations found. Database is up to date.");
    return;
  }

  console.log(`Found ${pending.length} pending migration(s) to run.`);
  const queryInterface = sequelize.getQueryInterface();

  for (const file of pending) {
    console.log(`Executing migration: ${file}...`);
    const filePath = path.resolve(migrationsDir, file);
    const fileUrl = pathToFileURL(filePath).href;
    const migration = await import(fileUrl);

    try {
      if (typeof migration.up === "function") {
        await migration.up(queryInterface, Sequelize);
      }
      await sequelize.query(
        `INSERT INTO ${META_TABLE} (name) VALUES (:name);`,
        {
          replacements: { name: file },
          type: sequelize.QueryTypes.INSERT,
        }
      );
      console.log(`Successfully completed migration: ${file}`);
    } catch (err) {
      console.error(`Migration failed at ${file}:`, err.message);
      throw err;
    }
  }
  console.log("All pending migrations have been executed successfully.");
}

/**
 * Rolls back the last executed migration.
 */
export async function rollbackLastMigration() {
  await ensureMetaTable();

  // Get the last executed migration
  const rows = await sequelize.query(
    `SELECT name FROM ${META_TABLE} ORDER BY name DESC LIMIT 1;`,
    { type: sequelize.QueryTypes.SELECT }
  );

  if (rows.length === 0) {
    console.log("No migrations to roll back.");
    return;
  }

  const lastMigrationName = rows[0].name;
  console.log(`Rolling back last migration: ${lastMigrationName}...`);

  const filePath = path.resolve(migrationsDir, lastMigrationName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found locally: ${lastMigrationName}`);
  }

  const fileUrl = pathToFileURL(filePath).href;
  const migration = await import(fileUrl);
  const queryInterface = sequelize.getQueryInterface();

  try {
    if (typeof migration.down === "function") {
      await migration.down(queryInterface, Sequelize);
    }
    await sequelize.query(
      `DELETE FROM ${META_TABLE} WHERE name = :name;`,
      {
        replacements: { name: lastMigrationName },
        type: sequelize.QueryTypes.DELETE,
      }
    );
    console.log(`Successfully rolled back migration: ${lastMigrationName}`);
  } catch (err) {
    console.error(`Rollback failed for ${lastMigrationName}:`, err.message);
    throw err;
  }
}

/**
 * Prints the migration status (which have been run and which are pending).
 */
export async function getMigrationStatus() {
  await ensureMetaTable();

  const rows = await sequelize.query(
    `SELECT name FROM ${META_TABLE} ORDER BY name ASC;`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const executed = new Set(rows.map((r) => r.name));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js") && file !== "migrator.js")
    .sort();

  console.log("\nMigration Status Report:");
  console.log("========================");
  for (const file of files) {
    const status = executed.has(file) ? "✓ APPLIED" : "✗ PENDING";
    console.log(`[${status}] ${file}`);
  }
  if (files.length === 0) {
    console.log("(No migration files found in src/migrations/)");
  }
  console.log("========================\n");
}

// CLI Execution Wrapper
const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isCli) {
  const args = process.argv.slice(2);
  const command = args[0] || "up";
  const name = args[1];

  try {
    await sequelize.authenticate();
    
    if (command === "up") {
      await runMigrations();
      process.exit(0);
    } else if (command === "down") {
      await rollbackLastMigration();
      process.exit(0);
    } else if (command === "status") {
      await getMigrationStatus();
      process.exit(0);
    } else if (command === "create") {
      if (!name) {
        console.error("Error: Please provide a migration name.\nUsage: node migrator.js create <migration_name>");
        process.exit(1);
      }
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
      const filename = `${timestamp}_${name}.js`;
      const template = `export async function up(queryInterface, Sequelize) {
  /**
   * Write migration code here.
   * Example:
   * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
   */
}

export async function down(queryInterface, Sequelize) {
  /**
   * Write rollback code here.
   * Example:
   * await queryInterface.dropTable('users');
   */
}
`;
      const targetPath = path.join(migrationsDir, filename);
      fs.writeFileSync(targetPath, template, "utf8");
      console.log(`Created migration: src/migrations/${filename}`);
      process.exit(0);
    } else {
      console.error(`Unknown command: ${command}`);
      console.log("Available commands: up, down, status, create <name>");
      process.exit(1);
    }
  } catch (error) {
    console.error("Migration CLI action failed:", error);
    process.exit(1);
  }
}
