const { sequelize } = require('../util/init')
const {contest}=require('../util/model/contest')
const jwt = require('jsonwebtoken')
const secret='secret'
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
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
    else{
    if(type=='single'){
        if(publish=='yes'){
            let Select={'name':name,'type':type,'startApp':startApp,'endApp':endApp,'startHold':startHold,'endHold':endHold,'rules':rules,'rewards':rewards,'state':'published'}
            if(remark) Select['remark']=remark
            await contest.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'新建成功,发布成功'
                }
            }
        }
        else if(publish=='no'){
            let Select={'name':name,'type':type,'startApp':startApp,'endApp':endApp,'startHold':startHold,'endHold':endHold,'rules':rules,'rewards':rewards,'state':'ready'}
            if(remark) Select['remark']=remark
            await contest.create(Select)
            ctx.body={
                code:1,
                data:{
                    message:'新建成功，存为草稿'
                }
            }
        }
        else{
            ctx.body={
                code:2,
                data:{
                    message:'新建失败'
                }
            }
        }
    }
    else if(type=='group'){
        if(publish=='yes'){
            let Select={'name':name,'type':type,'isEqual':isEqual,'limit':limit,'startApp':startApp,'endApp':endApp,'startHold':startHold,'endHold':endHold,'rules':rules,'rewards':rewards,'state':'published'}
            if(remark) Select['remark']=remark
            await contest.create(Select)
            ctx.body={
                code:0,
                data:{
                    message:'新建成功,发布成功'
                }
            }
        }
        else if(publish=='no'){
            let Select={'name':name,'type':type,'isEqual':isEqual,'limit':limit,'startApp':startApp,'endApp':endApp,'startHold':startHold,'endHold':endHold,'rules':rules,'rewards':rewards,'state':'ready'}
            if(remark) Select['remark']=remark
            await contest.create(Select)
            ctx.body={
                code:1,
                data:{
                    message:'新建成功,存为草稿'
                }
            }
        }
        else{
            ctx.body={
                code:2,
                data:{
                    message:'新建失败'
                }
            }
        }
    }
    else{
        ctx.body={
            code:2,
            data:{
                message:'新建失败'
            }
        }
    }
}
}

const showContest=async (ctx,next)=>{
    const {contestName,state,type}=ctx.request.query
    var Select={}
    if(contestName) Select['name']={[Op.like]:'%'+contestName+'%'}
    if(state) Select['state']=state
    if(type) Select['type']=type
    //console.log(Select)
    const data=await contest.findAll({attributes:['cid','name','type','startApp','endApp','startHold','endHold','state'],where:Select})
    if(data.length!=0){
        ctx.body={
            code:0,
            data
        }
    }
    else{
        ctx.body={
            code:-1,
            data:{
                message:'无结果'
            }
        }
    }
}

const updateContest=async (ctx,next)=>{
    const {cid,name,type,isEqual,limit,startApp,endApp,startHold,endHold,rules,rewards,remark,publish}=ctx.request.body
    const result=await contest.findOne({where:{cid:cid}})
    let Select={}
    if(name) Select['name']=name
    if(type){
        if(type=='single') {Select['type']=type}
        else if(type=='group'){
            Select['type']=type
            if(isEqual) Select['isEqual']=isEqual
            if(limit) Select['limit']=limit
        }
    }
    if(cid.type=='group'){
        if(isEqual) Select['isEqual']=isEqual
        if(limit) Select['limit']=limit
    }
    if(startApp) Select['startApp']=startApp
    if(endApp) Select['endApp']=endApp
    if(startHold) Select['startHold']=startHold
    if(endHold) Select['endHold']=endHold
    if(rules) Select['rewards']=rewards
    if(remark) Select['remark']=remark
    if(publish) Select['publish']=publish

    try{
        await contest.update(Select,{where:{cid:cid}})
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


const deleteContest=async (ctx,next)=>{
    const {id}=ctx.request.body
    //console.log(id)
    for(let x of id){
        //console.log(x)
        try{
            await contest.destroy({where:{cid:x}})
            ctx.body={
                code:0,
                data:{
                    message:'删除成功'
                }
            }
        }catch(e){
            ctx.body={
                code:-1,
                data:{
                    message:'删除失败'
                }
            }
        }
    }
}


module.exports={
    newContest,
    showContest,
    updateContest,
    deleteContest
}