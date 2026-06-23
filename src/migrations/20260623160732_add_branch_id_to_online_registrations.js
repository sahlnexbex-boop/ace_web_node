export async function up(queryInterface, Sequelize) {
  // Add branch_id column to online_registrations table
  await queryInterface.addColumn("online_registrations", "branch_id", {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
  });

  // Fetch branches to map existing strings to IDs
  const [branches] = await queryInterface.sequelize.query(
    "SELECT branch_id, branch_name FROM mst_branches"
  );

  // Update existing registrations with matching branch_id
  for (const branch of branches) {
    await queryInterface.sequelize.query(
      `UPDATE online_registrations 
       SET branch_id = :branch_id 
       WHERE LOWER(TRIM(branch)) = LOWER(TRIM(:branch_name))`,
      {
        replacements: {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
        },
      }
    );
  }
}

export async function down(queryInterface, Sequelize) {
  // Remove branch_id column
  await queryInterface.removeColumn("online_registrations", "branch_id");
}
