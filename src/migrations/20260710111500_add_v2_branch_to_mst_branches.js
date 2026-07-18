export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("mst_branches");
  if (!tableDefinition.V2_branch) {
    await queryInterface.addColumn("mst_branches", "V2_branch", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("mst_branches");
  if (tableDefinition.V2_branch) {
    await queryInterface.removeColumn("mst_branches", "V2_branch");
  }
}
