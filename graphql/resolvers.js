const db = require("../utils/db");
const item = require("../models/item");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const queries = {
  items: async () => {
    try {
      return await item.getAllItem();
    } catch (err) {
      throw new Error("There's a problem getting all items");
    }
  },

  item: async ({ productID }) => {
    try {
      return await item.getItemByID(productID);
    } catch (err) {
      throw new Error("There's a problem getting item by id of: ", productID);
    }
  },

  purchases: async () => {
    const results = await db.query("SELECT * FROM purchase");
    return results;
  },
  purchase: async ({ purchaseID }) => {
    const result = await db.query(
      `SELECT * FROM purchase WHERE purchaseID = ?`,
      [purchaseID],
    );

    return result.length ? result[0] : null;
  },

  customers: async () => {
    const results = await db.query("SELECT * FROM customer");
    return results;
  },
  customer: async ({ customerID }) => {
    const result = await db.query(
      `SELECT * FROM customer WHERE customerID = ?`,
      [customerID],
    );

    return result.length ? result[0] : null;
  },

  vendors: async () => {
    const results = await db.query("SELECT * FROM vendor");
    return results;
  },
  vendor: async ({ vendorID }) => {
    const result = await db.query(`SELECT * FROM vendor WHERE vendorID = ?`, [
      vendorID,
    ]);

    return result.length ? result[0] : null;
  },

  sales: async () => {
    const results = await db.query("SELECT * FROM sale");
    return results;
  },
  sale: async ({ vendorID: saleID }) => {
    const result = await db.query(`SELECT * FROM sale WHERE saleID = ?`, [
      saleID,
    ]);

    return result.length ? result[0] : null;
  },

  users: async () => {
    const results = await db.query("SELECT * FROM user");
    return results;
  },
  user: async ({ userID }) => {
    const result = await db.query(`SELECT * FROM user WHERE userID = ?`, [
      userID,
    ]);
    return result.length ? result[0] : null;
  },

  me: (args, context) => {
    console.log("User in resolver context:", context.user);

    if (!context.user) throw new Error("User not found or not authenticated");

    return context.user;
  },
};

const mutations = {
  login: async ({ username, password }) => {
    console.log(username, password);

    const result = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    console.log(result);
    if (result.length === 0) throw new Error("user not exists");

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return { error: "Password incorrect" };

    const token = jwt.sign(
      { id: user.userID, username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return { token };
  },
  signup: async ({ fullname, username, password }) => {
    console.log("CREATINGG");
    console.log(db);

    const result = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (result.length > 0) return { error: "Username already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);

    const newUser = db.query(
      "INSERT INTO user (fullname, username, password) VALUES (?, ?, ?)",
      [fullname, username, hashedPassword],
    );

    const newUserResult = await newUser;
    console.log(newUserResult);

    const token = jwt.sign(
      { id: newUserResult.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return { token };
  },
};

const resolvers = {
  ...queries,
  ...mutations,
};

module.exports = resolvers;
