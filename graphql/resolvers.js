const db = require("../utils/db");
const item = require("../models/item");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const web_db = require("../utils/web_db");

const queries = {
  items: async () => {
    try {
      return await item.getAllItem();
    } catch (err) {
      throw new Error("There's a problem getting all items");
    }
  },

  item: async ({ productID }) => {
    console.log(productID);
    try {
      return await item.getItemByID(productID);
    } catch (err) {
      throw new Error("There's a problem getting item by id of: ", productID);
    }
  },

  itemSaleById: async ({ itemNumber }) => {
    try {
      const query = "SELECT * FROM sale WHERE itemNumber = ?";
      const args = [itemNumber];
      const result = db.query(query, args);
      console.log(result);

      return result;
    } catch (err) {
      throw new Error(
        "There's was a problem getting item SALES by itemNumber of: ",
        itemNumber,
      );
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
  saleGraph: async () => {
    // const quer =
    //   "SELECT s.itemNumber, i.productID, MAX(i.itemName) AS itemName, MAX(i.unitPrice) AS unitPrice, SUM(s.quantity) AS totalQuantity, SUM(s.quantity * s.unitPrice) AS totalRevenue FROM sale s JOIN item i ON s.itemNumber = i.itemNumber GROUP BY s.itemNumber ORDER BY totalRevenue DESC";
    const query =
      "SELECT i.productID, i.itemName, i.itemNumber, i.unitPrice, SUM(s.quantity * i.unitPrice) AS totalRevenue, SUM(s.quantity) AS quantitySold FROM item AS i JOIN sale AS s ON i.itemNumber = s.itemNumber GROUP BY i.productID, i.itemName ORDER BY totalRevenue DESC";
    const result = await db.query(query);

    return result;
  },
  monthlySale: async () => {
    const query =
      "SELECT MONTH(saleDate) AS month, SUM(quantity * unitPrice) AS sale FROM sale GROUP BY MONTH(saleDate) ORDER BY month";
    const result = await db.query(query);

    return result;
  },
  monthlySaleByItemNumber: async ({ itemNumber }) => {
    const query =
      "SELECT MONTHNAME(saleDate) AS month, SUM(quantity * unitPrice) AS sale FROM sale WHERE itemNumber = ? GROUP BY MONTHNAME(saleDate) ORDER BY month";
    const result = await db.query(query, [itemNumber]);

    return result;
  },

  topSales: async () => {
    const results = await db.query(
      // "SELECT *, SUM(quantity) AS total_quantity_sold FROM sale GROUP BY itemName ORDER BY total_quantity_sold DESC LIMIT 5",
      "SELECT *, SUM(t1.quantity) AS quantitySold, SUM(t1.quantity * t2.unitPrice) AS totalRevenue FROM sale AS t1 INNER JOIN item AS t2 ON t1.itemNumber = t2.itemNumber GROUP BY t2.itemName ORDER BY totalRevenue DESC LIMIT 5",
    );
    return results;
  },

  // INSERT INTO sale (itemNumber, customerID, customerName, itemName, saleDate, discount, quantity, unitPrice) VALUES ("1002", 4, "Bill Gates", "Versace Eros", "2019-01-01", 2, 10, 5000);

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
    console.log("ARGS: ", args);
    console.log("User in resolver context:", context.user);

    if (!context.user) throw new Error("User not found or not authenticated");

    return context.user;
  },

  transactions: async () => {
    const results = await web_db.query("SELECT * FROM transactions");
    return results;
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
    console.log("CREATING ITEM");
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
    // DONE: Deduct the quantity of product
    // DONE: Create a sale using customerID, productID, and quantity
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

      const item = (
        await db.query("SELECT * FROM item WHERE productID = ?", [productID])
      )[0];

      const { fullName: customerName } = customer;
      const { itemNumber, itemName, discount, unitPrice } = item;

      const saleDate = new Date();

      console.log(item);

      const createSaleArgs = [
        itemNumber,
        customerID,
        customerName,
        itemName,
        saleDate,
        discount,
        quantity,
        unitPrice,
      ];

      const createSaleQuery =
        "INSERT INTO sale (itemNumber, customerID, customerName, itemName, saleDate, discount, quantity, unitPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const newSale = await db.query(createSaleQuery, createSaleArgs);

      console.log(`New sale created: ${newSale}`);

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
      throw new Error(`Error on deducting items: ${err}`);
    }
  },
  updateItem: async ({
    productID,
    itemName,
    discount,
    unitPrice,
    imageURL,
  }) => {
    // Update
    // "UPDATE item SET stock = stock - ? WHERE productID = ?";
    const q =
      "UPDATE item SET itemName = ?, discount = ?, unitPrice = ?, imageURL = ? WHERE productID = ?";
    const args = [itemName, discount, unitPrice, imageURL, productID];

    const updatedItem = await db.query(q, args);

    console.log(updatedItem);

    return {
      message: "1 item updated successfully",
      success: true,
    };
  },
  deleteItem: async ({ productID }) => {
    const q = "DELETE FROM item WHERE productID = ?";
    const args = [productID];
    const deletedItem = await db.query(q, args);

    console.log(deletedItem);

    return {
      message: "1 item deleted successfully",
      success: true,
    };
  },

  createTransaction: async ({ description, type }) => {
    const q = "INSERT INTO transactions (description, type) values (?, ?)";
    const args = [description, type];
    const createdTransaction = await web_db.query(q, args);

    console.log(createdTransaction);

    return {
      message: "Transaction created",
      success: true,
    };
  },
};

const resolvers = {
  ...queries,
  ...mutations,
};

module.exports = resolvers;
