// const usersDB = {
//   users: require('../model/users.json'),
//   setUsers: function (data) {
//     this.users = data
//   },
// }
// const fsPromises = require('fs').promises
// const path = require('path')

const User = require('../model/User')

const bcrypt = require('bcrypt')

const handleNewUser = async (req, res) => {
  const {user, pwd} = req.body
  if (!user || !pwd) {
    return res.status(400).json({message: 'Username and password are required'})
  }
  //check for duplicate usernames in db
  //const duplicate = usersDB.users.find((person) => person.username === user)
  const duplicate = await User.findOne({username: user}).exec()

  if (duplicate) {
    return res.sendStatus(409) //Conflict
  }
  try {
    const hashedPwd = await bcrypt.hash(pwd, 10)
    // const newUser = {
    //   username: user,
    //   password: hashedPwd,
    //   roles: {
    //     User: 2023,
    //   },
    // }
    // usersDB.setUsers([...usersDB.users, newUser])
    // await fsPromises.writeFile(
    //   path.join(__dirname, '..', 'model', 'users.json'),
    //   JSON.stringify(usersDB.users)
    // )
    const result = await User.create({
      username: user,
      password: hashedPwd,
    })

    // const newUser = new User({
    //   username: user,
    //   password: hashedPwd,
    // })
    // const result = await newUser.save()
    console.log(result)

    res.status(201).json({success: `New user ${user} created!`})
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

module.exports = {handleNewUser}
