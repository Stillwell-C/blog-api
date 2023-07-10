const request = require("supertest");
const mongoose = require("mongoose");
const createServer = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const postServices = require("../service/post.services");
const userServices = require("../service/user.services");
const verifyJWT = require("../middleware/verifyJWT");

const app = createServer();

const mockMongooseId = new mongoose.Types.ObjectId().toString();

// const mockFindPost = jest.spyOn(postServices, "findPost").mockReturnValue({
//   title: "test title 0",
//   epigraph: "test epigraph 0",
//   epigraphAuthor: "test epigraph author 0",
//   text: "test text 0",
//   author: mockMongooseId,
//   _id: mockMongooseId,
// });

// jest.mock("../service/post.services", () => ({
//   findPost: () => ({
//     title: "test title 0",
//     epigraph: "test epigraph 0",
//     epigraphAuthor: "test epigraph author 0",
//     text: "test text 0",
//     author: mockMongooseId,
//     _id: mockMongooseId,
//     userLikesPost: false,
//   }),
// }));

jest.mock("../service/post.services", () => ({
  findPost: jest.fn(),
  findTopPosts: jest.fn(),
  findMultiplePosts: jest.fn(),
  createPost: jest.fn(),
}));

jest.mock("../service/user.services", () => ({
  findUserById: jest.fn(),
}));

jest.mock("../middleware/verifyJWT", () => jest.fn());

