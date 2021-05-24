const {User,student,teacher,University,manager} = require('../util/model/User')
const nodemailer = require('nodemailer')
const userEmail = '2253353503@qq.com'
const random=require('string-random')
const jwt = require('jsonwebtoken')
const secret='secret'
const Sequelize = require('sequelize');
const Op = Sequelize.Op
var cache=require('memory-cache')
const { accessSync } = require('fs')
const bcrypt = require('bcrypt')

const transporter = nodemailer.createTransport({
  host:'smtp.qq.com',
  port: 465,
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'edosazeetaefebcj'  //这个是开启`POP3/SMTP/IMAP`的授权码
  }
})

async function Bcrypt(password){
    const salt = await bcrypt.genSalt(10)
    const result = await bcrypt.hash(password, salt)
    return result
}

async function passwordCompare(password,code){//明文，加密
    return await bcrypt.compare(password,code)
}

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
        
        await transporter.sendMail(mailOptions)
        cache.put(email,code,10*60*1000)
        console.log('验证码'+code)
        ctx.body = {
            code: 0,
            data:{
                message: '邮箱验证码发送成功！'
            }
        }
      } catch(e) {
        console.error(e.message)
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
                const code=await Bcrypt(password)
                await User.create({email:email,password:code,status:status})
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
        //if(email==user.email && password==user.password){
        if(email==user.email && await passwordCompare(password,user.password)){
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
        const data=await student.findOne({where:{sid:uid},attributes:{exclude: ['sid']}})
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
        const data=await teacher.findOne({where:{tid:uid},attributes:{exclude: ['tid']}})
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
    else if(Status=='manager'){
        const data=await manager.findOne({where:{mid:uid},attributes:{exclude:['mid']}})
        ctx.body={
            code:0,
            data
        }
    }
}


//修改信息:(学校，year，id)都需审核
const updateInfo=async (ctx,next)=>{
    const {chineseName,englishName,sex,school,year,id,phone,email,country,city,address,zipCode,qq,weChat}=ctx.request.body
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const status=token['status']
    //console.log(Select)
    var Select={}
    var UserSelect={}
    if(phone) UserSelect['phone']=phone
    if(email) UserSelect['email']=email
    Select['chineseName']=chineseName
    Select['englishName']=englishName
    Select['sex']=sex
    Select['school']=school
    Select['year']=year
    Select['id']=id
    Select['phone']=phone
    Select['email']=email
    Select['country']=country
    Select['city']=city
    Select['address']=address
    Select['zipCode']=zipCode
    Select['qq']=qq
    Select['weChat']=weChat
    if(status=='student'){
        const S=await student.findOne({where:{sid:uid}})
        if(S){
            if(S.status==1){
                try{
                    await student.update(Select,{where:{sid:uid}})
                    await User.update(UserSelect,{where:{uid:uid}})
                    ctx.body={
                        code:0,
                        data:{
                            message:'修改成功'
                        }
                    }
            }catch(e){
                ctx.body={
                    code:-1,
                    data:{
                        message:'修改失败'
                    }
                }
            }
        }
        
            else {
                try{
                    Select['status']=0
                    await student.update(Select,{where:{sid:uid}})
                    await User.update(UserSelect,{where:{uid:uid}})
                    ctx.body={
                        code:0,
                        data:{
                            message:'修改成功,等待审核'
                        }
                    }
            }catch(e){
                ctx.body={
                    code:-1,
                    data:{
                        message:'修改失败'
                    }
                }
            }
            }
    }
    else{
        try{
            Select['sid']=uid
            Select['status']=0
            await student.create(Select)
            await User.update(UserSelect,{where:{uid:uid}})
            ctx.body={
                code:0,
                data:{
                    message:'修改成功,等待审核'
                }
            }
    }catch(e){
        ctx.body={
            code:-1,
            data:{
                message:'修改失败'
            }
        }
    }
    }
    }
    else if(status=='teacher'){
        const T=await teacher.findOne({where:{tid:uid}})
        if(T){
            if(T.status==1){
                try{
                    await teacher.update(Select,{where:{tid:uid}})
                    await User.update(UserSelect,{where:{uid:uid}})
                    ctx.body={
                        code:0,
                        data:{
                            message:'修改成功'
                        }
                    }
            }catch(e){
                ctx.body={
                    code:-1,
                    data:{
                        message:'修改失败'
                    }
                }
        }}
        
        else{
            try{
                Select['status']=0
                await teacher.update(Select,{where:{tid:uid}})
                await User.update(UserSelect,{where:{uid:uid}})
                ctx.body={
                    code:0,
                    data:{
                        message:'修改成功,等待审核'
                    }
                }
        }catch(e){
            ctx.body={
                code:-1,
                data:{
                    message:'修改失败'
                }
            }
        }
        }
        }
    
    else{
        try{
            Select['tid']=uid
            Select['status']=0
            await teacher.create(Select)
            await User.update(UserSelect,{where:{uid:uid}})
            ctx.body={
                code:0,
                data:{
                    message:'修改成功,等待审核'
                }
            }
    }catch(e){
        ctx.body={
            code:-1,
            data:{
                message:'修改失败'
            }
        }
    }
    }
    }
    else if(status=='manager'){
        try{
            const M=await manager.findOne({where:{mid:uid}})
            if(M){
                await manager.update(Select,{where:{mid:uid}})
                await User.update({email:email,phone:phone},{where:{uid:uid}})
            }
            else{
                Select['mid']=uid
                await manager.create(Select)
                await User.update({email:email,phone:phone},{where:{uid:uid}})
            }
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
}

const showUniversity=async (ctx,next)=>{
    const data=await University.findAll({attributes: ['id','name'],where:{status:1}})
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
            let Select={'name':name,'address':address,status:0}
            //let Select={'chat':user.email,'name':name,'address':address}
            //if(user.chineseName) Select['charge']=user.chineseName
            try{
                await University.create(Select)
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
    let data=await University.findAll({attributes: ['id','name','address','status'],where:Select})
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
                await University.create({name:name,address:address,status:1})
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
    const {id,name,address}=ctx.request.body
    let Select={}
    if(name) Select['name']=name
    if(address) Select['address']=address
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
            let Select=[]
            for(x of id){
                //console.log(x)
                const S=await student.findOne({where:{school:x},attributes:['sid']})
                const T=await teacher.findOne({where:{school:x},attributes:['tid']})
                if(S || T){
                    const Name=await University.findOne({where:{id:x},attributes:['name']})
                    Select.push(Name.name)
                }
                else{
                    await University.destroy({where:{id:x}})
                }
            }
            //console.log(Select)
            if(Select.length>0){
                str=Select.join(',')
                ctx.body={
                    code:-1,
                    data:{
                        message:str+'已被选择，不能删除'
                    }
                }
            }
            else{
                ctx.body={
                    code:0,
                    data:{
                        message:'删除成功'
                    }
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
        await University.update({status:1},{where:{id:id}})
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
        let Select=[]
        for(x of id){
            //console.log(x)
            const S=await student.findOne({where:{school:x},attributes:['sid']})
            const T=await teacher.findOne({where:{school:x},attributes:['tid']})
            if(S || T){
                const Name=await University.findOne({where:{id:x},attributes:['name']})
                Select.push(Name.name)
            }
            else{
                await University.update({status:-1},{where:{id:x}})
            }
        }
        if(Select.length>0){
            str=Select.join(',')
            ctx.body={
                code:-1,
                data:{
                    message:str+'已被选择，不能修改'
                }
            }
        }
        else{
            ctx.body={
                code:0,
                data:{
                    message:'审核成功'
                }
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
    const {id}=ctx.request.query
    let Select={}
    if(id) Select['school']=id
    var data=await teacher.findAll({where:Select})
    for(x of data){
        const School=await University.findOne({where:{id:x.school},attributes:['name']})
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
        await teacher.update({status:1},{where:{tid:id}})
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
        await teacher.update({status:-1},{where:{tid:id}})
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
    const sc=await teacher.findOne({where:{tid:uid},attributes:['school','tid']})
    let data=await student.findAll({where:{school:sc.school}})
    for(x of data){
        const School=await University.findOne({where:{id:sc.school},attributes:['name']})
        x.school=School.name
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
        await student.update({status:1},{where:{sid:id}})
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
        await student.update({status:-1},{where:{sid:id}})
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
    let data=await student.findAll({where:{school:sc.school},attributes:{exclude:['sid']}})
    for(x of data){
        const School=await University.findOne({where:{id:sc.school},attributes:['name']})
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
    const data=await teacher.findAll({where:{school:id},attributes:[['tid','id'],['chineseName','name']]})
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