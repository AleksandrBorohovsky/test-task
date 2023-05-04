const Router = require('express')
const router = new Router()
const userController = require('../controller/userController')
const auth = require('../middleware/auth')
const upload = require('../middleware/img')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/info', auth , userController.info)
router.patch('/update', auth , userController.update)
router.delete('/delete', auth, userController.delete)
router.post('/img', auth, upload ,userController.image)
router.get('/users', userController.allUsers)
router.post('/pdf', auth, userController.createPdf)

module.exports = router