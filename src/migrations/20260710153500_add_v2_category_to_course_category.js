export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("course_category", "V2_category", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("course_category", "V2_category");
}
