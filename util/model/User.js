// 导入创建模型需要的函数
const { FailedDependency } = require('http-errors')
const {Sequelize,sequelize} = require('../init')

const User=sequelize.define('User',{
    email:{type:Sequelize.STRING,primaryKey:true},
    password:{type:Sequelize.STRING},
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
    status:{type:Sequelize.STRING}
})

const Email=sequelize.define('Email',{
    email:{type:Sequelize.STRING,allowNULL:false,primaryKey:true},
    code:{type:Sequelize.STRING,allowNULL:false},
    createtime:{type:Sequelize.STRING,allowNULL:false}
})

//sequelize.sync({force:true}).then(()=>{console.log('模型同步')})
sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={User,Email}