export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("online_registrations", "course_mode", {
    type: Sequelize.ENUM("Online", "Offline"),
    allowNull: true,
    after: "course_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("online_registrations", "course_mode");
}
