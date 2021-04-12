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
/*
const groupSign=sequelize.define('groupSign',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    name:{type:Sequelize.STRING},
    cid:{type:Sequelize.INTEGER},
    state:{type:Sequelize.STRING},

})*/



sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={applySingle}