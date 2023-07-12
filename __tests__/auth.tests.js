const request = require("supertest");
const mongoose = require("mongoose");
const createServer = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const authServices = require("../service/auth.services");
const userServices = require("../service/user.services");
const verifyJWT = require("../middleware/verifyJWT");
const loginLimiter = require("../middleware/loginLimiter");

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

const mockAccessToken = "thisisamockaccesstoken";
const mockRefreshToken = "thisisamockrefreshtoken";

jest.mock("../middleware/verifyJWT", () => jest.fn());

jest.mock("../service/auth.services", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
}));

jest.mock("../service/user.services", () => ({
  findUserByUsername: jest.fn(),
}));

jest.mock("../middleware/loginLimiter", () =>
  jest.fn((request, response, next, options) => next())
);

describe("auth route", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  afterEach(() => jest.clearAllMocks());

  describe("login route", () => {
    describe("given no username or password", () => {
      it("will return 400", async () => {
        userServices.findUserByUsername.mockImplementation(() => mockUser);
        authServices.comparePasswords.mockImplementation(() => true);
        authServices.generateAccessToken.mockImplementation(
          () => mockAccessToken
        );
        authServices.generateRefreshToken.mockImplementation(
          () => mockRefreshToken
        );

        await request(app)
          .post("/auth")
          .send({ username: "testusername" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Username and password required",
          })
          .expect(400);

        await request(app)
          .post("/auth")
          .send({ password: "testpassword" })
          .expect("Content-Type", /json/)
          .expect({
            message: "Username and password required",
          })
          .expect(400);
      });
    });

    describe("given a username and password", () => {
      describe("given a valid username and password", () => {
        it("will return 200", async () => {
          //Valid username
          userServices.findUserByUsername.mockImplementation(() => mockUser);
          //Correct password
          authServices.comparePasswords.mockImplementation(() => true);
          authServices.generateAccessToken.mockImplementation(
            () => mockAccessToken
          );
          authServices.generateRefreshToken.mockImplementation(
            () => mockRefreshToken
          );

          await request(app)
            .post("/auth")
            .send({ username: "testusername", password: "testpassword" })
            .expect("Content-Type", /json/)
            .expect(200);
        });

        it("will return an access token in response body", async () => {
          //Valid username
          userServices.findUserByUsername.mockImplementation(() => mockUser);
          //Correct password
          authServices.comparePasswords.mockImplementation(() => true);
          authServices.generateAccessToken.mockImplementation(
            () => mockAccessToken
          );
          authServices.generateRefreshToken.mockImplementation(
            () => mockRefreshToken
          );

          const { body } = await request(app)
            .post("/auth")
            .send({ username: "testusername", password: "testpassword" })
            .expect("Content-Type", /json/)
            .expect(200);

          expect(body).toHaveProperty("accessToken");
          expect(body.accessToken).toEqual(expect.any(String));
        });

        it("will set a cookie with the refresh token", async () => {
          //Valid username
          userServices.findUserByUsername.mockImplementation(() => mockUser);
          //Correct password
          authServices.comparePasswords.mockImplementation(() => true);
          authServices.generateAccessToken.mockImplementation(
            () => mockAccessToken
          );
          authServices.generateRefreshToken.mockImplementation(
            () => mockRefreshToken
          );

          const { header } = await request(app)
            .post("/auth")
            .send({ username: "testusername", password: "testpassword" })
            .expect("Content-Type", /json/)
            .expect(200);

          expect(header["set-cookie"][0]).toMatch(
            /jwt=thisisamockrefreshtoken/i
          );
          expect(header["set-cookie"][0]).toMatch(/Max-Age=604800/i);
          expect(header["set-cookie"][0]).toMatch(/HttpOnly/i);
          expect(header["set-cookie"][0]).toMatch(/Secure/i);
          expect(header["set-cookie"][0]).toMatch(/SameSite=None/i);
        });
      });

      describe("given a valid username and invalid password", () => {
        it("will return 401", async () => {
          //Valid username
          userServices.findUserByUsername.mockImplementation(() => mockUser);
          //Incorrect password
          authServices.comparePasswords.mockImplementation(() => false);
          authServices.generateAccessToken.mockImplementation(
            () => mockAccessToken
          );
          authServices.generateRefreshToken.mockImplementation(
            () => mockRefreshToken
          );

          await request(app)
            .post("/auth")
            .send({ username: "testusername", password: "testpassword" })
            .expect("Content-Type", /json/)
            .expect({
              message: "Password incorrect",
            })
            .expect(401);
        });
      });

      describe("given an invalid username and valid password", () => {
        it("will return 401", async () => {
          //Invalid username
          userServices.findUserByUsername.mockImplementation(() => undefined);
          //Correct password
          authServices.comparePasswords.mockImplementation(() => true);
          authServices.generateAccessToken.mockImplementation(
            () => mockAccessToken
          );
          authServices.generateRefreshToken.mockImplementation(
            () => mockRefreshToken
          );

          await request(app)
            .post("/auth")
            .send({ username: "testusername", password: "testpassword" })
            .expect("Content-Type", /json/)
            .expect({
              message: "Username not found",
            })
            .expect(401);
        });
      });
    });
  });
});
