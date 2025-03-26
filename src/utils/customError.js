class customError extends Error {
  statusCode;
  constructor(message, statusCode, error) {
    super(message, error);
    this.statusCode = statusCode;
  }

  //methods
  serveError = () => {
    let error = `${this.message}`;
    return { error, statusCode: this.statusCode };
  };
}

export default customError;
