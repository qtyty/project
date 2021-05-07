const { sequelize } = require('../util/init')
const {applySingle,applyGroup,groupTeam}=require('../util/model/apply')
const {contest}=require('../util/model/contest')
const Sequelize = require('sequelize')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const {User,student,teacher,University,checkUniversity} = require('../util/model/User');
const {grade}=require('../util/model/Grade')


const showGrade=async (ctx,next)=>{
    const {cid}=ctx.request.body
    const Cid=await contest.findOne({where:{cid:cid},attributes:['type']})
    let data=await grade.findAll({where:{cid:cid},attributes:['aid','grade']})
    data=JSON.parse(JSON.stringify(data))
    if(Cid.type=='single'){
        try{
            for(x of data){
                const Id=await applySingle.findOne({where:{id:x.aid}})
                const Uid=await student.findOne({where:{sid:Id.uid},attributes:['id','chineseName']})
                x['id']=x.aid
                x['sid']=Uid.id
                x['sname']=Uid.chineseName
                x['aid']=undefined
            }
            ctx.body={
                code:0,
                data
            }
        }catch(e){
            console.log(e)
            ctx.body={
                code:-1,
                data:{
                    message:'查询错误'
                }
            }
        }
    }
    else if(Cid.type=='group'){
        try{
            for(x of data){
                const Gid=await applyGroup.findOne({where:{gid:x.aid}})
                const TeacherName=await teacher.findOne({where:{tid:Gid.tid},attributes:['chineseName','tid']})
                x['tname']=TeacherName['chineseName']
                var members=[]
                var Uid=await groupTeam.findAll({where:{gid:Gid.gid},attributes:['uid']})
                Uid=JSON.parse(JSON.stringify(Uid))
                for(i of Uid){
                    var user=await student.findOne({where:{sid:i.uid},attributes:['chineseName','englishName','sex','year','id','email','phone']})
                    user=JSON.parse(JSON.stringify(user))
                    if(user.sex=='male') user.sex='男'
                    else if(user.sex=='female') user.sex='女'
                    members.push(user)
                }
                //console.log(members)
                x['members']=members
                x['cid']=undefined
                x['tid']=undefined
            }
            ctx.body={
                code:0,
                data
            }
        }catch(e){
            console.log(e)
            ctx.body={
                code:-1,
                data:{
                    message:'查询错误'
                }
            }
        }
    }
    else{
        ctx.body={
            code:-2,
            data:{
                message:'cid错误'
            }
        }
    }
}


const updateSingle=async (ctx,next)=>{
    const {id,grade}=ctx.request.body
    try{
        await grade.update({grade:grade},{where:{aid:id}})
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





module.exports={
    showGrade
}