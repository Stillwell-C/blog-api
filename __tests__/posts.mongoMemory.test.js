const request = require("supertest");
const mongoose = require("mongoose");
const createServer = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const loginLimiter = require("../middleware/loginLimiter").loginLimiter;

const app = createServer();

const mockMongooseId = new mongoose.Types.ObjectId().toString();

jest.mock("../middleware/loginLimiter", () =>
  jest.fn((request, response, next, options) => next())
);

const makePostData = (userId) => {
  return [
    {
      title: "test title 0",
      epigraph: "test epigraph 0",
      epigraphAuthor: "test epigraph author 0",
      text: "test text 0",
      author: userId,
    },
    {
      title: "test title 1",
      epigraph: "test epigraph 1",
      epigraphAuthor: "test epigraph author 1",
      text: "test text 1",
      author: userId,
    },
    {
      title: "test title 2",
      epigraph: "test epigraph 2",
      epigraphAuthor: "test epigraph author 2",
      text: "test text 2",
      author: userId,
    },
    {
      title: "test title 3",
      epigraph: "test epigraph 3",
      epigraphAuthor: "test epigraph author 3",
      text: "test text 3",
      author: userId,
    },
    {
      title: "test title 4",
      epigraph: "test epigraph 4",
      epigraphAuthor: "test epigraph author 4",
      text: "test text 4",
      author: userId,
    },
    {
      title: "test title 5",
      epigraph: "test epigraph 5",
      epigraphAuthor: "test epigraph author 5",
      text: "test text 5",
      author: userId,
    },
    {
      title: "test title 6",
      epigraph: "test epigraph 6",
      epigraphAuthor: "test epigraph author 6",
      text: "test text 6",
      author: userId,
    },
    {
      title: "test title 7",
      epigraph: "test epigraph 7",
      epigraphAuthor: "test epigraph author 7",
      text: "test text 7",
      author: userId,
    },
    {
      title: "test title 8",
      epigraph: "test epigraph 8",
      epigraphAuthor: "test epigraph author 8",
      text: "test text 8",
      author: userId,
    },
    {
      title: "test title 9",
      epigraph: "test epigraph 9",
      epigraphAuthor: "test epigraph author 9",
      text: "test text 9",
      author: userId,
    },
    {
      title: "test title 10",
      epigraph: "test epigraph 10",
      epigraphAuthor: "test epigraph author 10",
      text: "test text 10",
      author: userId,
    },
  ];
};

describe("Post - mongo memory server", () => {
  beforeEach(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("given that a mongoose server is in use", () => {
    beforeEach(async () => {
      //Get user info
      const newUser = await request(app)
        .post("/users")
        .send({ username: "testUser", password: "123456" });

      const loggedInUser = await request(app)
        .post("/auth")
        .send({ username: "testUser", password: "123456" });

      const { accessToken } = JSON.parse(loggedInUser.text);
      const userID = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_CODE,
        (err, decoded) => {
          return decoded.UserInfo.id;
        }
      );
      const postData = makePostData(userID);
      //Make a post
      for (const post of postData) {
        const { title, epigraph, epigraphAuthor, text, author } = post;

        const body = await request(app)
          .post("/posts")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            title,
            epigraph,
            epigraphAuthor,
            text,
            author,
          });
      }
    });

    it("returns the amount specified by the limit query", async () => {
      const { body } = await request(app)
        .get(`/posts?limit=5`)
        .expect("Content-Type", /json/);
      expect(body.posts.length).toBe(5);
    });

    it("returns more than 10 results when limit not given", async () => {
      const { body } = await request(app)
        .get(`/posts/`)
        .expect("Content-Type", /json/);
      console.log(body);
      expect(body.posts.length).toBe(11);
    });
  });
});
