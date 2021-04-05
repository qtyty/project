const Koa = require('koa')
const path=require('path')
const jwt=require('jsonwebtoken')
const jwtKoa=require('koa-jwt')
const session=require('koa-session')
const router=require('koa-router')()
const cors = require('koa-cors')
const bodyParser = require('koa-bodyparser')
const koaBody=require('koa-body')
const app = new Koa()
const secret='secret'

app.use((ctx,next)=>{
   return next().catch((err)=>{
      if (err.status === 401) {
         ctx.status = 401;
         ctx.body = {
             ok: false,
             msg: err.originalError ? err.originalError.message : err.message
         }
     } else {
         throw err;
     }
   })
})

app.use(cors())

const user=require('./controllers/userController')
const contest=require('./controllers/contestController')
router.get('/',ctx=>{ctx.body='hello'})
router.post('/user/sendCode',user.sendCode)
router.post('/user/register',user.register)
router.post('/user/login',user.login)
router.get('/user/logout',user.logout)
router.get('/user/showInfo',user.showInfo)
router.post('/user/updateInfo',user.updateInfo)
router.get('/user/showUniversity',user.showUniversity)
router.post('/user/newContest',contest.newContest)
router.get('/user/showContest',contest.showContest)
router.post('/user/deleteContest',contest.deleteContest)

app.use(bodyParser())
app.use(jwtKoa({secret:secret}).unless({
   path:[
      /^\/user\/sendCode/,
      /^\/user\/register/,
      /^\/user\/login/
   ]
}))
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000);