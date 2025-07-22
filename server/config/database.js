const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL database via Sequelize");
    
    // Skip sync to avoid database structure issues
    console.log("[INFO] Skipping database sync - using existing structure");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase,
};