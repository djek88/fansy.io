const http = require('http');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Unknown';
  }

  name() {
    return 'HttpError';
  }
}

HttpError.prototype.name = 'HttpError';

module.exports = HttpError;
