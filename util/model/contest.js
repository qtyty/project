const {Sequelize,sequelize} = require('../init')

const contest=sequelize.define('Contest',{
    cid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    name:{type:Sequelize.STRING},
    type:{type:Sequelize.STRING},
    isEqual:{type:Sequelize.STRING},
    limit:{type:Sequelize.INTEGER},
    startApp:{type:Sequelize.DATE},
    endApp:{type:Sequelize.DATE},
    startHold:{type:Sequelize.DATE},
    endHold:{type:Sequelize.DATE},
    rules:{type:Sequelize.STRING},
    rewards:{type:Sequelize.STRING},
    remark:{type:Sequelize.STRING},
    state:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING}
},{
    timestamps: false,
    freezeTableName: true
  })

//sequelize.sync({force:true}).then(()=>{console.log('模型同步')})
sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={contest}