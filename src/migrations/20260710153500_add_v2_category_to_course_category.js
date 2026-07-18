export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("course_category");
  if (!tableDefinition.V2_category) {
    await queryInterface.addColumn("course_category", "V2_category", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("course_category");
  if (tableDefinition.V2_category) {
    await queryInterface.removeColumn("course_category", "V2_category");
  }
}
