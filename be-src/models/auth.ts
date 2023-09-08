import { Model, DataTypes } from "sequelize";
import { sequelize } from "./conn";

export class Auth extends Model { };

Auth.init(
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    },
    { sequelize, modelName: "auth" }
);