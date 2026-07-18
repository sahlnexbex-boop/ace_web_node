export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("online_registrations");
  if (!tableDefinition.course_mode) {
    await queryInterface.addColumn("online_registrations", "course_mode", {
      type: Sequelize.ENUM("Online", "Offline"),
      allowNull: true,
      after: "course_id",
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("online_registrations");
  if (tableDefinition.course_mode) {
    await queryInterface.removeColumn("online_registrations", "course_mode");
  }
}
