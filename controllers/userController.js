const {User,Email,University,checkUniversity} = require('../util/model/User')
const {checkTeacher,checkStudent}=require('../util/model/check')
const nodemailer = require('nodemailer')
const userEmail = '2253353503@qq.com'
const random=require('string-random')
const jwt = require('jsonwebtoken')
const secret='secret'
const Sequelize = require('sequelize');
const Op = Sequelize.Op
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
                        token:jwt.sign({uid:user.uid,email:email,password:password,status:status},secret,{expiresIn:'4h'})
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
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    //console.log(token)
    const uid=token['uid']
    const user=await User.findOne({where:{uid:uid}})
    const status=token['status']
    //console.log(status)
    var Select={}
    if(chineseName){
        Select['chineseName']=chineseName
    }
    else{
        Select['chineseName']=user.chineseName
    }

    if(englishName) {Select['englishName']=englishName}
    else{Select['englishName']=user.englishName}
    
    if(sex){Select['sex']=sex}
    else{Select['sex']=user.sex}

    if(school){Select['school']=school}
    else{Select['school']=user.school}
    
    if(year){Select['year']=year}
    else{Select['year']=user.year}
    
    if(id){Select['id']=id}
    else{Select['id']=user.id}
    
    if(phone){Select['phone']=phone}
    else{Select['phone']=user.phone}
    
    if(email){Select['email']=email}
    else{Select['email']=user.email}

    if(country){Select['country']=country}
    else{Select['country']=user.country}

    if(city){Select['city']=city}
    else{Select['city']=user.city}

    if(address){Select['address']=address}
    else{Select['address']=user.address}

    if(zipCode){Select['zipCode']=zipCode}
    else{Select['zipCode']=user.zipCode}

    if(qq){Select['qq']=qq}
    else{Select['qq']=user.qq}

    if(weChat){Select['weChat']=weChat}
    else{Select['weChat']=user.weChat}
    
    //console.log(Select)
    if(status=='student'){
    try{
        Select['uid']=uid
        await checkStudent.create(Select)
        ctx.body={
            code:0,
            data:{
                message:'修改成功,等待审核'
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
    else if(status=='teacher'){
        try{
            Select['uid']=uid
            await checkTeacher.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'修改成功,等待审核'
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
}

const showUniversity=async (ctx,next)=>{
    const data=await University.findAll({attributes: ['id','name']})
    //console.log(JSON.stringify(data))
    ctx.body={
        code:0,
        data
    }
}

const TeacherNewUniversity=async (ctx,next)=>{
    const {name,address}=ctx.request.body
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const user=await User.findOne({where:{uid:token.uid},attributes:['uid','chineseName','email','phone']})
    if(!name || !address){
        ctx.body={
            code:1,
            data:{
                message:'信息请填写完整'
            }
        }
    }
    else{
        const res=await University.findOne({where:{name:name}})
        if(res){
            ctx.body={
                code:2,
                data:{
                    message:'学校已存在'
                }
            }
        }
        else{
            let Select={'name':name,'address':address}
            //let Select={'chat':user.email,'name':name,'address':address}
            //if(user.chineseName) Select['charge']=user.chineseName
            try{
                await checkUniversity.create(Select)
                ctx.body={
                    code:0,
                    data:{
                        message:'新增学校成功,等待审核'
                    }
                }
            }catch(e){
                console.log(e)
                ctx.body={
                    code:-1,
                    data:{
                        message:'新增学校失败'
                    }
                }
            }
        }
    }
}



const showUniversityInfo=async (ctx,next)=>{
    const {name}=ctx.request.query
    let Select={}
    if(name) Select['name']={[Op.like]:'%'+name+'%'}
    const data=await University.findAll({attributes: ['id','name','charge','address'],where:Select})
    ctx.body={
        code:0,
        data
    }
}

const addUniversity=async (ctx,next)=>{
    const {name,address}=ctx.request.body
    if(!name || !address ){
        ctx.body={
            code:1,
            data:{
                message:'信息请填写完整'
            }
        }
    }
    else{
        const result=await University.findOne({where:{name:name}})
        if(result){
            ctx.body={
                code:2,
                data:{
                    message:'学校已存在'
                }
            }
        }
        else{
            try{
                await University.create({name:name,address:address})
                ctx.body={
                    code:0,
                    data:{
                        message:'新增学校成功'
                    }
                }
            }catch(e){
                console.log(e)
                ctx.body={
                    code:-1,
                    data:{
                        message:'新增学校失败'
                    }
                }
            }
        }
    }
}

const updateUniversity=async (ctx,next)=>{
    const {id,name,address,tid}=ctx.request.body
    let Select={}
    if(name) Select['name']=name
    if(address) Select['address']=address
    if(tid) Select['tid']=tid
    try{
        await University.update(Select,{where:{id:id}})
        ctx.body={
            code:0,
            data:{
                message:'修改成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'修改失败'
            }
        }
    }
}

const deleteUniversity=async (ctx,next)=>{
    const {id}=ctx.request.body
    //for(let x of id){
        try{
            await University.destroy({where:{id:id}})
            ctx.body={
                code:0,
                data:{
                    message:'删除成功'
                }
            }
        }catch(e){
            console.log(e)
            ctx.body={
                code:-1,
                data:{
                    message:'删除失败'
                }
            }
        }
    }
//}

const showCheckUn=async (ctx,next)=>{
    const data=await checkUniversity.findAll({attributes:['id','name','address']})
    ctx.body={
        code:0,
        data
    }
}

const checkTrue=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        for(x of id){
            const data=await checkUniversity.findOne({where:{id:x},attributes:['id','name','address']})
            await University.create({name:data.name,address:data.address})
            await checkUniversity.destroy({where:{id:x}})
        }
        ctx.body={
            code:0,
            data:{
                message:'成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}

const checkFalse=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        await checkUniversity.destroy({where:{id:id}})
        ctx.body={
            code:0,
            data:{
                message:'成功'
            }
        }
    }catch(e){
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}

const showCheckTeacher=async (ctx,next)=>{
    const data=await checkTeacher.findAll({
        attributes:[['ctid','tid'],'chineseName','englishName','sex','school','id','phone','email','country','city','address','zipCode','qq','weChat'
    ]})
    ctx.body={
        code:0,
        data
    }
}

const checkTeacherTrue=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        for(x of id){
            const data=await checkTeacher.findOne({where:{ctid:x},attributes:['uid','chineseName','englishName','sex','school','id','phone','email','country','city','address','zipCode','qq','weChat']})
            let Select={'chineseName':data.chineseName,'englishName':data.englishName,'sex':data.sex,'school':data.school,'id':data.id,'phone':data.phone,'email':data.email,'country':data.country,
                        'city':data.city,'address':data.address,'zipCode':data.zipCode,'qq':data.qq,'weChat':data.weChat}
            await User.update(Select,{where:{uid:data.uid}})
            await checkTeacher.destroy({where:{ctid:x}})
        }
        ctx.body={
            code:0,
            data:{
                message:'成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}

const checkTeacherFalse=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        await checkTeacher.destroy({where:{ctid:id}})
        ctx.body={
            code:0,
            data:{
                message:'成功'
            }
        }
    }catch(e){
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}


const showCheckStudent=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const teacher=await User.findOne({where:{uid:uid},attributes:['uid','school','status']})
    const data=await checkStudent.findAll({
        attributes:[['csid','uid'],'chineseName','englishName','sex','school','id','phone','email','country','city','address','zipCode','qq','weChat'
    ],where:{school:teacher.school}})
    ctx.body={
        code:0,
        data
    }
}


const checkStudentTrue=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        for(x of id){
            const data=await checkStudent.findOne({where:{csid:x},attributes:['uid','chineseName','englishName','sex','school','id','phone','email','country','city','address','zipCode','qq','weChat']})
            let Select={'chineseName':data.chineseName,'englishName':data.englishName,'sex':data.sex,'school':data.school,'id':data.id,'phone':data.phone,'email':data.email,'country':data.country,
                        'city':data.city,'address':data.address,'zipCode':data.zipCode,'qq':data.qq,'weChat':data.weChat}
            await User.update(Select,{where:{uid:data.uid}})
            await checkStudent.destroy({where:{csid:x}})
        }
        ctx.body={
            code:0,
            data:{
                message:'成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}


const checkStudentFalse=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        await checkStudent.destroy({where:{csid:id}})
        ctx.body={
            code:0,
            data:{
                message:'成功'
            }
        }
    }catch(e){
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}


const showStudent=async (ctx,next)=>{
    const emailtoken=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=emailtoken['uid']
    const school=await User.findOne({where:{uid:uid},attributes:['school','uid']})
    const data=await User.findAll({where:{status:'student',school:school.school},attributes:{exclude:['uid','status','password']}})
    ctx.body={
        code:0,
        data
    }
}


const showTeacher=async (ctx,next)=>{
    const {id}=ctx.request.query
    const school=await University.findOne({where:{id:id}})
    const data=await User.findAll({where:{school:school.name,status:'teacher'},attributes:[['uid','id'],['chineseName','name']]})
    ctx.body={
        code:0,
        data
    }
}
/*
const Isteacher=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const teacher=await User.findOne({where:{uid:uid},attributes:['uid','school','chineseName']})
    if(teacher.school){
        ctx.body={
            code:0,
            data:{
                message:'学校管理员'
            }
        }
    }
    else{
        ctx.body={
            code:0,
            data:{
                message:'普通教师'
            }
        }
    }
}
*/

module.exports={
    sendCode,
    register,
    login,
    showInfo,
    updateInfo,
    logout,
    TeacherNewUniversity,
    showUniversity,
    showUniversityInfo,
    addUniversity,
    updateUniversity,
    deleteUniversity,
    showCheckUn,
    checkTrue,
    checkFalse,
    showCheckTeacher,
    checkTeacherTrue,
    checkTeacherFalse,
    showCheckStudent,
    showCheckStudent,
    checkStudentTrue,
    checkStudentFalse,
    showStudent,
    showTeacher
}