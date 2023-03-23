const express = require('express')
const router = express.Router()
const employeesController = require('../../controllers/employeesController')
// const verifyJWT = require('../../middleware/verifyJWT')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')

//router.get('/', employeesController.getAllEmployees)
//router.post('/', employeesController.createNewEmployee)
router
  .route('/')
  .get(/*verifyJWT,*/ employeesController.getAllEmployees)
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    employeesController.createNewEmployee
  )

router
  .route('/:id')
  .get(employeesController.getEmployee)
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    employeesController.updateEmployee
  )
  .delete(verifyRoles(ROLES_LIST.Admin), employeesController.deleteEmployee)

module.exports = router
