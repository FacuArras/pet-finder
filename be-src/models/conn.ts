const { Sequelize } = require('sequelize');

export const sequelize = new Sequelize(process.env.SEQUELIZE_URL);