const mockPostData = [
  {
    title: "test title 0",
    epigraph: "test epigraph 0",
    epigraphAuthor: "test epigraph author 0",
    text: "test text 0",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 1",
    epigraph: "test epigraph 1",
    epigraphAuthor: "test epigraph author 1",
    text: "test text 1",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 2",
    epigraph: "test epigraph 2",
    epigraphAuthor: "test epigraph author 2",
    text: "test text 2",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 3",
    epigraph: "test epigraph 3",
    epigraphAuthor: "test epigraph author 3",
    text: "test text 3",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 4",
    epigraph: "test epigraph 4",
    epigraphAuthor: "test epigraph author 4",
    text: "test text 4",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 5",
    epigraph: "test epigraph 5",
    epigraphAuthor: "test epigraph author 5",
    text: "test text 5",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 6",
    epigraph: "test epigraph 6",
    epigraphAuthor: "test epigraph author 6",
    text: "test text 6",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 7",
    epigraph: "test epigraph 7",
    epigraphAuthor: "test epigraph author 7",
    text: "test text 7",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 8",
    epigraph: "test epigraph 8",
    epigraphAuthor: "test epigraph author 8",
    text: "test text 8",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 9",
    epigraph: "test epigraph 9",
    epigraphAuthor: "test epigraph author 9",
    text: "test text 9",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 10",
    epigraph: "test epigraph 10",
    epigraphAuthor: "test epigraph author 10",
    text: "test text 10",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
];

const mockTopPostData = [
  {
    title: "test title 0",
    epigraph: "test epigraph 0",
    epigraphAuthor: "test epigraph author 0",
    text: "test text 0",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 1",
    epigraph: "test epigraph 1",
    epigraphAuthor: "test epigraph author 1",
    text: "test text 1",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
  {
    title: "test title 2",
    epigraph: "test epigraph 2",
    epigraphAuthor: "test epigraph author 2",
    text: "test text 2",
    author: mockMongooseId,
    _id: mockMongooseId,
  },
];

const mockUser = {
  _id: mockMongooseId,
  username: "mockUser",
  password: "password",
  roles: ["user", "contributor"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("post", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    jest.clearAllMocks();
  });

  describe("get post route", () => {
    describe("given that the post does not exist", () => {
      it("should return a 400", async () => {
        postServices.findPost.mockImplementation(() => undefined);
        await request(app)
          .get(`/posts/${mockMongooseId}`)
          .expect("Content-Type", /json/)
          .expect({ message: "Post not found" })
          .expect(400);
      });
    });

    describe("given that the post does exist", () => {
      // let createdPostID;
      // beforeEach(async () => {
      //   //Get user info
      //   const newUser = await request(app)
      //     .post("/users")
      //     .send({ username: "testUser", password: "123456" });
      //   const loggedInUser = await request(app)
      //     .post("/auth")
      //     .send({ username: "testUser", password: "123456" });
      //   const { accessToken } = JSON.parse(loggedInUser.text);
      //   const userID = jwt.verify(
      //     accessToken,
      //     process.env.ACCESS_TOKEN_CODE,
      //     (err, decoded) => {
      //       return decoded.UserInfo.id;
      //     }
      //   );
      //   //Make a post
      //   await request(app)
      //     .post("/posts")
      //     .set("Authorization", `Bearer ${accessToken}`)
      //     .send({
      //       title: "test title",
      //       epigraph: "test epigraph",
      //       epigraphAuthor: "test epigraph author",
      //       text: "test text",
      //       author: userID,
      //     });
      //   //Get ID of first post
      //   const { body: createdPost } = await request(app).get(`/posts/`);
      //   createdPostID = createdPost.posts[0]._id;
      // });

      it("should return a 200", async () => {
        postServices.findPost.mockImplementation(() => ({
          title: "test title 0",
          epigraph: "test epigraph 0",
          epigraphAuthor: "test epigraph author 0",
          text: "test text 0",
          author: mockMongooseId,
          _id: mockMongooseId,
          userLikesPost: false,
        }));
        const { body } = await request(app)
          .get(`/posts/${mockMongooseId}`)
          .expect("Content-Type", /json/)
          .expect(200);

        expect(body._id).toBe(mockMongooseId);
      });

      it("should return userLikesPost & not return likedUsers", async () => {
        postServices.findPost.mockImplementation(() => ({
          title: "test title 0",
          epigraph: "test epigraph 0",
          epigraphAuthor: "test epigraph author 0",
          text: "test text 0",
          author: mockMongooseId,
          _id: mockMongooseId,
          userLikesPost: false,
        }));
        const { body } = await request(app)
          .get(`/posts/${mockMongooseId}`)
          .expect("Content-Type", /json/);
        expect(body).toHaveProperty("userLikesPost");
        expect(body).not.toHaveProperty("likedUsers");
      });
    });
  });

  describe("get all posts route", () => {
    describe("given no post data", () => {
      it("should return a 400", async () => {
        postServices.findMultiplePosts.mockImplementation(() => undefined);
        await request(app)
          .get(`/posts/`)
          .expect("Content-Type", /json/)
          .expect({ message: "No posts found" })
          .expect(400);
      });
    });

    describe("given post data", () => {
      it("returns a 200", async () => {
        postServices.findMultiplePosts.mockImplementation(() => mockPostData);
        await request(app)
          .get(`/posts/`)
          .expect("Content-Type", /json/)
          .expect(200);
      });

      it("returns the total amount of posts found", async () => {
        postServices.findMultiplePosts.mockImplementation(() => mockPostData);
        const { body } = await request(app)
          .get(`/posts/`)
          .expect("Content-Type", /json/);
        //The function this relies on is mocked, so it will not return an accurate value here.
        //The property should be returned, though.
        expect(body).toHaveProperty("totalPosts");
      });

      it("does not return top property when top is top query is not true", async () => {
        postServices.findMultiplePosts.mockImplementation(() => mockPostData);
        postServices.findTopPosts.mockImplementation(() => mockTopPostData);
        const { body: body1 } = await request(app)
          .get(`/posts/`)
          .expect("Content-Type", /json/);
        expect(body1).not.toHaveProperty("top");

        const { body: body2 } = await request(app)
          .get(`/posts?top=false`)
          .expect("Content-Type", /json/);
        expect(body2).not.toHaveProperty("top");
      });

      it("returns a top property with 3 items when top query is set to true", async () => {
        postServices.findMultiplePosts.mockImplementation(() => mockPostData);
        postServices.findTopPosts.mockImplementation(() => mockTopPostData);
        const { body } = await request(app)
          .get(`/posts?top=true`)
          .expect("Content-Type", /json/);
        expect(body).toHaveProperty("top");
        expect(body.top.length).toBe(3);
      });
    });
  });

  describe("create new post route", () => {
    describe("given no title, text, or author", () => {
      it("it should return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        postServices.createPost.mockImplementation(() => mockPostData[0]);
        userServices.findUserById.mockImplementation(() => mockUser);

        const postNoTitle = { ...mockPostData[0] };
        postNoTitle.title = "";
        await request(app)
          .post("/posts/")
          .send(postNoTitle)
          .expect("Content-Type", /json/)
          .expect({ message: "All parameters required" })
          .expect(400);

        const postNoText = { ...mockPostData[0] };
        postNoText.text = "";
        await request(app)
          .post("/posts/")
          .send(postNoText)
          .expect("Content-Type", /json/)
          .expect({ message: "All parameters required" })
          .expect(400);

        const postNoAuthor = { ...mockPostData[0] };
        postNoAuthor.author = "";
        await request(app)
          .post("/posts/")
          .send(postNoAuthor)
          .expect("Content-Type", /json/)
          .expect({ message: "All parameters required" })
          .expect(400);
      });
    });

    describe("given invalid author", () => {
      it("it should return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        postServices.createPost.mockImplementation(() => mockPostData[0]);
        //This result is same as author not being found
        userServices.findUserById.mockImplementation(() => undefined);

        await request(app)
          .post("/posts/")
          .send(mockPostData[0])
          .expect("Content-Type", /json/)
          .expect({
            message: "Invalid author. Please sign in before submitting post.",
          })
          .expect(400);
      });
    });

    describe("given a post with title, text, or author", () => {
      it("should return 201", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        postServices.createPost.mockImplementation(() => mockPostData[0]);
        userServices.findUserById.mockImplementation(() => mockUser);

        await request(app)
          .post("/posts/")
          .send(mockPostData[0])
          .expect("Content-Type", /json/)
          .expect(201);
      });
    });

    describe("given that the post is not created", () => {
      it("should return a 400", async () => {
        verifyJWT.mockImplementation((req, res, next) => next());
        postServices.createPost.mockImplementation(() => undefined);
        userServices.findUserById.mockImplementation(() => mockUser);

        await request(app)
          .post("/posts/")
          .send(mockPostData[0])
          .expect("Content-Type", /json/)
          .expect({
            message: "Invalid data recieved",
          })
          .expect(400);
      });
    });
  });
});
