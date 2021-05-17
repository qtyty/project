const { sequelize } = require('../util/init')
const {room,arrange,admission}=require('../util/model/test')
const {contest}=require('../util/model/contest')
const Sequelize = require('sequelize')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const {applySingle,applyGroup,groupTeam}=require('../util/model/apply')


const addRoom=async (ctx,next)=>{
    const {name,address,number}=ctx.request.body
    const roomName=await room.findOne({where:{name:name}})
    if(roomName){
        ctx.body={
            code:1,
            data:{
                message:"考场已存在"
            }
        }
    }
    else{
    try{
        await room.create({name:name,address:address,number:number,status:'0'})
        ctx.body={
            code:0,
            data:{
                message:"新建成功"
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'新建失败'
            }
        }
    }
    }
}

const updateRoom=async (ctx,next)=>{
    const {rid,name,address,number}=ctx.request.body
    let Select={}
    if(name) Select['name']=name
    if(address) Select['address']=address
    if(number) Select['number']=number
    try{
        await room.update(Select,{where:{rid:rid}})
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


const deleteRoom=async (ctx,next)=>{
    const {rid}=ctx.request.body
    try{
        await room.destroy({where:{rid:rid}})
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

const showRoom=async (ctx,next)=>{
    /*
    let data=await room.findAll({attributes:['rid','name','address','number']})
    for(x of data){
        const Is=await arrange.findOne({where:{rid:x.rid}})
        if(Is) x['status']=1
        else x['status']=0
    }*/
    const data=await room.findAll()
    ctx.body={
        code:0,
        data
    }
}

const addArrange=async (ctx,next)=>{
    const {data}=ctx.request.body
    try{
        let Select=[]
        for(x of data){
            const data=await arrange.findAll({where:{rid:x.rid,cid:x.cid}})
            if(data){
                const rName=await room.findOne({where:{rid:x.rid},attributes:['name']})
                Select.push(rName.name)
            }
            else{
                await arrange.create({rid:x.rid,cid:x.cid,num:x.num})
                await room.update({status:'1'},{where:{rid:x.rid}})
            }
        }
        if(Select){
            str=Select.join(',')+'已安排'
            ctx.body={
                code:-1,
                data:{
                    message:str
                }
            }
        }
        else{
            ctx.body={
                code:0,
                data:{
                    message:'考场安排成功'
                }
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'考场安排失败'
            }
        }
    }
}

async function countSum(cid){
    const Cid=await contest.findOne({where:{cid:cid},attributes:['cid','type']})
    if(Cid.type=='single'){
        let count=await applySingle.findAll({where:{cid:cid},attributes:[[Sequelize.fn('count',sequelize.col('uid')),'uidCount']]})
        count=JSON.parse(JSON.stringify(count))
        //console.log(count)
        return count[0].uidCount
    }
    else if(Cid.type=='group'){
        let count=await applyGroup.findAll({where:{cid:cid},attributes:[[Sequelize.fn('count',sequelize.col('gid')),'gidCount']]})
        count=JSON.parse(JSON.stringify(count))
        //console.log(count)
        return count[0].gidCount
    }
}


const showArrange=async (ctx,next)=>{
    const {cid}=ctx.request.query
    let Select={}
    if(cid) Select['cid']=cid
    let data=await arrange.findAll({where:Select})
    data=JSON.parse(JSON.stringify(data))
    for(var x of data){
        let Number=await room.findOne({where:{rid:x.rid},attributes:['number','name','address']})
        Number=JSON.parse(JSON.stringify(Number))
        x['number']=Number.number
        let Cid=await contest.findOne({where:{cid:x.cid},attributes:['cid','name']})
        Cid=JSON.parse(JSON.stringify(Cid))
        x['cname']=Cid.name
        x['rName']=Number.address+Number.name
        const Sum=await countSum(x.cid)
        x['sum']=Sum
    }
    ctx.body={
        code:0,
        data
    }
}

const AvailableRoom=async (ctx,next)=>{
    /*
    const data=await sequelize.query('select rid,name,address,number from room where rid not in (select rid from arrange)',{
        //replacements:{},
        type:QueryTypes.SELECT
    })*/
    let data=await room.findAll({where:{status:'0'},attributes:['rid','name','address','number'],raw:true})
    for(x of data){
        x['rName']=x.address+x.name
        x['address']=undefined
        x['name']=undefined
    }
    ctx.body={
        code:0,
        data
    }
}

const cancelArrange=async (ctx,next)=>{
    const {id}=ctx.request.body
    try{
        for(x of id){
            const Rid=await arrange.findOne({where:{id:x},attributes:['rid']})
            await room.update({status:'0'},{where:{rid:Rid.rid}})
        }
        await arrange.destroy({where:{id:id}})
        ctx.body={
            code:0,
            data:{
                message:'取消成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'取消失败'
            }
        }
    }
}


const updateArrange=async (ctx,next)=>{
    const {id,rid,cid,num}=ctx.request.body
    let Select={}
    if(rid){
        Select['rid']=rid
        const Rid=await arrange.findOne({where:{id:id}})
        await room.update({status:"0"},{where:{rid:Rid.rid}})
        await room.update({status:"1"},{where:{rid:rid}})
    }
    if(cid) Select['cid']=cid
    if(num) Select['num']=num
    try{
        await arrange.update(Select,{where:{id:id}})
        ctx.body={
            code:0,
            data:{
                message:'修改考场安排成功'
            }
        }
    }catch(e){
        console.log(e)
        ctx.body={
            code:-1,
            data:{
                message:'修改考场安排失败'
            }
        }
    }
}

module.exports={
    addRoom,
    updateRoom,
    deleteRoom,
    showRoom,
    addArrange,
    showArrange,
    cancelArrange,
    updateArrange,
    AvailableRoom
}