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
const test=require('./controllers/testController')
const grade=require('./controllers/gradeController')

router.get('/',ctx=>{ctx.body='hello'})
router.post('/user/sendCode',user.sendCode)
router.post('/user/register',user.register)
router.post('/user/login',user.login)
router.get('/user/logout',user.logout)
router.get('/user/showInfo',user.showInfo)
router.post('/user/updateInfo',user.updateInfo)
router.get('/user/showUniversity',user.showUniversity)
router.post('/user/teacher/newUniversity',user.TeacherNewUniversity)

router.post('/user/newContest',contest.newContest)
router.get('/user/showContest',contest.showContest)
router.post('/user/updateContest',contest.updateContest)
router.post('/user/deleteContest',contest.deleteContest)
router.get('/user/showContestInfo',contest.showContestInfo)

router.get('/user/manager/showUniversityInfo',user.showUniversityInfo)
router.post('/user/manager/addUniversity',user.addUniversity)
router.post('/user/manager/updateUniversity',user.updateUniversity)
router.post('/user/manager/deleteUniversity',user.deleteUniversity)

router.get('/user/manager/school/showCheckUn',user.showCheckUn)
router.post('/user/manager/school/checkTrue',user.checkTrue)
router.post('/user/manager/school/checkFalse',user.checkFalse)

router.get('/user/manager/teacher/showCheckTeacher',user.showCheckTeacher)
router.post('/user/manager/teacher/checkTeacherTrue',user.checkTeacherTrue)
router.post('/user/manager/teacher/checkTeacherFalse',user.checkTeacherFalse)

router.get('/user/teacher/showCheckStudent',user.showCheckStudent)
router.post('/user/teacher/checkStudentTrue',user.checkStudentTrue)
router.post('/user/teacher/checkStudentFalse',user.checkStudentFalse)

router.get('/user/teacher/showStudent',user.showStudent)
router.get('/user/manager/showTeacher',user.showTeacher)

router.get('/visitor/showContest',apply.showContest)
router.post('/user/applySingle',apply.singleApply)
router.post('/user/cancelContest',apply.cancelContest)
router.get('/user/showSingle',apply.showSingle)

router.get('/user/student/showApply',apply.studentShowApply)

router.get('/user/showTeacher',apply.showTeacher)
router.post('/user/applyGroup',apply.groupApply)
router.get('/user/showGroup',apply.showGroup)
router.post('/user/updateGroup',apply.updateGroup)

router.get('/user/manager/showContestIng',apply.showContestIng)
router.get('/user/manager/showApply',apply.showApply)


router.post('/user/manager/test/addRoom',test.addRoom)
router.post('/user/manager/test/updateRoom',test.updateRoom)
router.post('/user/manager/test/deleteRoom',test.deleteRoom)
router.get('/user/manager/test/showRoom',test.showRoom)


router.get('/user/manager/contest/showTotal',apply.countNumber)
router.post('/user/manager/test/addArrange',test.addArrange)
router.post('/user/manager/test/updateArrange',test.updateArrange)
router.post('/user/manager/test/cancelArrange',test.cancelArrange)
router.get('/user/manager/test/showArrange',test.showArrange)
router.get('/user/manager/test/availableRoom',test.AvailableRoom)


//router.get('/user/manager/apply/checkSingle',apply.checkSingle)
//router.get('/user/manager/apply/checkGroup',apply.checkGroup)
router.post('/user/manager/apply/checkSingleTrue',apply.checkSingleTrue)
router.post('/user/manager/apply/checkSingleFalse',apply.checkSingleFalse)
router.post('/user/manager/apply/checkGroupTrue',apply.checkGroupTrue)
router.post('/user/manager/apply/checkGroupFalse',apply.checkGroupFalse)

router.post('/user/manager/apply/checkApplyTrue',apply.checkApplyTrue)
router.post('/user/manager/apply/checkApplyFalse',apply.checkApplyFalse)

router.post('/user/manager/showGrade',grade.showGrade)

app.use(bodyParser())
app.use(jwtKoa({secret:secret}).unless({
   path:[
      /^\/user\/sendCode/,
      /^\/user\/register/,
      /^\/user\/login/,
      /^\/visitor\/showContest/,
      /^\/user\/showContestInfo/
   ]
}))

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)