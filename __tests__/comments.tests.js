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
  findMultipleComments: jest.fn(),
  findUserComments: jest.fn(),
  findPostComments: jest.fn(),
  createNewComment: jest.fn(),
  findAndUpdateComment: jest.fn(),
  findAndDeleteComment: jest.fn(),
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

  describe("get comments route", () => {
    describe("given no comment data found", () => {
      it("will return 400", async () => {
        commentServices.findMultipleComments.mockImplementation(
          () => undefined
        );

        await request(app)
          .get(`/comments/`)
          .expect("Content-Type", /json/)
          .expect({
            message: "No comments found",
          })
          .expect(400);
      });
    });

    describe("given comment data is found", () => {
      it("will return 200", async () => {
        commentServices.findMultipleComments.mockImplementation(() => [
          mockComment,
          mockComment,
          mockComment,
        ]);

        await request(app)
          .get(`/comments/`)
          .expect("Content-Type", /json/)
          .expect(200);
      });

      it("returns the total amount of posts found", async () => {
        commentServices.findMultipleComments.mockImplementation(() => [
          mockComment,
          mockComment,
          mockComment,
        ]);

        const { body } = await request(app)
          .get(`/comments/`)
          .expect("Content-Type", /json/);
        //The function this relies on is mocked, so it will not return an accurate value here.
        //The property should be returned, though.
        expect(body).toHaveProperty("totalComments");
      });
    });
  });

  describe("get user comments route", () => {
    describe("given comment data is found", () => {
      it("will return 200", async () => {
        commentServices.findUserComments.mockImplementation(() => [
          mockComment,
          mockComment,
          mockComment,
        ]);

        await request(app)
          .get(`/users/${mockMongooseId}/comments`)
          .expect("Content-Type", /json/)
          .expect(200);
      });

      it("will return total comments", async () => {
        commentServices.findUserComments.mockImplementation(() => [
          mockComment,
          mockComment,
          mockComment,
        ]);

        const { body } = await request(app)
          .get(`/users/${mockMongooseId}/comments`)
          .expect("Content-Type", /json/);

        //The function this relies on is mocked, so it will not return an accurate value here.
        //The property should be returned, though.
        expect(body).toHaveProperty("totalComments");
      });
    });

    describe("give no comment data is found", () => {
      it("will return 400", async () => {
        commentServices.findUserComments.mockImplementation(() => undefined);

        await request(app)
          .get(`/users/${mockMongooseId}/comments`)
          .expect("Content-Type", /json/)
          .expect({
            message: "No comments found",
          })
          .expect(400);
      });
    });
  });

  describe("get post comments route", () => {
    describe("given comment data is found", () => {
      it("will return 200", async () => {
        commentServices.findPostComments.mockImplementation(() => [
          mockComment,
          mockComment,
          mockComment,
        ]);

        await request(app)
          .get(`/posts/${mockMongooseId}/comments`)
          .expect("Content-Type", /json/)
          .expect(200);
      });

      it("will return total comments", async () => {
        commentServices.findPostComments.mockImplementation(() => [
          mockComment,
          mockComment,
          mockComment,
        ]);

        const { body } = await request(app)
          .get(`/posts/${mockMongooseId}/comments`)
          .expect("Content-Type", /json/);

        //The function this relies on is mocked, so it will not return an accurate value here.
        //The property should be returned, though.
        expect(body).toHaveProperty("totalComments");
      });
    });

    describe("give no comment data is found", () => {
      it("will return 400", async () => {
        commentServices.findPostComments.mockImplementation(() => undefined);

        await request(app)
          .get(`/posts/${mockMongooseId}/comments`)
          .expect("Content-Type", /json/)
          .expect({
            message: "No comments found",
          })
          .expect(400);
      });
    });
  });

  describe("create comment route", () => {
    describe("given no author, parentPostId, or commentBody", () => {
      it("will return 400", async () => {
        commentServices.createNewComment.mockImplementation(() => mockComment);
        verifyJWT.mockImplementation((req, res, next) => next());

        await request(app)
          .post(`/comments/`)
          .send({ author: mockMongooseId, parentPostId: mockMongooseId })
          .expect("Content-Type", /json/)
          .expect({
            message: "All parameters required",
          })
          .expect(400);

        await request(app)
          .post(`/comments/`)
          .send({ author: mockMongooseId, commentBody: "some text" })
          .expect("Content-Type", /json/)
          .expect({
            message: "All parameters required",
          })
          .expect(400);

        await request(app)
          .post(`/comments/`)
          .send({ parentPostId: mockMongooseId, commentBody: "some text" })
          .expect("Content-Type", /json/)
          .expect({
            message: "All parameters required",
          })
          .expect(400);
      });
    });

    describe("given an author, parentPostId, or commentBody", () => {
      it("will return 200", async () => {
        commentServices.createNewComment.mockImplementation(() => mockComment);
        verifyJWT.mockImplementation((req, res, next) => next());

        await request(app)
          .post(`/comments/`)
          .send({
            author: mockMongooseId,
            parentPostId: mockMongooseId,
            commentBody: "some text",
          })
          .expect("Content-Type", /json/)
          .expect(200);
      });
    });

    describe("given that no data is returned after comment is created", () => {
      it("will return 400", async () => {
        commentServices.createNewComment.mockImplementation(() => undefined);
        verifyJWT.mockImplementation((req, res, next) => next());

        await request(app)
          .post(`/comments/`)
          .send({
            author: mockMongooseId,
            parentPostId: mockMongooseId,
            commentBody: "some text",
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Invalid data recieved",
          })
          .expect(400);
      });
    });
  });

  describe("update comment route", () => {
    describe("given no comment id or comment body in request body", () => {
      it("will return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        commentServices.findAndUpdateComment.mockImplementation(
          () => mockComment
        );

        await request(app)
          .patch("/comments")
          .send({ commentBody: "some text" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Comment ID parameter required",
          })
          .expect(400);

        await request(app)
          .patch("/comments")
          .send({ id: mockMongooseId })
          .expect("Content-Type", /json/)
          .expect({
            message: "Comment body parameter required",
          })
          .expect(400);
      });
    });

    describe("given a comment id and comment body in request body", () => {
      it("will return a 200", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        commentServices.findAndUpdateComment.mockImplementation(
          () => mockComment
        );

        await request(app)
          .patch("/comments")
          .send({ id: mockMongooseId, commentBody: "some text" })
          .expect("Content-Type", /json/)
          .expect(200);
      });
    });
  });

  describe("delete comment route", () => {
    describe("given no id in request body", () => {
      it("will return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        commentServices.findAndDeleteComment.mockImplementation(
          () => mockComment
        );

        await request(app)
          .delete("/comments")
          .send({})
          .expect("Content-Type", /json/)
          .expect({
            message: "Comment ID required",
          })
          .expect(400);
      });
    });

    describe("given an id in request body", () => {
      it("will return a 200", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        commentServices.findAndDeleteComment.mockImplementation(
          () => mockComment
        );

        await request(app)
          .delete("/comments")
          .send({ id: mockMongooseId })
          .expect("Content-Type", /json/)
          .expect(200);
      });
    });

    describe("given that no data is returned after delete is called", () => {
      it("will return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        commentServices.findAndDeleteComment.mockImplementation(
          () => undefined
        );

        await request(app)
          .delete("/comments")
          .send({ id: mockMongooseId })
          .expect("Content-Type", /json/)
          .expect({
            message: "Comment not found",
          })
          .expect(400);
      });
    });
  });
});
