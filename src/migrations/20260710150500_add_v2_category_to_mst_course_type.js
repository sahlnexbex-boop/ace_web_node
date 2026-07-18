export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("mst_course_type");
  if (!tableDefinition.V2_category) {
    await queryInterface.addColumn("mst_course_type", "V2_category", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("mst_course_type");
  if (tableDefinition.V2_category) {
    await queryInterface.removeColumn("mst_course_type", "V2_category");
  }
}
