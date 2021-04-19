const {Sequelize,sequelize} = require('../init')

const checkTeacher=sequelize.define('checkTeacher',{
    ctid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    uid:{type:Sequelize.INTEGER},
    email:{type:Sequelize.STRING},
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
},{
    timestamps: false,
    freezeTableName: true
  })


const checkStudent=sequelize.define('checkStudent',{
    csid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    uid:{type:Sequelize.INTEGER},
    email:{type:Sequelize.STRING},
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
},{
    timestamps: false,
    freezeTableName: true
  })

sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={checkTeacher,checkStudent}