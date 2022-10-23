const blogRouter = require("express").Router();
const { Op } = require("sequelize");
const { Blog, User } = require("../models");
const { tokenExtractor, userExtractor } = require("../util/middleware");

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

blogRouter.get("/", async (req, res) => {
  const where = {};

  if (req.query.search) {
    where.title = {
      [Op.substring]: req.query.search,
    };
    where.author = {
      [Op.substring]: req.query.search,
    };
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
    where,
  });
  res.json(blogs.sort((a, b) => b.likes - a.likes));
});

blogRouter.post("/", tokenExtractor, userExtractor, async (req, res) => {
  try {
    if (
      Number(req.body.year) < 1991 ||
      Number(req.body.year) > new Date().getFullYear()
    )
      res.json({ error: "invalid year of creation" });
    else {
      const blog = await Blog.create({
        ...req.body,
        userId: req.user.id,
      });
      res.json(blog);
    }
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
