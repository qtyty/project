const { sequelize } = require('../util/init')
const {contest}=require('../util/model/contest')
const jwt = require('jsonwebtoken')
const secret='secret'

const newContest=async (ctx,next)=>{
    const {name,type,isEqual,limit,startApp,endApp,startHold,endHold,rules,rewards,remark,publish}=ctx.request.body
    const ContestName=await contest.findOne({where:{name:name}})
    if(ContestName){
        ctx.body={
            code:-1,
            data:{
                message:'比赛已存在'
            }
        }
    }
    if(type=='single'){
        if(!name || !startApp || !endApp || !startHold || !endHold || !rewards || !rules || !publish){
            ctx.body={
                code:-2,
                data:{
                    message:'信息请填写完整'
                }
            }
        }
        else if(publish==yes){
            let Select={'name':name,'type':type,'startApp':startApp,'endApp':endApp,'rules':rules,'rewards':rewards,'status':'published'}
            if(rewards) Select['rewards']=rewards
            await contest.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'新建成功'
                }
            }
        }
        else if(publish==no){
            let Select={'name':name,'type':type,'startApp':startApp,'endApp':endApp,'rules':rules,'rewards':rewards,'status':'ready'}
            if(rewards) Select['rewards']=rewards
            await contest.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'新建成功'
                }
            }
        }
        else{
            ctx.body={
                code:-4,
                data:{
                    message:'新建失败'
                }
            }
        }
    }
    else if(type=='group'){
        if(!name || !startApp || !endApp || !startHold || !endHold || !rewards || !rules || !publish || !isEqual || !limit){
            ctx.body={
                code:-2,
                data:{
                    message:'信息请填写完整'
                }
            }
        }
        else if(publish==yes){
            let Select={'name':name,'type':type,'isEqual':isEqual,'limit':limit,'startApp':startApp,'endApp':endApp,'rules':rules,'rewards':rewards,'status':'published'}
            if(rewards) Select['rewards']=rewards
            await contest.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'新建成功'
                }
            }
        }
        else if(publish==no){
            let Select={'name':name,'type':type,'isEqual':isEqual,'limit':limit,'startApp':startApp,'endApp':endApp,'rules':rules,'rewards':rewards,'status':'ready'}
            if(rewards) Select['rewards']=rewards
            await contest.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'新建成功'
                }
            }
        }
        else{
            ctx.body={
                code:-5,
                data:{
                    message:'新建失败'
                }
            }
        }
    }
    else{
        ctx.body={
            code:-3,
            data:{
                message:'新建失败'
            }
        }
    }
}

const showContest=async (ctx,next)=>{
    const {ContestName,state,type}=ctx.request.query
    Select={}
    if(ContestName) Select['ContestName']=ContestName
    if(state) Select['state']=state
    if(type) Select['type']=type
    const result=await contest.findAll({where:Select})
    if(result){

    }
    else{
        ctx.body={
            code:-1,
            data:{
                message:'无信息'
            }
        }
    }
}

const updateContest=async (ctx,next)=>{
    
}


module.exports={
    newContest
}