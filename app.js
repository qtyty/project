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
             message: err.originalError ? err.originalError.message : err.message
         }
     } else {
         throw err;
     }
   })
})

app.use(cors())

const user=require('./controllers/userController')
const contest=require('./controllers/contestController')
const apply=require('./controllers/applyController')

router.get('/',ctx=>{ctx.body='hello'})
router.post('/user/sendCode',user.sendCode)
router.post('/user/register',user.register)
router.post('/user/login',user.login)
router.get('/user/logout',user.logout)
router.get('/user/showInfo',user.showInfo)
router.post('/user/updateInfo',user.updateInfo)
router.get('/user/showUniversity',user.showUniversity)
router.post('/user/teacher/TeacherNewUniversity',user.TeacherNewUniversity)

router.post('/user/newContest',contest.newContest)
router.get('/user/showContest',contest.showContest)
router.post('/user/updateContest',contest.updateContest)
router.post('/user/deleteContest',contest.deleteContest)
router.get('/user/showContestInfo',contest.showContestInfo)

router.get('/user/manager/showUniversityInfo',user.showUniversityInfo)
router.post('/user/manager/addUniversity',user.addUniversity)
router.post('/user/manager/updateUniversity',user.updateUniversity)
router.post('/user/manager/deleteUniversity',user.deleteUniversity)


router.get('/visitor/showContest',apply.showContest)
router.post('/user/applySingle',apply.singleApply)
router.post('/user/cancelSingle',apply.cancelSingle)
router.get('/user/showSingle',apply.showSingle)


router.post('/user/applyGroup',apply.groupApply)

app.use(bodyParser())
app.use(jwtKoa({secret:secret}).unless({
   path:[
      /^\/user\/sendCode/,
      /^\/user\/register/,
      /^\/user\/login/,
      /^\/visitor\/showContest/,
   ]
}))

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)