const User = require('../model/User')

const handleLogout = async (req, res) => {
  //On client, alos delete the accessToken
  const cookies = req.cookies
  if (!cookies?.jwt) {
    console.log('No cookie or jwt key')
    return res.sendStatus(204)
  } //Successfull but no content
  const refreshToken = cookies.jwt

  const foundUser = await User.findOne({refreshToken}).exec()
  if (!foundUser) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    })
    return res.sendStatus(204)
  }

  //delete refreshToken in db
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  )
  //foundUser.refreshToken = '';
  const result = await foundUser.save()
  console.log(result)
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  })
  res.sendStatus(204)
}
module.exports = {handleLogout}
