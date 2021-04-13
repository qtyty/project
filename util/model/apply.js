const {Sequelize,sequelize} = require('../init')

const applySingle=sequelize.define('applySingle',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    uid:{type:Sequelize.INTEGER},
    cid:{type:Sequelize.INTEGER},
    state:{type:Sequelize.STRING}
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
    state:{type:Sequelize.STRING}
},{
    timestamps: false,
    freezeTableName: true
  })


const groupTeam=sequelize.define('groupTeam',{
  gid:{type:Sequelize.INTEGER,primaryKey:true},
  uid:{type:Sequelize.INTEGER},
  id:{type:Sequelize.INTEGER},
  name:{type:Sequelize.STRING}
},{
  timestamps: false,
  freezeTableName: true
})



sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={applySingle,applyGroup,groupTeam}