import { sequelize } from "./models/conn";

sequelize.sync({ alter: true });