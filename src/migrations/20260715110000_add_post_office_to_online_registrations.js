export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("online_registrations");
  if (!tableDefinition.post_office) {
    await queryInterface.addColumn("online_registrations", "post_office", {
      type: Sequelize.STRING(150),
      allowNull: true,
      after: "district",
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("online_registrations");
  if (tableDefinition.post_office) {
    await queryInterface.removeColumn("online_registrations", "post_office");
  }
}
