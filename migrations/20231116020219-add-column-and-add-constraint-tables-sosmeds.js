'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn("Sosmeds", "UserId", {
      type: Sequelize.INTEGER
    })

    await queryInterface.addConstraint("Sosmeds", {
      fields: ["UserId"],
      type: "foreign key",
      name: "user_id_fk",
      references: {
        table: "Users",
        field: "id"
      },
      onDelete: "cascade",
      onUpdate: "cascade"
    })

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeConstraint("Sosmeds", "user_id_fk")
    await queryInterface.removeColumn("Sosmeds", "UserId")

  }
};
