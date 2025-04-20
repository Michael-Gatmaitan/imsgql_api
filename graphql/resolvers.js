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

  // itemNumber: Int!, itemName: String!, discount: Float!, stock: Int!, unitPrice: Int!, imageURL: String!
  createItem: async ({
    itemNumber,
    itemName,
    discount,
    stock,
    unitPrice,
    imageURL,
    description,
  }) => {
    console.log("fuck fuck fuck");
    try {
      const query =
        "INSERT INTO item (itemNumber, itemName, discount, stock, unitPrice, imageURL, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const newItem = await db.query(query, [
        itemNumber,
        itemName,
        discount,
        stock,
        unitPrice,
        imageURL,
        "Active",
        description,
      ]);

      if (newItem.insertId) {
        return {
          message: `New item with id of ${newItem.insertId} created.`,
          success: true,
        };
      }

      return {
        message: `Error: Item not created creating new item`,
        success: false,
      };
    } catch (err) {
      throw new Error("Error on creating new item");
    }
  },
  deductItem: async ({ productID, quantity, customerID }) => {
    // TODO: Deduct the quantity of product
    // TODO: Create a sale using customerID, productID, and quantity
    console.log(productID, quantity);

    try {
      // UPDATE item SET stock = stock - q WHERE productID = q
      const updateProductQuery =
        "UPDATE item SET stock = stock - ? WHERE productID = ?";
      const updatedItem = await db.query(updateProductQuery, [
        quantity,
        productID,
      ]);

      const customer = (
        await db.query("SELECT * FROM customer WHERE customerID = ?", [
          customerID,
        ])
      )[0];

      const item = (await db.query("SELECT * FROM item WHERE productID = ?"),
      [productID])[0];

      const { fullName: customerName } = customer;

      console.log(customerName);

      console.log(customer);

      // const createSaleQuery = "INSERT INTO sale (itemNumber, customerID, customerName, itemName, saleDate, discount, quantity, unitPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      // const newSale = await db.query()

      console.log(updatedItem);

      if (updatedItem.changedRows === 1) {
        return {
          message: "1 item successfully deducted",
          success: true,
        };
      } else {
        return {
          message: `Error: Not only 1 item afftedted, something went wrong`,
          succces: false,
        };
      }
    } catch (err) {
      throw new Error("Error on deducting items");
    }
  },
};

const resolvers = {
  ...queries,
  ...mutations,
};

module.exports = resolvers;
