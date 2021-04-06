const {User,Email,University} = require('../util/model/User')
const nodemailer = require('nodemailer')
const userEmail = '2253353503@qq.com'
const random=require('string-random')
const jwt = require('jsonwebtoken')
const secret='secret'
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
            data:{
                message:'邮箱不正确'
            }
        }
    }
    const usermail=await User.findOne({where:{email:email}})
    if(usermail){
        ctx.body={
            code:1,
            data:{
                message:'邮箱已注册'
            }
        }
    }
    else{
    const code=random(4,{letters:false})
    const mailOptions = {
        from: userEmail,
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
            data:{
                message: '邮箱验证码发送成功！'
            }
        }
      } catch(e) {
        throw new Error(e)
        ctx.body = {
            code: -1,
            data:{
                message: '邮箱验证码发送失败！'
            }
        }
      }
    }
}

const register=async (ctx,next)=>{
    const {email,code,password,status}=ctx.request.body
    const usermail=await User.findOne({where:{email:email}})
    if(usermail){
        ctx.body={
            code:-2,
            data:{
                message:'邮箱已注册'
            }
        }
    }
    else{
        const mailCode=await Email.findOne({where:{email:email}})
        if(!mailCode){
            ctx.body={
                code:-1,
                data:{
                    message:'未发送验证码'
                }
            }
        }
        const codetime=Date.now()-mailCode.createtime
        if(codetime>60*10*1000){
            await Email.destroy({where:{email:email}})
            ctx.body={
                code:2,
                data:{
                    message:'验证码已过期'
                }
            }
        }
        else{
            if(code != mailCode.code){
                ctx.body={
                    code:1,
                    data:{
                        message:'验证码不正确'
                    }
                }
            }
            else{
                await User.create({email:email,password:password,status:status})
                const uid=User.findOne({where:{email:email}})
                await Email.destroy({where:{email:email}})
                ctx.body={
                    code:0,
                    data:{
                        message:'注册成功',
                        //token:jwt.sign({uid:uid,status:status},secret,{expiresIn:'4h'})
                    }
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
        const user=await User.findOne({attributes: ['uid','email', 'password','status'],where:{email:email}})
        if(!user){
            ctx.body={
                code:-1,
                message:'用户未注册'
            }
        }
        else{
        if(email==user.email && password==user.password){
            if(status==user.status){
                ctx.body={
                    code:0,
                    data:{
                        message:'登录成功',
                        token:jwt.sign({uid:user.uid,status:status},secret,{expiresIn:'4h'})
                    }
                }
            }
            else{
                ctx.body={
                    code:2,
                    message:'身份不正确'
                }
            }
        }
        else{
            ctx.body={
                code:1,
                message:'邮箱或密码错误'
            }
        }
    }
}
}

const logout=async (ctx,next)=>{
    try{
    ctx.headers.authorization=null
    ctx.body={
        code:1,
        message:'退出登录成功'
    }
}catch(e){
    throw new Error(e)
}
}


const showInfo=async (ctx,next)=>{
    const emailtoken=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const email=emailtoken['uid']
    const result=await User.findOne({where:{uid:email}})
    ctx.body={
        code:0,
        data:{
            chineseName:result.chineseName,
            englishName:result.englishName,
            sex:result.sex,
            school:result.school,
            year:result.year,
            id:result.id,
            phone:result.phone,
            email:result.email,
            country:result.country,
            city:result.city,
            address:result.address,
            zipCode:result.zipCode,
            qq:result.qq,
            weChat:result.weChat
        }
    }
}


const updateInfo=async (ctx,next)=>{
    const {chineseName,englishName,sex,school,year,id,phone,email,country,city,address,zipCode,qq,weChat}=ctx.request.body
    const emailtoken=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=emailtoken['uid']
    let Select={}
    if(chineseName) Select['chineseName']=chineseName
    if(englishName) Select['englishName']=englishName
    if(sex) Select['sex']=sex
    if(school) Select['school']=school
    if(year) Select['year']=year
    if(id) Select['id']=id
    if(phone) Select['phone']=phone
    if(email) Select['email']=email
    if(country) Select['country']=country
    if(city) Select['city']=city
    if(address) Select['address']=address
    if(zipCode) Select['zipCode']=zipCode
    if(qq) Select['qq']=qq
    if(weChat) Select['weChat']=weChat

    try{
        await User.update(Select,{where:{uid:uid}})
        ctx.body={
            code:0,
            data:{
                message:'修改成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:1,
            data:{
                message:'修改失败'
            }
        }
    }

}


const showUniversity=async (ctx,next)=>{
    const data=await University.findAll({attributes: ['id','name']})
    //console.log(JSON.stringify(data))
    ctx.body={
        code:0,
        data
    }
}


module.exports={
    sendCode,
    register,
    login,
    showInfo,
    updateInfo,
    logout,
    showUniversity
}