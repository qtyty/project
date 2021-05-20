const { sequelize } = require('../util/init')
const {applySingle,applyGroup,groupTeam}=require('../util/model/apply')
const {contest}=require('../util/model/contest')
const Sequelize = require('sequelize')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const {User,student,teacher,University,checkUniversity} = require('../util/model/User');
const {grade}=require('../util/model/Grade')
const XlSX = require('node-xlsx')
const XLSX=require('xlsx')
const Mock = require("mockjs")
const fs=require('fs')
const path = require('path');
const jwt = require('jsonwebtoken')
const downPath = path.resolve(__dirname, '../data')
const secret='secret'

const showGrade=async (ctx,next)=>{
    const {cid}=ctx.request.body
    let C=await contest.findOne({where:{cid:cid}})
    if(C.type=='single'){
        try{
            let data=await applySingle.findAll({where:{cid:cid,status:'1'},attributes:['id','uid','grade'],raw:true})
            //console.log(data)
            for(x of data){
                const S=await student.findOne({where:{sid:x.uid},attributes:['id','chineseName']})
                x['sid']=S.id
                x['name']=S.chineseName
                x['type']='single'
            }
            ctx.body={
                code:0,
                data
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
        try{
            let data=await applyGroup.findAll({where:{cid:cid,status:'1'},attributes:[['gid','id'],'groupName','tid','grade'],raw:true})
            for(x of data){
                const T=await teacher.findOne({where:{tid:x.tid},attributes:['chineseName']})
                x['tname']=T.chineseName
                x['type']='group'
                var members=[]
                const U=await groupTeam.findAll({where:{gid:x.id},attributes:['uid'],raw:true})
                for(y of U){
                    const S=await student.findOne({where:{sid:y.uid},attributes:['id','chineseName']})
                    members.push({'id':S.id,'name':S.chineseName})
                }
                //console.log(members)
                x['members']=members
            }
            ctx.body={
                code:0,
                data
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


const updateGrade=async (ctx,next)=>{
    const {id,type,grade}=ctx.request.body
    if(type=='single'){
        try{
            await applySingle.update({grade:grade},{where:{id:id}})
            ctx.body={
                code:0,
                data:{
                    message:'修改成功'
                }
            }
        }catch(e){
            console.error(e.message)
            ctx.body={
                code:-1,
                data:{
                    message:'修改失败'
                }
            }
        }
    }
    else if(type=='group'){
        try{
            await applyGroup.update({grade:grade},{where:{gid:id}})
            ctx.body={
                code:0,
                data:{
                    message:'修改成功'
                }
            }
        }catch(e){
            console.error(e.message)
            ctx.body={
                code:-1,
                data:{
                    message:'修改失败'
                }
            }
        }
    }
}

/*
function sheetToBuffer(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    let workbook = {
      SheetNames: [sheetName],
      Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    let wopts = {
      bookType: 'xlsx', // 要生成的文件类型
      type: 'buffer'
    };
    let wbout = XLSX.write(workbook, wopts);
    return wbout;
  }
  */

const showExecl=async (ctx,next)=>{
    const {cid}=ctx.request.query
    const Contest=await contest.findOne({where:{cid:cid},attributes:['name','type']})
    if(Contest.type=='single'){
        const headers=['序号','赛事名称','学号','姓名','成绩']
        let data=await applySingle.findAll({where:{cid:cid,status:'1'},attributes:['uid','id'],raw:true})
        for(x of data){
            const S=await student.findOne({where:{sid:x.uid},attributes:['chineseName','id']})
            x['name']=S.chineseName
            x['cname']=Contest.name
            x['sid']=S.id
            //x['uid']=undefined
        }
        //console.log(data)
        let _data=[headers]
        for(x of data){
            let d=[x.id,x.cname,x.sid,x.name,'']
            _data.push(d)
        }
        //console.log(_data)
        /*
        let sheet = XLSX.utils.aoa_to_sheet(_data)
        result = sheetToBuffer(sheet)
        const filename=Contest.name+'成绩模板.xlsx'
        //let buffer=XlSX.build([{name:data.name+'成绩模板',data:_data}])
        ctx.set("Content-Disposition", filename)
        ctx.body={
            code:0,
            result
        }*/
        console.log(_data)
        let buffer=XlSX.build([{name:'sheet1',data:_data}])
        let filename='./data/'+Contest.name+'成绩模板.xlsx'
        //fs.writeFileSync(filename,buffer)
        //ctx.set('Content-Type', 'application/octet-stream,charset=UTF-8')
        fs.writeFileSync(filename,buffer,'binary')
        let result=fs.readFileSync(filename)
        //console.log(Buffer.isBuffer(result))
        //ctx.body=fs.readFile(filename)
        let Data = Buffer.from(result)
        console.log(Data)
        //ctx.body=result
        ctx.body=Data
        ctx.set('Content-Type', 'application/octet-stream')
    }else if(Contest.type=='group'){
        const headers=['序号','赛事名称','团队名称','成绩']
        let data=await applyGroup.findAll({where:{cid:cid,status:'1'},attributes:['gid','groupName'],raw:true})
        for(x of data){
            x['cname']=Contest.name
        }
        let _data=[headers]
        for(x of data){
            let d=[x.gid,x.cname,x.groupName,'']
            _data.push(d)
        }
        let buffer=XlSX.build([{name:'sheet1',data:_data}])
        let filename='./data/'+Contest.name+'成绩模板.xlsx'
        //fs.writeFileSync(filename,buffer)
        //ctx.set('Content-Type', 'application/octet-stream,charset=UTF-8')
        let res=fs.writeFileSync(filename,buffer,'binary')
        ctx.body=fs.readFileSync(filename)
        ctx.set('Content-Type', 'application/octet-stream')
    }else{
        ctx.body={
            code:-1,
            data:{
                message:'失败'
            }
        }
    }
}


const addGrade=async (ctx,next)=>{
    //console.log(ctx.request.files.file)
    const file=ctx.request.files.file
    //console.log(file.path)
    const workbook=XLSX.readFile(file.path)
    const ext = file.name.split('.').pop()
    //console.log(ext)
    if(ext!='xlsx'){
        ctx.body={
            code:-2,
            data:{
                message:'文件后缀应为.xlsx'
            }
        }
    }
    else{
        const workbook=XLSX.readFile(file.path)
        let sheetNames = workbook.SheetNames
        let sheet = workbook.Sheets[sheetNames[0]] //通过表明得到表对象
        const data =XLSX.utils.sheet_to_json(sheet)
        console.log(data)
        try{
            for(x of data){
                let Cid=await contest.findOne({where:{name:x['赛事名称']},attributes:['cid','type']})
                if(Cid.type=='single'){
                    const Grade=x['成绩']
                    const id=x['序号']
                    await applySingle.update({grade:Grade},{where:{id:id,cid:Cid.cid,status:'1'}},(e)=>{console.error(e.message)})
                }
                else if(Cid.type=='group'){
                    const Grade=x['成绩']
                    const id=x['序号']
                    await applyGroup.update({grade:Grade},{where:{gid:id,cid:Cid.cid,status:'1'}},(e)=>{console.error(e.message)})
                }
            }
            ctx.body={
                code:0,
                data:{
                    message:'上传成功'
                }
            }
        }catch(e){
            console.error(e.message)
            ctx.body={
                code:-1,
                data:{
                    message:'文件内容错误'
                }
            }
        }
    }
}


const studentShowGrade=async (ctx,next)=>{
    const token=jwt.verify(ctx.headers.authorization.split(' ')[1],secret)
    const uid=token['uid']
    let data1=await applySingle.findAll({where:{uid:uid,status:'1'},attributes:['id','cid','grade'],raw:true})
    for(x of data1){
        const C=await contest.findOne({where:{cid:x.cid},attributes:['name']})
        x['name']=C.name
        x['cid']=undefined
    }
    let Gid=await groupTeam.findAll({where:{uid:uid},attributes:['gid'],raw:true})
    let Select=[]
    for(x of Gid){
        Select.push(x['gid'])
    }
    let data2=await applyGroup.findAll({where:{gid:Select,status:'1'},attributes:[['gid','id'],'grade','cid'],raw:true})
    for(x of data2){
        const C=await contest.findOne({where:{cid:x.cid},attributes:['name']})
        x['name']=C.name
        x['cid']=undefined
    }
    let data=data1.concat(data2)
    ctx.body={
        code:0,
        data
    }
}   


module.exports={
    showGrade,
    showExecl,
    addGrade,
    studentShowGrade,
    updateGrade
}