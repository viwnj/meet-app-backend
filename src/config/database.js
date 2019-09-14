const dotenv = require('dotenv').config();

module.exports = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'meetapp_dev',
  host: process.env.DB_HOST,
  dialect: 'postgres',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
