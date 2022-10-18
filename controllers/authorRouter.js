const sequelize = require("sequelize");
const { Blog } = require("../models");

const authorRouter = require("express").Router();

authorRouter.get("/", async (req, res) => {
  const authors = await Blog.findAll({
    attributes: [
      "author",
      [sequelize.fn("count", sequelize.col("title")), "articles"],
      [sequelize.fn("sum", sequelize.col("likes")), "likes"],
    ],
    group: ["author"],
  });
  console.log(authors);
  res.json(authors);
});

module.exports = authorRouter;
