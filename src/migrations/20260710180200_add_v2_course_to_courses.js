export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("courses");
  if (!tableDefinition.V2_course) {
    await queryInterface.addColumn("courses", "V2_course", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("courses");
  if (tableDefinition.V2_course) {
    await queryInterface.removeColumn("courses", "V2_course");
  }
}
