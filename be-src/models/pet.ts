import { Model, DataTypes } from "sequelize";
import { sequelize } from "./conn";

export class Pet extends Model { };

Pet.init(
    {
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pet_picture_URL: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_location_lat: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        last_location_lng: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        state: {
            type: DataTypes.ENUM("found", "lost"),
            allowNull: false,
            defaultValue: "lost"
        },
        last_seen: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    { sequelize, modelName: "pet" },
);