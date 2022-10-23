const { SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  } else response.send({ error: "missing authorization token" });
  next();
};
const userExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    const decodedToken = jwt.verify(request.token, SECRET);
    if (!decodedToken.id) {
      response.status(401).json({ error: "token missing or invalid" });
    }
    request.user = decodedToken;
    console.log("the middleware", request.user);
  }
  next();
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({
      error: "malformatted id",
    });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({
      error: error.message,
    });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token",
    });
  } else if (error.name === "SequelizeValidationError") {
    console.log("here");
    return response.status(401).json({
      error: error.errors[0].message,
    });
  } else if (error.name === "TypeError") {
    console.log("in type error");
    return response.status(401).json({
      error: "blog doesnot exists",
    });
  } else return response.status(404).json({ error: error });

  // console.log(error.message);

  // next(error);
};
// this has to be the last loaded middleware.
module.exports = { errorHandler, tokenExtractor, userExtractor };
