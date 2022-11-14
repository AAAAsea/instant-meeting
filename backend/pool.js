const mysql = require('mysql2')

let pool = mysql.createPool({
    host:'localhost',
    // host:'124.221.154.52',		//主机（默认都是local host）
    port:'3306',
    user:'root',
    password:'gaoyuan,',
    database: 'todolist',
    dateStrings: true // 解决时区问题

})

module.exports = {
    pool
}
