export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  // Parser errors can contain submitted passwords or other request data.
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON request.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large.' });
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const message = field === 'rollNumber' ? 'This roll number is already in use.'
      : field === 'firstNameKey' ? 'This first name is already in use.'
      : field === 'lastNameKey' ? 'This last name is already in use.'
      : 'This email or student identifier is already in use.';
    return res.status(409).json({ message });
  }
  if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(' ') });
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status === 500) console.error('Request failed:', error.name || 'Error', error.code || '');
  res.status(status).json({ message: status === 500 ? 'Something went wrong. Please try again.' : error.message });
}
