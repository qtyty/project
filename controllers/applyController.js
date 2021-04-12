const { sequelize } = require('../util/init')
const {applySingle}=require('../util/model/apply')
const {contest}=require('../util/model/contest')
const Sequelize = require('sequelize')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const jwt = require('jsonwebtoken')
const secret='secret'
const datetime=require('silly-datetime')
const date = datetime.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
const {User,Email,University} = require('../util/model/User')

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

module.exports={
    showContest,
    singleApply,
    cancelSingle,
    showSingle,
}