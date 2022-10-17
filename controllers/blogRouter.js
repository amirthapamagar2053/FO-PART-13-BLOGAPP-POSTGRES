const blogRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");

const { Blog, User } = require("../models");

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

blogRouter.get("/", async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  res.json(blogs);
});

blogRouter.post("/", tokenExtractor, async (req, res) => {
  try {
    const blog = await Blog.create({
      ...req.body,
      userId: req.decodedToken.id,
    });
    res.json(blog);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

blogRouter.get("/:id", blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

blogRouter.delete("/:id", tokenExtractor, blogFinder, async (req, res) => {
  if (req.decodedToken.id === req.blog.userId) {
    if (req.blog) {
      await req.blog.destroy();
      res.json({ delted: "the blog has been deleted" });
    }
  }
  res.status(204).end();
});

blogRouter.put("/:id", blogFinder, async (req, res) => {
  if (req.blog) {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

module.exports = blogRouter;
