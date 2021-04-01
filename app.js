const Koa = require('koa')
const session=require('koa-session')
const router=require('koa-router')()
const cors = require('koa-cors')
const bodyParser = require('koa-bodyparser')
const app = new Koa()

app.keys = ['some secret hurr'];
const CONFIG = {
   key: 'koa:sess',   //cookie key (default is koa:sess)
   maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
   overwrite: true,  //是否可以overwrite    (默认default true)
   httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
   signed: true,   //签名默认true
   rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
   renew: false,  //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));
app.use(cors())

const user=require('./controllers/userController')
router.get('/',ctx=>{ctx.body='hello'})
router.post('/user/sendCode',user.sendCode)
router.post('/user/register',user.register)
router.post('/user/login',user.login)

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000);