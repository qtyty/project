const { sequelize } = require('../util/init')
const {contest}=require('../util/model/contest')

const newContest=async (ctx,next)=>{
    const {name,type,isEqual,limit,startApp,endApp,startHold,endHold,rules,rewards,remark,publish}=ctx.request.body
    const ContestName=await contest.findOne(where:{name:name})
    if(ContestName){
        ctx.body={
            code:-1,
            data:{
                message:'比赛已存在'
            }
        }
    }
    if(type=='group'){
        if(!name || !startApp || !endApp || !startHold || !endHold || !rewards || !rules || !publish){
            ctx.body={
                code:-2,
                data:{
                    message:'信息请填写完整'
                }
            }
        }
        else if(publish==yes){
            await contest.create({name:name,type:type,startApp:startApp,endApp:endApp,rules:rules,rewards:rewards,remark:remark,status:'published'})
            ctx.body={
                code:0,
                data:{
                    message:'新建成功'
                }
            }
        }
        else if(publish==no){
            await contest.create({name:name,type:type,startApp:startApp,endApp:endApp,rules:rules,rewards:rewards,remark:remark,status:'ready'})
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
                    message:'publish错误 新建失败'
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
            await contest.create({name:name,type:type,isEqual:isEqual,limit:limit,startApp:startApp,endApp:endApp,rules:rules,rewards:rewards,remark:remark,status:'published'})
            ctx.body={
                code:0,
                data:{
                    message:'新建成功'
                }
            }
        }
        else if(publish==no){
            await contest.create({name:name,type:type,isEqual:isEqual,limit:limit,startApp:startApp,endApp:endApp,rules:rules,rewards:rewards,remark:remark,status:'ready'})
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
                    message:'publish错误 新建失败'
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
    contest={ContestName,state,type}=ctx.request.query
    let sql='select * from contests where 1=1'
    if(ContestName) sql+='and name=ContestName'
    if(state) sql+='and state=state'
    if(type) sql+='and type=type'
    const result=await sequelize.query(sql)
    if(result){
        ctx.body={
            code:0,
            data:{
                ContestName:result.name,
                type:result.name,
                startApp:result.startApp,
                endApp:result.endApp,
                startHold:result.startHold,
                endHold:result.endHold,
                address:result.address,
                state:result.state
            }
        }
    }
    else{
        ctx.body={
            code:1,
            data:{
                message:'无结果'
            }
        }
    }
}

const updateContest=async (ctx,next)=>{

}


module.exports={
    newContest
}