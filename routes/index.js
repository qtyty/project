const express=require('express')
const router=express.Router()
//const multer=require('multer')
const user=require('../controllers/indexController')

router.get('/',user.getUser)

module.exports=router