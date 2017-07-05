const codes = require('http-status-codes');

module.exports = (error, req, res, next) => { // jshint ignore:line
  let message = null;
  let n;

  console.log('error', error)

  if (typeof error === 'number') {
    n = error;
    error = new Error(codes.getStatusText(error));
    error.code = n;
  }
  message = error.message || codes.getStatusText(n);

  // Ensure we send the correct type of http status, if there's a real error
  // then the `error.code` will be a string, override with 500
  // 500, General error:
  let status = error.code || 500;
  if (typeof status === 'string') {
    status = 500;
  }

  // prepare the error page shown to the user
  const e = {
    message,
    status,
  };

  if (status === 401) {
    return res.status(401).jsonp({
      status,
      message: message + ' (wrong api token)',
    });
  }

  let msg = `${status} ${req.url} `;
  if (req.user) {
    msg += `${req.user.username} `;
  }
  msg += message;

  console.error(error.stack || msg);

  res.status(status).jsonp(e);
}
