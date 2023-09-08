import { Model, DataTypes } from "sequelize";
import { sequelize } from "./conn";

export class Report extends Model { };

Report.init(
    {
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.BIGINT,
            allowNull: true
        }
    },
    { sequelize, modelName: "report" }
);