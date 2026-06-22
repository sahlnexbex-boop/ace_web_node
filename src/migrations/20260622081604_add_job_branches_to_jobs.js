export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("jobs", "job_branches", {
    type: Sequelize.JSON,
    allowNull: true,
  });
  await queryInterface.removeColumn("jobs", "job_location");
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.addColumn("jobs", "job_location", {
    type: Sequelize.STRING(255),
    allowNull: true,
  });
  await queryInterface.removeColumn("jobs", "job_branches");
}
