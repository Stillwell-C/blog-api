const request = require("supertest");
const mongoose = require("mongoose");
const createServer = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const userServices = require("../service/user.services");
const verifyJWT = require("../middleware/verifyJWT");

const app = createServer();

const mockMongooseId = new mongoose.Types.ObjectId().toString();

const mockUser = {
  _id: mockMongooseId,
  username: "mockUser",
  password: "password",
  roles: ["user", "contributor"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock("../middleware/verifyJWT", () => jest.fn());

describe.skip("user routes", () => {
  it("does nothing", () => {});
});
