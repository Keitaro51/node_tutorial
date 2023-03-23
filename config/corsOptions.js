const allowedOrigins = require('./allowedOrigins')

// origin may be hidden if the user comes from an ssl encrypted website.
// Also: Some browser extensions remove origin and referer from the http-request headers, and therefore the origin property will be empty.
// app.use(function (req, res, next) {
//   req.headers.origin = req.headers.origin || req.headers.host
//   next()
// })

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
}

module.exports = corsOptions
