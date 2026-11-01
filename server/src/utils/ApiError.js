class ApiError extends Error {
  constructor(status, message, details) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;
