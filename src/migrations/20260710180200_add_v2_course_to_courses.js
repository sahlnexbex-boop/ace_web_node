export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("courses", "V2_course", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("courses", "V2_course");
}
