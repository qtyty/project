const {User,student,teacher,University} = require('../util/model/User')
const {checkTeacher,checkStudent}=require('../util/model/check')
const nodemailer = require('nodemailer')
const userEmail = '2253353503@qq.com'
const random=require('string-random')
const jwt = require('jsonwebtoken')
const secret='secret'
const Sequelize = require('sequelize');
const Op = Sequelize.Op
var cache=require('memory-cache')
const e = require('express')
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
        //await Email.create({email:email,code:code,createtime:Date.now()})
        cache.put(email,code,10*60*1000)
        await transporter.sendMail(mailOptions)
        ctx.body = {
            code: 0,
            data:{
                message: '邮箱验证码发送成功！'
            }
        }
      } catch(e) {
        //throw new Error(e)
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
    if(!email || !password || !status){
        ctx.body={
            code:2,
            data:{
                message:'注册信息填写完整'
            }
        }
    }
    else{
    const usermail=await User.findOne({where:{email:email}})
    if(usermail){
        ctx.body={
            code:-2,
            data:{
                message:'邮箱已注册'
            }
        }
    }
    /*
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
    }*/
    
    else{
        if(!code){
            ctx.body={
                code:3,
                data:{
                    message:'请输入验证码'
                }
            }
        }
        else{
        Code=cache.get(email)
        if(!Code){
            ctx.body={
                code:-1,
                data:{
                    message:'验证码已过期'
                }
            }
        }
        else{
            if(Code==code){
                await User.create({email:email,password:password,status:status})
                ctx.body={
                    code:0,
                    data:{
                        message:'注册成功',
                        //token:jwt.sign({uid:uid,status:status},secret,{expiresIn:'4h'})
                    }
                }
            }
            else{
                ctx.body={
                    code:1,
                    data:{
                        message:'验证码不正确'
                    }
                }
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
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const Status=token['status']
    if(Status=='student'){
        const data=await student.findOne({where:{sid:uid},attributes:{exclude: ['sid','status']}})
        if(data){
            ctx.body={
                code:0,
                data
            }
        }
        else{
            const data=await User.findOne({where:{uid:uid},attributes: ['email','phone']})
            ctx.body={
                code:0,
                data
            }
        }
    }
    else if(Status=='teacher'){
        const data=await teacher.findOne({where:{tid:uid},attributes:{exclude: ['tid','status']}})
        if(data){
            ctx.body={
                code:0,
                data
            }
        }else{
            const data=await User.findOne({where:{uid:uid},attributes:['email','phone']})
            ctx.body={
                code:0,
                data
            }
        }
    }
}


//修改信息:(学校，year，id)都需审核
const updateInfo=async (ctx,next)=>{
    const {chineseName,englishName,sex,school,year,id,phone,email,country,city,address,zipCode,qq,weChat}=ctx.request.body
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const status=token['status']
    var Select={}
    if(chineseName){
        Select['chineseName']=chineseName
    }

    if(englishName) {Select['englishName']=englishName}
    
    if(sex){Select['sex']=sex}

    if(school){Select['school']=school}
    
    if(year){Select['year']=year}
    
    if(id){Select['id']=id}
    
    if(phone){Select['phone']=phone
             // userSelect['phone']=phone                
}
    
    if(email){Select['email']=email
              //userSelect['email']=email
}

    if(country){Select['country']=country}

    if(city){Select['city']=city}
    if(address){Select['address']=address}

    if(zipCode){Select['zipCode']=zipCode}
    if(qq){Select['qq']=qq}

    if(weChat){Select['weChat']=weChat}
    
    //console.log(Select)
    if(status=='student'){
        const User=await student.findOne({where:{sid:uid}})

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
    //const user=await teacher.findOne({where:{tid:token.uid}})
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
    let data=await University.findAll({attributes: ['id','name','tid','address'],where:Select})
    for(x of data){
        const Teacher=await teacher.findOne({where:{tid:x.tid},attributes:['chineseName']})
        x['tname']=Teacher.chineseName
        x['tid']=undefined
    }
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
    var data=await checkTeacher.findAll({
        attributes:[['ctid','tid'],'chineseName','englishName','sex','school','year','id','phone','email','country','city','address','zipCode','qq','weChat'
    ]})
    for(x of data){
        const School=await school.findOne({where:{id:x.school},attributes:['name']})
        x['school']=School.name
        if(x.sex=='male') x.sex='男'
        else if(x.sex=='female') x.sex='女'
    }
    ctx.body={
        code:0,
        data
    }
}

const checkTeacherTrue=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        for(x of id){
            const data=await checkTeacher.findOne({where:{ctid:x},attributes:['uid','chineseName','englishName','sex','year','school','id','phone','email','country','city','address','zipCode','qq','weChat']})
            let Select={'tid':data.uid,'chineseName':data.chineseName,'englishName':data.englishName,'sex':data.sex,'school':data.school,'year':data.year,'id':data.id,'phone':data.phone,'email':data.email,'country':data.country,
                        'city':data.city,'address':data.address,'zipCode':data.zipCode,'qq':data.qq,'weChat':data.weChat}
            let userSelect={'phone':data.phone,'email':data.email}
            await teacher.create(Select)
            await User.update(userSelect,{where:{uid:data.uid}})
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
    var data=await checkStudent.findAll({
        attributes:[['csid','uid'],'chineseName','englishName','sex','school','year','id','phone','email','country','city','address','zipCode','qq','weChat'
    ],where:{school:teacher.school}})
    for(x of data){
        const School=await school.findOne({where:{id:x.school},attributes:['name']})
        x['school']=School.name
        if(x.sex=='male') x.sex='男'
        else if(x.sex=='female') x.sex='女'
    }
    ctx.body={
        code:0,
        data
    }
}


const checkStudentTrue=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        for(x of id){
            const data=await checkStudent.findOne({where:{csid:x},attributes:['uid','chineseName','englishName','sex','year','school','id','phone','email','country','city','address','zipCode','qq','weChat']})
            let Select={'sid':data.uid,'chineseName':data.chineseName,'englishName':data.englishName,'sex':data.sex,'year':data.year,'school':data.school,'id':data.id,'phone':data.phone,'email':data.email,'country':data.country,
                        'city':data.city,'address':data.address,'zipCode':data.zipCode,'qq':data.qq,'weChat':data.weChat}
            let userSelect={'phone':data.phone,'email':data.email}
            await student.create(Select)
            await User.update(userSelect,{where:{uid:data.uid}})
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
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const sc=await teacher.findOne({where:{tid:uid},attributes:['school','tid']})
    let data=await student.findAll({where:{school:sc.school},attributes:{exclude:['uid']}})
    for(x of data){
        const School=await school.findOne({where:{id:sc.school},attributes:['name']})
        x.school=School.name
        if(x.sex=='male') x.sex='男'
        else if(x.sex=='female') x.sex='女'
    }
    ctx.body={
        code:0,
        data
    }
}


const showTeacher=async (ctx,next)=>{
    const {id}=ctx.request.query
    //const school=await University.findOne({where:{id:id}})
    const data=await teacher.findAll({where:{school:id},attributes:[['uid','id'],['chineseName','name']]})
    ctx.body={
        code:0,
        data
    }
}

const IsteacherCharge=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const user=await User.findOne({where:{uid:uid},attributes:['uid','school']})
    if(user.school!=null){
        const teacher=await University.findOne({where:{tid:uid}})
        if(teacher){
            ctx.body={
                code:0,
                message:'教师负责人'
            }
        }else{
            ctx.body={
                code:0,
                message:'普通教师'
            }
        }
    }else{
        ctx.body={
            code:0,
            message:'普通老师'
        }
    }
}



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
    showTeacher,
    IsteacherCharge
}