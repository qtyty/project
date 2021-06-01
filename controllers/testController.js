const { sequelize } = require('../util/init')
const {room,arrange,admission}=require('../util/model/test')
const {contest}=require('../util/model/contest')
const Sequelize = require('sequelize')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const {applySingle,applyGroup,groupTeam}=require('../util/model/apply');
const {User,student,teacher,University,manager} = require('../util/model/User')
const jwt = require('jsonwebtoken')
const secret='secret'

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
            Select.push(x.rid)
        }
        if(new Set(Select).size!=data.length){
            ctx.body={
                code:-1,
                data:{
                    message:'考场不能相同'
                }
            }
        }
        else{
            for(x of data){
                await arrange.create({rid:x.rid,cid:x.cid,num:x.num})
                await room.update({status:'1'},{where:{rid:x.rid}})
            }
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

const createAdmission=async (ctx,next)=>{
    const {cid}=ctx.request.body
    try{
        await admission.destroy({where:{cid:cid}})
    }catch(e){
        console.error(e.message)
        ctx.body={
            code:-1,
            data:{
                message:'重新生成失败'
            }
        }
    }
    const Arrange=await arrange.findAll({where:{cid:cid},attributes:['rid','num'],raw:true})
    let availRid=[]
    for(x of Arrange){
        availRid.push(x.rid)
    }
    //console.log(availRid)
    const Contest=await contest.findOne({where:{cid:cid},attributes:['type']})
    let availUser=[]
    if(Contest.type=='single'){
        const S=await applySingle.findAll({where:{cid:cid,status:'1'},attributes:['uid'],raw:true})
        for(x of S){
            availUser.push(x.uid)
        }
    }else if(Contest.type=='group'){
        const S=await applyGroup.findAll({where:{cid:cid,status:'1'},attributes:['gid'],raw:true})
        for(x of S){
            availUser.push(x.gid)
        }
    }
    //console.log(availUser)
    //console.log(Arrange.length)
    i=0
    j=0
    while(i<Arrange.length){
        if(j==Arrange[i].num){
            i+=1
            j=0
        }
        else if(availUser.length==0){
            break
        }
        else{
            var index = Math.floor((Math.random()*availUser.length))
            let User=availUser[index]
            availUser.splice(index,1)
            //console.log(availUser)
            try{
                let code=cid.toString()+Arrange[i].rid.toString()+(j+1).toString()+User.toString()
                await admission.create({uid:User,cid:cid,rid:Arrange[i].rid,seat:j+1,admissionNumber:code})
                j+=1
            }catch(e){
                console.error(e.message)
                ctx.body={
                    code:-1,
                    data:{
                        message:'生成失败'
                    }
                }
            }
        }
    }
    ctx.body={
        code:0,
        data:{
            message:'生成成功'
        }
    }
}

const showAdm=async (ctx,next)=>{
    const {cid}=ctx.request.query
    const Contest=await contest.findOne({where:{cid:cid},attributes:['type']})
    if(Contest.type=='single'){
        let data=await admission.findAll({where:{cid:cid},attributes:['uid','rid','seat','admissionNumber'],raw:true})
        for(x of data){
            const Room=await room.findOne({where:{rid:x.rid},attributes:['name','address']})
            x['name']=Room.name
            x['address']=Room.address
            const Uid=await student.findOne({where:{sid:x.uid},attributes:['chineseName']})
            x['sname']=Uid.chineseName
        }
        ctx.body={
            code:0,
            data
        }
    }else if(Contest.type=='group'){
        let data=await admission.findAll({where:{cid:cid},attributes:['uid','rid','seat','admissionNumber'],raw:true})
        for(x of data){
            const Room=await room.findOne({where:{rid:x.rid},attributes:['name','address']})
            x['name']=Room.name
            x['address']=Room.address
            const Group=await applyGroup.findOne({where:{gid:x.uid},attributes:['groupName']})
            x['gName']=Group.groupName
        }
        ctx.body={
            code:0,
            data
        }
    }
}

const studentShowAdm=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    const {cid}=ctx.request.query
    const C=await contest.findOne({where:{cid:cid},attributes:['type','name']})
    if(C.type=='single'){
        try{
            var Uid=uid
            let Arrange=await arrange.findAll({where:{cid:cid},attributes:['rid'],raw:true})
            if(Arrange.length>0){
                let data1=await student.findOne({where:{sid:Uid},attributes:{exclude:['sid']},raw:true})
                let data=await admission.findOne({where:{uid:Uid,cid:cid},attributes:['rid','seat','admissionNumber'],raw:true})
                if(data){
                    const Room=await room.findOne({where:{rid:data.rid},attributes:['name','address']})
                   // if(Room){
                        data['rName']=Room.address+Room.name
                        data['rid']=undefined
                        data['cname']=C.name
                        data['type']='个人赛'
                        let School=await University.findOne({where:{id:data1.school},attributes:['name']})
                        data1['school']=School.name
                        //console.log(data)
                        //console.log(data1)
                        result=Object.assign(data,data1)
                        ctx.body={
                            code:0,
                            result
                        }
                    //}
                    // else{
                    //     ctx.body={
                    //         code:-1,
                    //         data:{
                    //             message:'管理员未安排考场'
                    //         }
                    //     }
                    // } 
                }else{
                    ctx.body={
                        code:-1,
                        data:{
                            message:'管理员未生成准考证'
                        }
                    }
                }
            } else{
                ctx.body={
                    code:-1,
                    data:{
                        message:'管理员未安排考场'
                    }
                }
            }
        }catch(e){
            console.error(e.message)
            ctx.body={
                code:-1,
                data:{
                    message:'查询错误'
                }
            }
        }
    }else if(C.type=='group'){
        const Gid=await sequelize.query('select a.gid from applygroup a,groupteam b where a.gid=b.gid and b.uid= :uid and a.cid= :cid',{
            replacements:{cid:cid,uid:uid},
            type:QueryTypes.SELECT
        })
        var Uid=Gid[0].gid
        try{
            let Arrange=await arrange.findAll({where:{cid:cid},attributes:['rid'],raw:true})
           // console.log(Arrange)
            if(Arrange.length>0){
                let data=await admission.findOne({where:{uid:Uid,cid:cid},attributes:['rid','seat','admissionNumber'],raw:true})
                if(data){
                    const Room=await room.findOne({where:{rid:data.rid},attributes:['name','address']})
                    //if(Room){
                        data['rName']=Room.address+Room.name
                        data['rid']=undefined
                        data['cname']=C.name
                        data['type']='团队赛'
                        let data1=await applyGroup.findOne({where:{gid:Uid},raw:true,attributes:{exclude:['suid','grade']},raw:true})
                        const Teacher=await teacher.findOne({where:{tid:data1.tid},attributes:['chineseName']})
                        data1['tname']=Teacher.chineseName
                        let members=await groupTeam.findAll({where:{gid:Uid},raw:true,attributes:['uid']})
                        let Select=[]
                        for(x of members){
                            let data2=await student.findOne({where:{sid:x.uid},attributes:{exclude:['sid']},raw:true})
                            const School=await University.findOne({where:{id:data2.school},attributes:['name']})
                            data2['school']=School.name
                            Select.push(data2)
                        }
                        data1['members']=Select
                        //console.log(data)
                        //console.log(data1)
                        result=Object.assign(data,data1)
                        ctx.body={
                            code:0,
                            result
                        }
                    // }else{
                    //     ctx.body={
                    //         code:-1,
                    //         data:{
                    //             message:'管理员未安排考场'
                    //         }
                    //     }
                    // }
                }else{
                    ctx.body={
                        code:-1,
                        data:{
                            message:'管理员未生成准考证'
                        }
                    }
                }
            }else{
                ctx.body={
                    code:-1,
                    data:{
                        message:'管理员未安排考场'
                    }
                }
            }
        }catch(e){
            console.error(e.message)
            ctx.body={
                code:-1,
                data:{
                    message:'查询错误'
                }
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
    AvailableRoom,
    createAdmission,
    showAdm,
    studentShowAdm
}