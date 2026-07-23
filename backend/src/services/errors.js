class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports.NotFoundError = NotFoundError;
module.exports.BadRequestError = BadRequestError;
