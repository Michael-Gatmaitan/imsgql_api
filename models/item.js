const db = require("../utils/db");

const item = {
  getAllItem: async () => {
    const results = await db.query("SELECT * FROM item");
    return results;
  },
  getItemByID: async (productID) => {
    const result = await db.query(`SELECT * FROM item WHERE productID = ?`, [
      productID,
    ]);
    return result.length ? result[0] : null;
  },
};

module.exports = item;
