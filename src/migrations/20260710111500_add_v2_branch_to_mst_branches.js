export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("mst_branches", "V2_branch", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("mst_branches", "V2_branch");
}
