class ApiError extends Error{
  constructor(
    statusCode,
    message="Something went wrong",
    errors=[],
    stack=""
  ){
    super(message);                   // Calls the parent (Error) constructor
    this.statusCode = statusCode;     // Assigns HTTP status code (e.g., 404, 500)
    this.errors = errors;             // Stores additional error details (array)
    this.stack = stack;               // Custom stack trace (if provided)
    this.success = false;             // Indicates failure (common in API responses)
    this.data= null;

    if (stack) {
        this.stack = stack; 
    } else {
        Error.captureStackTrace(this, this.constructor); 
    }
  }             
}

export { ApiError}