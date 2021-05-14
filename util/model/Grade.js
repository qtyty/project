const {Sequelize,sequelize} = require('../init')

const grade=sequelize.define('grade',{
    id:{type:Sequelize.INTEGER,primaryKey:true,autoIncrement: true},
    cid:{type:Sequelize.INTEGER},
    aid:{type:Sequelize.INTEGER},   //报名表id
    grade:{type:Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
  })


sequelize.sync({}).then(()=>{console.log('模型同步')})
module.exports={grade}