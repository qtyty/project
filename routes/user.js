let fs = require('fs');
const router=require('koa-router')()
var User = require('../controllers/UserController')

router.post('/sendCode',  User.sendCode);

module.exports ={router}
