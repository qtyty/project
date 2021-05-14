const {Sequelize,sequelize} = require('../init')

const applySingle=sequelize.define('applySingle',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    uid:{type:Sequelize.INTEGER},
    cid:{type:Sequelize.INTEGER},
    status:{type:Sequelize.ENUM('-1','0','1')},
    remark:{type:Sequelize.STRING},
    grade:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
  })

const applyGroup=sequelize.define('applyGroup',{
    gid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    groupName:{type:Sequelize.STRING},
    cid:{type:Sequelize.INTEGER},
    tid:{type:Sequelize.INTEGER},
    suid:{type:Sequelize.INTEGER},
    status:{type:Sequelize.ENUM('-1','0','1')},
    remark:{type:Sequelize.STRING},
    grade:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
  })


const groupTeam=sequelize.define('groupTeam',{
  id:{type:Sequelize.Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
  gid:{type:Sequelize.INTEGER},
  uid:{type:Sequelize.INTEGER},
  sid:{type:Sequelize.INTEGER},
  name:{type:Sequelize.STRING}
},{
  timestamps: false,
  freezeTableName: true
})



sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={applySingle,applyGroup,groupTeam}