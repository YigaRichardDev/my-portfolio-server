import mysql from "mysql2";
import { Sequelize } from "sequelize";

export const connection = () => {
    const connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      });
      
      // Connect to the database
      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err.message);
          return;
        }
        console.log('Connected to the MySQL database.');
      });
      return connection;
};

export const sequelize = new Sequelize({
    dialect: "mysql",
    dialectModule: require("mysql2"),
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});