const { sequelize } = require('../util/init')
const {applySingle,applyGroup,groupTeam}=require('../util/model/apply')
const {contest}=require('../util/model/contest')
const Sequelize = require('sequelize')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const jwt = require('jsonwebtoken')
const secret='secret'
const datetime=require('silly-datetime')
const date = datetime.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
const {User,Email,University} = require('../util/model/User');
const cookieParser = require('cookie-parser');

const showContest=async (ctx,next)=>{
    const data=await contest.findAll({attributes:['cid','name','type',
    [Sequelize.fn('date_format',Sequelize.col('startApp'),'%Y-%m-%d'),'startApp'],
    [Sequelize.fn('date_format',Sequelize.col('endApp'),'%Y-%m-%d'),'endApp'],
    [Sequelize.fn('date_format',Sequelize.col('startHold'),'%Y-%m-%d'),'startHold'],
    [Sequelize.fn('date_format',Sequelize.col('endHold'),'%Y-%m-%d'),'endHold'],
    'remark'],where:{state:'published', startApp:{[Op.lte]:date},endApp:{[Op.gte]:date}}})

    for(x of data){
        if(x.remark){
            x.remark=x.remark.substr(0,20)
        }
        else{
            x.remark=undefined
        }
        if(x.type=='single') x.type='个人赛'
        else if(x.type=='group') x.type='团队赛'
    }
    ctx.body={
        code:0,
        data,
    }
}

async function checkInfo(uid){
    const user=await User.findOne({where:{uid:uid},attributes:['chineseName','englishName','school']})
    if(!user.school || (!user.chineseName && !user.englishName)){
        return true
    }
    else{
        return false
    }
}

const singleApply=async (ctx,next)=>{
    const {cid}=ctx.request.body
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const check=await checkInfo(uid)
    if(check==true){
        ctx.body={
            code:1,
            data:{
                message:'请先将姓名和学校信息填写完整'
            }
        }
    }else{
        try{
            await applySingle.create({uid:uid,cid:cid})
            ctx.body={
                code:0,
                data:{
                    message:'报名成功'
                }
            }
        }catch(e){
            console.log(e)
            ctx.body={
                code:-1,
                data:{
                    message:'报名失败'
                }
            }
        }
    }
}


const cancelSingle=async (ctx,next)=>{
    const {cid}=ctx.request.body
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    try{
        await applySingle.destroy({where:{uid:uid,cid:cid}})
        ctx.body={
            code:0,
            data:{
                message:'成功取消报名'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'取消报名失败'
            }
        }
    }
}

const showSingle=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const data=await sequelize.query('select contest.cid,contest.name from contest where cid in (select cid from applySingle where uid= :uid)', {
        replacements:{uid:uid},
        type: QueryTypes.SELECT
      })
    ctx.body={
        code:0,
        data
    }
}

const groupApply=async (ctx,next)=>{
    const {cid,groupName,tid,members}=ctx.request.body
    let Select=[]
    try{
        for(x of members){
            const user=await User.findOne({where:{id:x.id,chineseName:x.name},attributes:['uid']})
            Select.push(user.uid)
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'用户信息错误'
            }
        }
    }
    try{
        await applyGroup.create({cid:cid,groupName:groupName,tid:tid})
    }catch(e){
        console.log(e)
        ctx.body={
            code:1,
            data:{
                message:'报名失败'
            }
        }
    }
    try{
        const gid=await applyGroup.findOne({where:{cid:cid,groupName:groupName,tid:tid}})
        console.log(Select)
        console.log(gid)
        for(x of Select){
            await groupTeam.create({gid:gid.gid,uid:x})
        }
        ctx.body={
            code:0,
            data:{
                message:'报名成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:1,
            data:{
                message:'报名失败'
            }
        }
    }
}

const showGroup=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const gid=await sequelize.query('select distinct groupTeam.gid from groupTeam where uid= :uid', {
        replacements:{uid:uid},
        type: QueryTypes.SELECT
      })
    let Gid=[]
    for(x of gid){
        Gid.push(x.gid)
    }
    var data=await sequelize.query('select gid,cid,groupName,tid from applyGroup where gid in (:Gid)', {
        replacements:{Gid:Gid},
        type: QueryTypes.SELECT
      })
    //console.log(data)
    for(x of data){
        const name=await sequelize.query('select cid,name from contest where cid= :cid', {
            replacements:{cid:x.cid},
            type: QueryTypes.SELECT
          })
        console.log(name)
        x['name']=name[0].name
        const tname=await User.findOne({where:{uid:x.tid},attributes:['chineseName','uid']})
        x['tname']=tname.chineseName
        const member=await sequelize.query('select user.id as id,user.chineseName as name from user,groupTeam where (user.uid=groupTeam.uid and groupTeam.gid= :gid)',{
            replacements:{gid:x.gid},
            type:QueryTypes.SELECT
        })
        x['members']=member
    }
    ctx.body={
        code:0,
        data
    }
}

const showTeacher=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const school=await User.findOne({where:{uid:uid},attributes:['school']})
    const data=await User.findAll({where:{school:school.school,status:'teacher'},attributes:[['uid','id'],['chineseName','name']]})
    ctx.body={
        code:0,
        data
    }
}


module.exports={
    showContest,
    singleApply,
    cancelSingle,
    showSingle,
    groupApply,
    showTeacher,
    showGroup
}