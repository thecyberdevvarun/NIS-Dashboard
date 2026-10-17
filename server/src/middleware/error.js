exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  // SQL Server constraint errors -> friendly messages
  if (err.number === 2627 || err.number === 2601) { status = 409; message = 'This record already exists (duplicate value)'; }
  if (err.number === 547) { status = 409; message = 'This record is linked to other data and cannot be changed/deleted'; }
  if (status === 500) console.error(err);

  res.status(status).json({ message: status === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : message, details: err.details });
};
