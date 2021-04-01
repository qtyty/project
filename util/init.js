const Sequelize=require('sequelize')

const sequelize=new Sequelize('project','root','123456',{
    host:'localhost',
    dialect:'mysql',
    port:'3306',
    timezone:'+08:00'
})

sequelize
    .authenticate()
    .then(()=>{
        console.log("连接成功")
    })
    .catch(err=>{
        console.error("Unable to connect to the database")
    })


module.exports={Sequelize,sequelize}
