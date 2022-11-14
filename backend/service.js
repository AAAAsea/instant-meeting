const express = require('express') //引入express 模块
const { findUser, insertUser } = require('./user.js');
const { findList, addList, updateList, alterList, deleteList, findUserByListId } = require('./list.js');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt')
const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const secretKey = "todolistkey123"

const app = express();              //创建实例
app.use(bodyParser.json())
.use(
  expressJwt.expressjwt({
    secret: secretKey,  // 签名的密钥 或 PublicKey,
    algorithms: ["HS256"]
  }).unless({
    path: ['/login', '/signup']  // 指定路径不经过 Token 解析
  })
)

// 登录
app.post('/login', function (req, res) {
  const {username, password} = req.body;
  findUser(username,(err, results)=>{
    if(results.length === 0) 
    {
      res.send({code: 50000, message: '用户未注册'});
      return;
    }
    const {PASSWORD: pwd, NICKNAME: nickName} = results[0];
    if(bcrypt.compareSync(password, pwd))
    {
      // 注意默认情况 Token 必须以 Bearer+空格 开头
      const token = 'Bearer ' + jwt.sign(
        {
          username,
          admin: true
        },
        secretKey,
        {
          expiresIn: 3600 * 24 * 30
        }
      )
      res.send({
        code: 20000,
        message: '登陆成功',
        data: { token: token, nickName}
      })
    }else{
      res.send({
        code: 50000,
        message: '密码错误',
      })
    }
  })
  
})
// 注册
app.post('/signup', function (req, res) {
  const {username, password, nickName} = req.body;

  findUser(username,(err, results)=>{
    if(err){
      console.log(err);
      return;
    }
    if(results.length === 1){
      res.send({code: 50000, message: '用户已存在'});
    }else{
      const hashpwd = bcrypt.hashSync(password,salt);
      insertUser({username, hashpwd, nickName},(err, results)=>{
        if(err){
          res.send({code: 50000, message: '注册失败'})
        }else{
          res.send({
            code: 20000,
            message: '注册成功',
          })
        }
      })
    }
  })
  
})
// 获取数据
app.get('/', (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.send({code: 50001, message: '请重新登录', data: err})
    }else{
      const {username} = decoded;
      findList(username, (err,results)=>{
        if(err){
          console.log(err);
        }else
          res.send({code: 20000, message: '查询成功', data: results})
      })
    }
  })
  
});
// 新增数据
app.post('/add', (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.send({code: 50000, message: '请重新登录', data: "token无效"})
    }else{
      const {content, time, remarks} = req.body;
      const {username} = decoded;
      addList({username, time, remarks, content}, (err,results)=>{
        if(err){
          console.log(err)
        }else{
          res.send({code: 20000, message: '新增成功', id: results.insertId})
        }
        })
    }
  })
});
// 更新状态
app.post('/update', (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.send({code: 50000, message: '请重新登录', data: "token无效"})
    }else{
      const {id, state} = req.body;
      const {username} = decoded;
      findUserByListId(id, (err, result)=>{
        if(err){
          console.log(err);
        }else{
          if(result.length === 0){
            res.send({code: 50000, message: '帖子不存在'});
          }else{
            if(result[0].username !== username){
              res.send({code: 50000, message: '无权修改'});
            }else{
              updateList({id, state}, (err,results)=>{
                if(err){
                  console.log(err)
                }else{
                  res.send({code: 20000, message: '修改成功'})
                }
              })
            }
          }
        }
      })
      
    }
  })
  
});
// 修改数据
app.post('/alter', (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.send({code: 50000, message: '请重新登录', data: "token无效"})
    }else{
      const {id, content} = req.body;
      const {username} = decoded;
      findUserByListId(id, (err, result)=>{
        if(err){
          console.log(err);
        }else{
          if(result.length === 0){
            res.send({code: 50000, message: '帖子不存在'});
          }else{
            if(result[0].username !== username){
              res.send({code: 50000, message: '无权修改'});
            }else{
              alterList({id, content}, (err,results)=>{
                if(err){
                  console.log(err)
                }else{
                  res.send({code: 20000, message: '修改成功'})
                }
              })
            }
          }
        }
      })
      
    }
  })
  
});
// 删除
app.post('/delete', (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.send({code: 50000, message: '请重新登录', data: "token无效"})
    }else{
      const {id, state} = req.body;
      const {username} = decoded;
      findUserByListId(id, (err, result)=>{
        if(err){
          console.log(err);
        }else{
          if(result.length === 0){
            res.send({code: 50000, message: '帖子不存在'});
          }else{
            if(result[0].username !== username){
              res.send({code: 50000, message: '无权删除'});
            }else{
              deleteList(id, (err,results)=>{
                if(err){
                  console.log(err)
                }else{
                  res.send({code: 20000, message: '删除成功'})
                }
              })
            }
          }
        }
      })
    }
  })
  
});

// 开启服务器
app.listen(4000,()=>{
  console.log('服务器在4000端口开启');
})
