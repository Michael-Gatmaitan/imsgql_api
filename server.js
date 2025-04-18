const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const jwt = require("jsonwebtoken");
const db = require("./utils/db");

require("dotenv").config();

const app = express();

// middleware for "meMiddleware"
const meMiddleware = async (req, _, next) => {
  // const user = await db.query("SELECT * FROM user WHERE userID = ?", [5]);
  // req.user = user[0];
  //
  // console.log(user);

  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token: ", token);
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    if (decoded.id) {
      const user = await db.query("SELECT * FROM user WHERE userID = ?", [
        decoded.id,
      ]);

      if (user.length < 0) {
        throw new Error("Decoded id of user not found");
      }

      req.user = user[0];
    }
  }

  next();
};

// app.use(meMiddleware);

app.use(
  "/graphql",
  meMiddleware,
  graphqlHTTP((req) => {
    const context = { user: req.user };

    return {
      schema,
      rootValue: resolvers,
      graphiql: true,
      context,
    };
  }),
);

app.listen(4000, () => {
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
});
