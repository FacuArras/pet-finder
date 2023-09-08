import { Model, DataTypes } from "sequelize";
import { sequelize } from "./conn";

export class User extends Model { };

User.init(
    {
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        profile_picture_URL: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone_number: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    },
    { sequelize, modelName: "user" },
);