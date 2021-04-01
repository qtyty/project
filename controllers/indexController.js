const dbConfig = require('../util/dbconfig');

var getUser=(req,res)=>{
    var sql = 'select * from user';
    var sqlArr = [];
    var callBack = (err,data)=>{
      if(err){
        console.log('---连接出错了----')
      }else{
        res.send({
          'list':data
        })
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,callBack);
}
module.exports = {
    getUser
};