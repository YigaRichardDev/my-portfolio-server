import mysql from "mysql2";

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

