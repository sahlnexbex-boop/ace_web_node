export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("online_registrations", "post_office", {
    type: Sequelize.STRING(150),
    allowNull: true,
    after: "district",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("online_registrations", "post_office");
}
