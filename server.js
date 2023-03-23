require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const {logger} = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConnect')
const PORT = process.env.PORT || 3500

//Connect to MongoDB
connectDB()

//custom middleware logger
app.use(logger)

//Handle options credentials check before CORS
//and fetch cookies credentials requirement
app.use(credentials)

//CORS
app.use(cors(corsOptions))

//built-in middleware to handle urlencoded form data: 'content-type:application/x-www-form*urlencoded'
app.use(express.urlencoded({extended: false}))

//built-in middleware for json
app.use(express.json())

//middleware for cookies
app.use(cookieParser())

//serve static files
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/register', require('./routes/api/register'))
app.use('/login', require('./routes/api/authentification'))
app.use('/refresh', require('./routes/api/refresh'))
app.use('/logout', require('./routes/api/logout'))

app.use(verifyJWT)
app.use('/employees', require('./routes/api/employees'))

//app.all is better for routing. app.use is better for middleware
app.all('/*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({error: '404 Not Found'})
  } else {
    res.type('txt').send('404 Not Found')
  }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
