const Sequelize=require('sequelize')

const sequelize=new Sequelize('project','root','123456',{
    host:'localhost',
    dialect:'mysql',
    port:'3306',
    timezone:'+08:00',
    dialectOptions: {
        dateStrings: true,
        typeCast: true
      }
})

sequelize
    .authenticate()
    .then(()=>{
        console.log("θΏζ₯ζε")
    })
    .catch(err=>{
        console.error("Unable to connect to the database")
    })


module.exports={Sequelize,sequelize}
