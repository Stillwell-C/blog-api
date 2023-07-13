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

jest.mock("../service/user.services", () => ({
  findUserById: jest.fn(),
  findMultipleUsers: jest.fn(),
  duplicateUserCheck: jest.fn(),
  generateNewUser: jest.fn(),
  findAndUpdateUser: jest.fn(),
  findAndDeleteUser: jest.fn(),
}));

describe("user routes", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  afterEach(() => jest.clearAllMocks());

  describe("get user route", () => {
    describe("given a valid user id", () => {
      it("returns a 200", async () => {
        userServices.findUserById.mockImplementation(() => mockUser);

        await request(app)
          .get(`/users/${mockMongooseId}`)
          .expect("Content-Type", /json/)
          .expect(200);

        expect(userServices.findUserById).toHaveBeenCalledTimes(1);
      });
    });

    describe("given an invalid user id", () => {
      it("returns a 400", async () => {
        userServices.findUserById.mockImplementation(() => undefined);

        await request(app)
          .get(`/users/${mockMongooseId}`)
          .expect("Content-Type", /json/)
          .expect({
            message: "User not found",
          })
          .expect(400);

        expect(userServices.findUserById).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("get user route", () => {
    describe("given that users exist", () => {
      it("returns a 200", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findMultipleUsers.mockImplementation(() => [
          mockUser,
          mockUser,
          mockUser,
        ]);

        await request(app)
          .get("/users")
          .expect("Content-Type", /json/)
          .expect(200);

        expect(userServices.findMultipleUsers).toHaveBeenCalledTimes(1);
      });
    });

    describe("given that no users are found", () => {
      it("returns a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findMultipleUsers.mockImplementation(() => undefined);

        await request(app)
          .get("/users")
          .expect("Content-Type", /json/)
          .expect({
            message: "No users found",
          })
          .expect(400);

        expect(userServices.findMultipleUsers).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("create new user route", () => {
    describe("given no username or no password", () => {
      it("will return 400", async () => {
        userServices.duplicateUserCheck.mockImplementation(() => undefined);
        userServices.generateNewUser.mockImplementation(() => mockUser);

        await request(app)
          .post("/users")
          .send({ username: "testUser22" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Username and password required",
          })
          .expect(400);

        await request(app)
          .post("/users")
          .send({ password: "testPassword22" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Username and password required",
          })
          .expect(400);
      });
    });

    describe("given a username and password", () => {
      it("will return 201", async () => {
        userServices.duplicateUserCheck.mockImplementation(() => undefined);
        userServices.generateNewUser.mockImplementation(() => mockUser);

        await request(app)
          .post("/users")
          .send({ username: "testUser22", password: "testPassword22" })
          .expect("Content-Type", /json/)
          .expect(201);
      });
    });

    describe("given a duplicate username", () => {
      it("will return 409", async () => {
        userServices.duplicateUserCheck.mockImplementation(() => mockUser);
        userServices.generateNewUser.mockImplementation(() => mockUser);

        await request(app)
          .post("/users")
          .send({ username: "testUser22", password: "testPassword22" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Username not available",
          })
          .expect(409);
      });
    });

    describe("given a no user returned after creation attempted", () => {
      it("will return 400", async () => {
        userServices.duplicateUserCheck.mockImplementation(() => undefined);
        userServices.generateNewUser.mockImplementation(() => undefined);

        await request(app)
          .post("/users")
          .send({ username: "testUser22", password: "testPassword22" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Invalid data received",
          })
          .expect(400);
      });
    });
  });

  describe("update user route", () => {
    describe("given no id is sent in body", () => {
      it("will return 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndUpdateUser.mockImplementation(() => mockUser);
        userServices.duplicateUserCheck.mockImplementation(() => undefined);

        await request(app)
          .patch("/users")
          .send({})
          .expect("Content-Type", /json/)
          .expect({
            message: "User ID parameter required",
          })
          .expect(400);
      });
    });

    describe("given an id is sent in body", () => {
      it("will return 200", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndUpdateUser.mockImplementation(() => mockUser);
        userServices.duplicateUserCheck.mockImplementation(() => undefined);

        await request(app)
          .patch("/users")
          .send({ id: mockMongooseId, ...mockUser })
          .expect("Content-Type", /json/)
          .expect(200);
      });

      it("will recieve an access token", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndUpdateUser.mockImplementation(() => mockUser);
        userServices.duplicateUserCheck.mockImplementation(() => undefined);

        const { body } = await request(app)
          .patch("/users")
          .send({ id: mockMongooseId, ...mockUser })
          .expect("Content-Type", /json/)
          .expect(200);

        expect(body.accessToken).toEqual(expect.any(String));
      });
    });

    describe("given a duplicate username is found for other user ID", () => {
      it("will return 409", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndUpdateUser.mockImplementation(() => mockUser);
        userServices.duplicateUserCheck.mockImplementation(() => mockUser);

        await request(app)
          .patch("/users")
          .send({ id: "fakeid2222", ...mockUser })
          .expect("Content-Type", /json/)
          .expect({
            message: "Username not available",
          })
          .expect(409);
      });
    });

    describe("no updated user is returned", () => {
      it("will return 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndUpdateUser.mockImplementation(() => undefined);
        userServices.duplicateUserCheck.mockImplementation(() => undefined);

        await request(app)
          .patch("/users")
          .send({ id: mockMongooseId, ...mockUser })
          .expect("Content-Type", /json/)
          .expect({
            message: "Invalid data received",
          })
          .expect(400);
      });
    });
  });

  describe("delete user route", () => {
    describe("given no id in the request body", () => {
      it("will return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndDeleteUser.mockImplementation(() => mockUser);

        await request(app)
          .delete("/users")
          .send(mockUser)
          .expect("Content-Type", /json/)
          .expect({
            message: "User ID required",
          })
          .expect(400);
      });
    });

    describe("given an id in the request body", () => {
      it("will return a 200", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndDeleteUser.mockImplementation(() => mockUser);

        await request(app)
          .delete("/users")
          .send({ id: mockMongooseId })
          .expect("Content-Type", /json/)
          .expect(200);
      });
    });

    describe("given an admin password which is incorrect", () => {
      it("will return a 401", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndDeleteUser.mockImplementation(() => mockUser);

        await request(app)
          .delete("/users")
          .send({ id: mockMongooseId, adminPassword: "incorrectpassword" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Incorrect password",
          })
          .expect(401);
      });
    });

    describe("given an admin password which is incorrect", () => {
      it("will return a 401", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndDeleteUser.mockImplementation(() => mockUser);

        await request(app)
          .delete("/users")
          .send({ id: mockMongooseId, adminPassword: process.env.ADMINPASS })
          .expect("Content-Type", /json/)
          .expect(200);
      });
    });

    describe("given no user is returned after delete", () => {
      it("will return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        userServices.findAndDeleteUser.mockImplementation(() => undefined);

        await request(app)
          .delete("/users")
          .send({ id: mockMongooseId })
          .expect("Content-Type", /json/)
          .expect({
            message: "User not found",
          })
          .expect(400);
      });
    });
  });
});
