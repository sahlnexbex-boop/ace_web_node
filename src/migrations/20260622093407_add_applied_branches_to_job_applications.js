export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("job_applications", "applied_branches", {
    type: Sequelize.JSON,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("job_applications", "applied_branches");
}
