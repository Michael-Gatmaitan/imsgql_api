const mysql = require("mysql2");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "shop_inventory",
};

const db = {
  dbConnection: () => {
    try {
      return mysql.createConnection(dbConfig);
    } catch (err) {
      console.error("Error connecting to database: ", err);
      throw new Error("Database connection failed");
    }
  },
  query: async (q, params = []) => {
    const conn = db.dbConnection();

    return new Promise((res, rej) => {
      conn.execute(q, params, (err, results) => {
        conn.end();
        if (err) {
          rej(err);
        } else {
          res(results);
        }
      });
    });
  },
};

module.exports = db;
