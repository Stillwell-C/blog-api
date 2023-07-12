const request = require("supertest");
const mongoose = require("mongoose");
const createServer = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const commentServices = require("../service/comments.services");
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

const mockComment = {
  _id: mockMongooseId,
  author: mockMongooseId,
  parentPostId: mockMongooseId,
  commentBody: "Some text",
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock("../middleware/verifyJWT", () => jest.fn());

jest.mock("../service/comments.services", () => ({
  findCommentById: jest.fn(),
}));

describe("comments route", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  afterEach(() => jest.clearAllMocks());

  describe("get comment route", () => {
    describe("given an ID in query body", () => {
      it("will return 200", async () => {
        commentServices.findCommentById.mockImplementation(() => mockComment);
        await request(app)
          .get(`/comments/${mockMongooseId}`)
          .expect("Content-Type", /json/)
          .expect(200);
      });
    });

    describe("nothing is returned after find is called", () => {
      it("will return 400", async () => {
        commentServices.findCommentById.mockImplementation(() => undefined);
        await request(app)
          .get(`/comments/${mockMongooseId}`)
          .expect("Content-Type", /json/)
          .expect({
            message: "Comment not found",
          })
          .expect(400);
      });
    });
  });
});
