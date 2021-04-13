const { sequelize } = require('../util/init')
const {contest}=require('../util/model/contest')
const jwt = require('jsonwebtoken')
const secret='secret'
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const moment=require('moment')
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
    const data=await contest.findAll({where:Select,attributes:['cid','name','type',
    [Sequelize.fn('date_format',Sequelize.col('startApp'),'%Y-%m-%d'),'startApp'],
    [Sequelize.fn('date_format',Sequelize.col('endApp'),'%Y-%m-%d'),'endApp'],
    [Sequelize.fn('date_format',Sequelize.col('startHold'),'%Y-%m-%d'),'startHold'],
    [Sequelize.fn('date_format',Sequelize.col('endHold'),'%Y-%m-%d'),'endHold'],
    'state'
]})
    for(let x of data){
        if(x.state=='ready') x.state='未上线'
        else if(x.state=='published') x.state='已发布'
        else if(x.state=='finished') x.state='已结束'
        if(x.type=='single') x.type='个人赛'
        else if(x.type=='group') x.type='团队赛'
    }
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
    const {id,name,type,isEqual,limit,startApp,endApp,startHold,endHold,rules,rewards,remark,publish}=ctx.request.body
    const result=await contest.findOne({where:{cid:id}})
    let Select={}
    if(name) Select['name']=name
    /*
    if(type){
        if(type=='single') {Select['type']=type}
        else if(type=='group'){
            Select['type']=type
            if(isEqual) Select['isEqual']=isEqual
            if(limit) Select['limit']=limit
        }
    }
    */
    if(type) Select['type']=type
    if(isEqual) Select['isEqual']=isEqual
    if(limit) Select['limit']=limit
    if(startApp) Select['startApp']=startApp
    if(endApp) Select['endApp']=endApp
    if(startHold) Select['startHold']=startHold
    if(endHold) Select['endHold']=endHold
    if(rules) Select['rules']=rules
    if(remark) Select['remark']=remark
    if(rewards) Select['rewards']=rewards
    if(publish){
        if(publish=='yes') Select['state']='published'
        else if(publish=='no') Select['state']='ready'
    }

    try{
        await contest.update(Select,{where:{cid:id}})
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

const showContestInfo=async (ctx,next)=>{
    const {id}=ctx.request.query
    let data=await contest.findOne({where:{cid:id},attributes:['name','type','isEqual','limit',
    [Sequelize.fn('date_format',Sequelize.col('startApp'),'%Y-%m-%d'),'startApp'],
    [Sequelize.fn('date_format',Sequelize.col('endApp'),'%Y-%m-%d'),'endApp'],
    [Sequelize.fn('date_format',Sequelize.col('startHold'),'%Y-%m-%d'),'startHold'],
    [Sequelize.fn('date_format',Sequelize.col('endHold'),'%Y-%m-%d'),'endHold'],
    'rules','rewards','remark','state'
]})
    if(data.state=='ready') data.state='未上线'
    else if(data.state=='published') data.state='已发布'
    else if(data.state=='finished') data.state='已结束'
    if(data.type=='single') {
        data.type='个人赛'
        data.isEqual=undefined
        data.limit= undefined
        ctx.body={
            code:0,
            data
        }
    }
    else if(data.type=='group'){
        data.type='团队赛'
        ctx.body={
            code:0,
            data
        }
    }
}

module.exports={
    newContest,
    showContest,
    updateContest,
    deleteContest,
    showContestInfo
}