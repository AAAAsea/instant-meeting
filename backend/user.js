// 封装dao层
const { pool } = require('./pool');

// 查询用户
let findUser = (username, callback)=>{
    pool.getConnection((err, connection)=>{
        if(err) {
            console.log(err);
        } else {
            let sql = `SELECT PASSWORD, NICKNAME FROM user WHERE username = '${username}'`;
            connection.query(sql,(err,result)=>{
                callback(err, result);
                connection.release();
                connection.destroy();
            })
        }
    })
}

// 插入用户
let insertUser = ({username, hashpwd, nickName}, callback)=>{
    pool.getConnection((err, connection)=>{
        if(err) {
            console.log(err);
        } else {
            let sql = `INSERT INTO user VALUES( '${username}', '${nickName}', '${hashpwd}');`
            connection.query(sql,(err,result)=>{
                callback(err, result);
                connection.release();
                connection.destroy();
            })
        }
    })
}

module.exports = {
    findUser,
    insertUser,
}
