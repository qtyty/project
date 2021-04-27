const {Sequelize,sequelize} = require('../init')

const room=sequelize.define('room',{
    rid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    name:{type:Sequelize.STRING},//考场名
    address:{type:Sequelize.STRING},
    number:{type:Sequelize.INTEGER},
    status:{type:Sequelize.ENUM('0','1')}
},{
    timestamps: false,
    freezeTableName: true
  })

const  arrange=sequelize.define('arrange',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    rid:{type:Sequelize.INTEGER},
    cid:{type:Sequelize.INTEGER},
    num:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
  })

const admission=sequelize.define('admission',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    uid:{type:Sequelize.INTEGER},
    cid:{type:Sequelize.INTEGER},
    rid:{type:Sequelize.INTEGER},
    admissionNumber:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
  })

sequelize.sync().then(()=>{console.log('test模型同步')})
module.exports={room,arrange,admission}