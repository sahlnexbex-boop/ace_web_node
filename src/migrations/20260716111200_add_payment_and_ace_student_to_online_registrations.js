export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("online_registrations", "is_ace_student", {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    after: "phone_number",
  });
  await queryInterface.addColumn("online_registrations", "is_online_payment", {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    after: "is_ace_student",
  });
  await queryInterface.addColumn("online_registrations", "amount", {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    after: "is_online_payment",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("online_registrations", "is_ace_student");
  await queryInterface.removeColumn("online_registrations", "is_online_payment");
  await queryInterface.removeColumn("online_registrations", "amount");
}
