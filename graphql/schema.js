const { buildSchema } = require("graphql");

// me(token: String!): User

const schema = buildSchema(`
  type Query {
    items: [Item!]!
    item(productID: Int!): Item

    purchases: [Purchase!]!
    purchase(purchaseID: Int!): Purchase

    customers: [Customer!]!
    customer(customerID: Int!): Customer

    vendors: [Vendor!]!
    vendor(vendorID: Int!): Vendor

    sales: [Sale!]!
    sale(saleID: Int!): Sale

    users: [User!]!
    user(userID: Int!): User

    me: User
  }

  type Mutation {
    signup(fullname: String!, username: String!, password: String!): AuthPayload
    login(username: String!, password: String!): AuthPayload
    createItem(itemNumber: Int!, itemName: String!, discount: Float!, stock: Int!, unitPrice: Int!, imageURL: String!, description: String!): MutationMessage
    deductItem(productID: Int!, quantity: Int!, customerID: Int!): MutationMessage
  }

  type MutationMessage {
    message: String!
    success: Boolean!
  }

  type AuthPayload {
    token: String
    error: String
  }

  type Customer {
    customerID: Int!
    fullName: String!
    email: String!
    mobile: Int!
    phone2: Int!
    address: String!
    address2: String!
    city: String!
    district: String!
    status: String!
    createdOn: String!
  }

  type Item {
    productID: Int!
    itemNumber: Int!
    itemName: String!
    discount: Float!
    stock: Int!
    unitPrice: Int!
    imageURL: String!
  }

  type Purchase {
    purchaseID: Int!
    itemNumber: Int!
    purchaseDate: String!
    itemName: String!
    unitPrice: Int!
    quantity: Int!
    vendorName: String!
    vendorID: Int!
  }

  type Sale {
    saleID: Int!
    itemNumber: String!
    customerID: Int!
    customerName: String!
    itemName: String!
    saleDate: String!
    discount: Float!
    quantity: Int!
    unitPrive: Float!
  }

  type Vendor {
    vendorID: Int!
    fullName: String!
    email: String!
    mobile: Int!
    phone2: Int!
    address: String!
    address2: String!
    city: String!
    district: String!
    status: String!
    createdOn: String!
  }

  type User {
    userID: Int!
    fullName: String!
    username: String!
    password: String!
    status: String!
  }
`);

module.exports = schema;
