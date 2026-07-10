export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("mst_course_type", "V2_category", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("mst_course_type", "V2_category");
}
