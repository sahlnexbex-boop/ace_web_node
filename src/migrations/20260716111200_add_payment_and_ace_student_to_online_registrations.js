export async function up(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("online_registrations");
  if (!tableDefinition.is_ace_student) {
    await queryInterface.addColumn("online_registrations", "is_ace_student", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: "phone_number",
    });
  }
  if (!tableDefinition.is_online_payment) {
    await queryInterface.addColumn("online_registrations", "is_online_payment", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: "is_ace_student",
    });
  }
  if (!tableDefinition.amount) {
    await queryInterface.addColumn("online_registrations", "amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      after: "is_online_payment",
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDefinition = await queryInterface.describeTable("online_registrations");
  if (tableDefinition.is_ace_student) {
    await queryInterface.removeColumn("online_registrations", "is_ace_student");
  }
  if (tableDefinition.is_online_payment) {
    await queryInterface.removeColumn("online_registrations", "is_online_payment");
  }
  if (tableDefinition.amount) {
    await queryInterface.removeColumn("online_registrations", "amount");
  }
}
