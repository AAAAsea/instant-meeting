// 封装dao层
const { pool } = require('./pool');

// 查询list
let findList = (username, callback)=>{
    pool.getConnection((err, connection)=>{
        if(err) {
            console.log(err);
        } else {
          let sql = `SELECT * FROM list WHERE USERNAME = '${username}';`;
          connection.query(sql,(err,result)=>{
            callback(err, result);
            connection.release();
            connection.destroy();
          })
        }
    })
}

// 新增list
let addList = ({username, time, content, remarks}, callback)=>{
  pool.getConnection((err, connection)=>{
      if(err) {
          console.log(err);
      } else {
        let sql = `INSERT INTO list VALUES(null, '${content}', '${time}', true, '${remarks}', '${username}');`
        connection.query(sql,(err,result)=>{
            callback(err, result);
            connection.release();
            connection.destroy();
        })
      }
  })
}

// 更新list
let updateList = ({state, id}, callback)=>{
  pool.getConnection((err, connection)=>{
      if(err) {
          console.log(err);
      } else {
        let sql = `UPDATE list SET state = ${state} WHERE ID = ${id};`
        connection.query(sql,(err,result)=>{
          callback(err, result);
          connection.release();
          connection.destroy();
        })
      }
  })
}

// 更新list内容
let alterList = ({content, id}, callback)=>{
  pool.getConnection((err, connection)=>{
      if(err) {
          console.log(err);
      } else {
        let sql = `UPDATE list SET CONTENT = '${content}' WHERE id = ${id};`
        console.log(sql)
        connection.query(sql,(err,result)=>{
          callback(err, result);
          connection.release();
          connection.destroy();
        })
      }
  })
}

// 删除list
let deleteList = (id, callback)=>{
  pool.getConnection((err, connection)=>{
      if(err) {
          console.log(err);
      } else {
        let sql = `DELETE FROM list WHERE ID = ${id};`
        connection.query(sql,(err,result)=>{
          callback(err, result);
          connection.release();
          connection.destroy();
        })
      }
  })
}

// 查询list
let findUserByListId = (id, callback)=>{
  pool.getConnection((err, connection)=>{
      if(err) {
          console.log(err);
      } else {
        let sql = `SELECT username FROM list WHERE id = '${id}'`;
        connection.query(sql,(err,result)=>{
          callback(err, result);
          connection.release();
          connection.destroy();
        })
      }
  })
}
module.exports = {
  findList,
  addList,
  updateList,
  deleteList,
  findUserByListId,
  alterList
}
