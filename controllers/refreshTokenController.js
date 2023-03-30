const User = require('../model/User')
const jwt = require('jsonwebtoken')

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(401)

  const refreshToken = cookies.jwt
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  })
  const foundUser = await User.findOne({refreshToken}).exec() //search into refreshToken array as it was string

  // Detected refresh token reuse
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403) // Forbidden. Token can't be decrypt, essentially because expired
        console.log('attempted refresh reuse')
        const hackedUser = await User.findOne({
          username: decoded.username,
        }).exec()
        hackedUser.refreshToken = []
        const result = await hackedUser.save()
        console.log(result)
      }
    )
    return res.sendStatus(403) //Forbidden
  }

  //Remove old token
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  )

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        console.log('expired token')
        foundUser.refreshToken = [...newRefreshTokenArray]
        const result = await foundUser.save()
        console.log(result)
      }
      if (err || foundUser.username !== decoded.username)
        return res.sendStatus(403)

      // refreshToken exist and is still valid
      const roles = Object.values(foundUser.roles)

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decoded.username,
            roles,
          },
        },

        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30s'}
      )

      const newRefreshToken = jwt.sign(
        {
          username: foundUser.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
      )

      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
      const result = await foundUser.save()
      console.log(result)
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })

      res.json({roles, accessToken}) //eliminate the roles but need jwt on frontend to decode the access token and extract roles
    }
  )
}
module.exports = {handleRefreshToken}
