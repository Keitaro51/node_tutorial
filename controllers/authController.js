const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleLogin = async (req, res) => {
  const cookies = req.cookies

  const {user, pwd} = req.body
  if (!user || !pwd) {
    return res.status(400).json({message: 'Username and password are required'})
  }

  const foundUser = await User.findOne({username: user}).exec()

  if (!foundUser) {
    return res.sendStatus(401) //Unauthorized
  }
  const match = await bcrypt.compare(pwd, foundUser.password)
  if (match) {
    const roles = Object.values(foundUser.roles)

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '30s'}
      // 5 or 15min in prod
    )
    const newRrefreshToken = jwt.sign(
      {
        username: foundUser.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}
    )

    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt)

    if (cookies?.jwt) {
      console.log('déjà un coockie')

      const refreshToken = cookies.jwt
      const foundToken = await User.findOne({refreshToken}).exec()
      //detect refresh token reuse!
      if (!foundToken) {
        console.log('attempted refresh token reuse at login!')
        //clear out ALL previous refresh tokens
        newRefreshTokenArray = []
      }
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      })
    }

    foundUser.refreshToken = [...newRefreshTokenArray, newRrefreshToken]
    const result = await foundUser.save()
    console.log(result)
    res.cookie('jwt', newRrefreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true, // disabled for thunderclient or postman on refresh route. Enable for chrome and production
      maxAge: 24 * 60 * 60 * 1000,
    })
    res.json({accessToken}) //store in memory in frontend (not localstorage or js cookie)
  } else {
    res.sendStatus(401)
  }
}
module.exports = {handleLogin}
