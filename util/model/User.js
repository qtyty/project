// 导入创建模型需要的函数
const { FailedDependency } = require('http-errors')
const {Sequelize,sequelize} = require('../init')
const bcrypt = require('bcrypt')
async function Bcrypt(password){
    const salt = await bcrypt.genSalt(10)
    const result = await bcrypt.hash(password, salt)
    return result
}

const User=sequelize.define('User',{
    uid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    email:{type:Sequelize.STRING},
    password:{type:Sequelize.STRING},
    phone:{type:Sequelize.STRING},
    status:{type:Sequelize.STRING}
},{
    timestamps: false,
    freezeTableName: true
  })


const student=sequelize.define('student',{
    sid:{type:Sequelize.INTEGER,primaryKey: true},
    email:{type:Sequelize.STRING},
    chineseName:{type:Sequelize.STRING},
    englishName:{type:Sequelize.STRING},
    sex:{type:Sequelize.STRING},
    school:{type:Sequelize.STRING},
    year:{type:Sequelize.STRING},
    id:{type:Sequelize.STRING},
    phone:{type:Sequelize.STRING},
    country:{type:Sequelize.STRING},
    city:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING},
    zipCode:{type:Sequelize.STRING},
    qq:{type:Sequelize.STRING},
    weChat:{type:Sequelize.STRING},
    status:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true,
    /*indexes:[
        {
        unique: true,
        fields: ['sid']
    }
    ]*/
  })

const teacher=sequelize.define('teacher',{
    tid:{type:Sequelize.INTEGER,primaryKey:true},
    email:{type:Sequelize.STRING},
    chineseName:{type:Sequelize.STRING},
    englishName:{type:Sequelize.STRING},
    sex:{type:Sequelize.STRING},
    school:{type:Sequelize.STRING},
    year:{type:Sequelize.STRING},
    id:{type:Sequelize.STRING},
    phone:{type:Sequelize.STRING},
    country:{type:Sequelize.STRING},
    city:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING},
    zipCode:{type:Sequelize.STRING},
    qq:{type:Sequelize.STRING},
    weChat:{type:Sequelize.STRING},
    status:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true,
    /*indexes:[
        {
        unique: true,
        fields: ['tid']
    }
    ]*/
  })


/*  
const Email=sequelize.define('Email',{
    email:{type:Sequelize.STRING,allowNULL:false,primaryKey:true},
    code:{type:Sequelize.STRING,allowNULL:false},
    createtime:{type:Sequelize.STRING,allowNULL:false}
},{
    timestamps: false,
    freezeTableName: true
})*/

const University=sequelize.define('University',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    name:{type:Sequelize.STRING,unique:true},
    tid:{type:Sequelize.INTEGER},
    chat:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING},
    status:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
  })

/*
const checkUniversity=sequelize.define('checkUniverisity',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    name:{type:Sequelize.STRING,unique:true},
    charge:{type:Sequelize.STRING},
    chat:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING},
    status:{type:Sequelize.STRING}
},{
    timestamps: false,
    freezeTableName: true
  })*/

  const manager=sequelize.define('manager',{
    mid:{type:Sequelize.INTEGER,primaryKey:true},
    email:{type:Sequelize.STRING},
    chineseName:{type:Sequelize.STRING},
    englishName:{type:Sequelize.STRING},
    sex:{type:Sequelize.STRING},
    school:{type:Sequelize.STRING},
    year:{type:Sequelize.STRING},
    id:{type:Sequelize.STRING},
    phone:{type:Sequelize.STRING},
    country:{type:Sequelize.STRING},
    city:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING},
    zipCode:{type:Sequelize.STRING},
    qq:{type:Sequelize.STRING},
    weChat:{type:Sequelize.STRING},
    //status:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true,
    /*indexes:[
        {
        unique: true,
        fields: ['tid']
    }
    ]*/
  })

//sequelize.sync({force:true}).then(()=>{console.log('模型同步')})
sequelize.sync().then(()=>{console.log('模型同步')})
// .then(async ()=>{
//     const Manager=await User.findOne({where:{email:'123456@qq.com'}})
//     const code='123456er'
//     if(!Manager){
//          await User.create({email:'123456@qq.com',password:await Bcrypt(code),status:'manager'})
//     }
// })


module.exports={User,student,teacher,University,manager}