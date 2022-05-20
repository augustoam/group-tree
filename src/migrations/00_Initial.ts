import * as sequelize from "sequelize";

module.exports = {
    up: function (queryInterface: sequelize.QueryInterface, DataTypes) {
        return queryInterface.createTable('Groups', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            root: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            // Timestamps
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('NOW()'),
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('NOW()'),
                allowNull: false,
            },
        })
    },

    down: function (queryInterface: sequelize.QueryInterface) {

        return queryInterface.dropTable('Groups')
    }
};
