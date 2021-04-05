const {Sequelize,sequelize} = require('../init')

const contest=sequelize.define('Contest',{
    cid:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    name:{type:Sequelize.STRING},
    type:{type:Sequelize.STRING},
    isEqual:{type:Sequelize.STRING},
    limit:{type:Sequelize.INTEGER},
    startApp:{type:Sequelize.STRING},
    endApp:{type:Sequelize.STRING},
    startHold:{type:Sequelize.STRING},
    endHold:{type:Sequelize.STRING},
    rules:{type:Sequelize.STRING},
    rewards:{type:Sequelize.STRING},
    remark:{type:Sequelize.STRING},
    state:{type:Sequelize.STRING},
    address:{type:Sequelize.STRING}
},{
    timestamps: false
  })

//sequelize.sync({force:true}).then(()=>{console.log('模型同步')})
sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={contest}