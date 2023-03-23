const PORT = process.env.PORT || 3500

const allowedOrigins = [
  'https://www.google.com',
  'https://www.yoursite.com',
  'http://127.0.0.1:5500',
  `localhost:${PORT}`,
]

module.exports = allowedOrigins
