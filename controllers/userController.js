const {User,Email} = require('../util/model/User')
const nodemailer = require('nodemailer')
const userEmail = '2253353503@qq.com'
const random=require('string-random')
const transporter = nodemailer.createTransport({
  host:'smtp.qq.com',
  port: 465,
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'edosazeetaefebcj'  //这个是开启`POP3/SMTP/IMAP`的授权码
  }
})

const sendCode=async (ctx,next)=>{
    const {email}=ctx.request.body
    const reg=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
    if(!reg.test(email)){
        ctx.body={
            code:-2,
            message:'邮箱不正确'
        }
    }
    const usermail=await User.findOne({where:{email:email}})
    if(usermail){
        ctx.body={
            code:1,
            message:'邮箱已注册'
        }
    }
    else{
    const code=random(4,{letters:false})
    const mailOptions = {
        from: userEmail,
        cc: userEmail,
        to: email,
        subject: '验证码',
        text: '说明内容',
        html: '验证码：'+code+'  有效期为10分钟'
    }
    try {
        await Email.create({email:email,code:code,createtime:Date.now()})
        await transporter.sendMail(mailOptions)
        ctx.body = {
            code: 0,
            message: '邮箱验证码发送成功！'
        }
      } catch(e) {
        ctx.body = {
            code: -1,
            message: '邮箱验证码发送失败！'
        }
      }
    }
}

const register=async (ctx,next)=>{
    const {email,code,password,status}=ctx.request.body
    const usermail=await User.findOne({where:{email:email}})
    if(usermail){
        ctx.body={
            code:-1,
            message:'邮箱已注册'
        }
    }
    else{
        const mailCode=await Email.findOne({where:{email:email}})
        if(!mailCode){
            ctx.body={
                code:-2,
                message:'未发送验证码'
            }
        }
        const codetime=Date.now()-mailCode.createtime
        if(codetime>60*10*1000){
            await Email.destroy({where:{email:email}})
            ctx.body={
                code:0,
                message:'验证码已过期'
            }
        }
        else{
            if(code != mailCode.code){
                ctx.body={
                    code:1,
                    message:'验证码不正确'
                }
            }
            else{
                await User.create({email:email,password:password,status:status})
                await Email.destroy({where:{email:email}})
                ctx.body={
                    code:2,
                    message:'注册成功'
                }
            }
        }
    }
}

const login=async (ctx,next)=>{
    const {email,password,status}=ctx.request.body
    const reg=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
    if(!reg.test(email)){
        ctx.body={
            code:-2,
            message:'邮箱错误'
        }
    }
    else{
        const user=await User.findOne({attributes: ['email', 'password','status']},{where:{email:email}})
        if(!user){
            ctx.body={
                code:-1,
                message:'用户未注册'
            }
        }
        if(email===user.email && password===user.password){
            if(status===user.status){
                ctx.body={
                    code:0,
                    data:{
                        message:'登录成功',
                        email:user.email
                    }
                }
            }
            else{
                ctx.body={
                    code:1,
                    message:'身份不正确'
                }
            }
        }
        else{
            ctx.body={
                code:2,
                message:'邮箱或密码错误'
            }
        }
    }
}

const logout=async (ctx,next)=>{
    ctx.session = null
    ctx.response.redirect('/')
    ctx.body={
        code:1,
        message:'退出登录'
    }
}

module.exports={
    sendCode,
    register,
    login,
    logout
}