export async function up(queryInterface, Sequelize) {
  /**
   * This is an example migration file. It creates a test table `migration_test_table`
   * to demonstrate how to use migration commands. You can safely run and rollback this migration.
   */
  await queryInterface.createTable("migration_test_table", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  /**
   * Rollback logic for the example migration.
   * Drops the test table.
   */
  await queryInterface.dropTable("migration_test_table");
}
