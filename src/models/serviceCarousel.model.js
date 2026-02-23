import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ServiceCarousel = sequelize.define(
    "ServiceCarousel",
    {
        service_carousel_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        image_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        status: {
            type: DataTypes.TINYINT,
            defaultValue: 1, // 1 = active, 0 = inactive
        },

        created_by: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "service_carousel",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default ServiceCarousel;