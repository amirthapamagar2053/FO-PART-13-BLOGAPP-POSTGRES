require("dotenv").config();
const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
const main = async () => {
  const blogs = await sequelize.query("SELECT * FROM blogs", {
    type: QueryTypes.SELECT,
  });

  blogs.map((blog) =>
    console.log(
      blog.author + ":" + "'" + blog.title + "',",
      blog.likes + " likes"
    )
  );
};

main();
