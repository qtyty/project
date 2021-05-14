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
const downPath = path.resolve(__dirname, '../data');
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
        const headers=['序号','赛事名称','姓名','成绩']
        let data=await applySingle.findAll({where:{cid:cid,status:'1'},attributes:['uid','id'],raw:true})
        for(x of data){
            const S=await student.findOne({where:{sid:x.uid},attributes:['chineseName']})
            x['name']=S.chineseName
            x['cname']=Contest.name
            //x['uid']=undefined
        }
        //console.log(data)
        let _data=[headers]
        for(x of data){
            let d=[x.id,x.cname,x.name,'']
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
        let buffer=XlSX.build([{name:'sheet1',data:_data}])
        //let filename=Contest.name+'成绩模板.xlsx'
        //fs.writeFileSync(filename,buffer)
        ctx.body={
            code:0,
            buffer
        }
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
        ctx.body={
            code:0,
            buffer
        }
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
                let Cid=await contest.findOne({where:{name:x['赛事名称']},attributes:['cid']})
                let cid=Cid.cid
                let aid=x['序号']
                let Grade=x['成绩']
                await grade.create({cid:cid,aid:aid,grade:Grade})
            }
            ctx.body={
                code:0,
                data:{
                    message:'操作成功'
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

module.exports={
    showGrade,
    showExecl,
    addGrade
}