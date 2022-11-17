import { TextField } from '@mui/material'
import { Paper } from '@mui/material'
import { Button } from '@mui/material'
import React from 'react'
import { useContext } from 'react'
import TopNavBar from '@/components/TopNavBar'
import './index.css'
import { SocketContext } from '@/contexts/SocketContext'
import { useNavigate } from 'react-router-dom'
import { MessageContext } from '../../contexts/MessageContext';
import { GroupRounded } from '@mui/icons-material';

const Join = () => {
  const { name, setName, room, setRoom } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  const navigate = useNavigate();

  const handleClick = () => {
    if (!/^\d{9}$/.test(room)) {
      message.warning('请输入正确格式的房间号')
      return;
    }
    if (!/^\S{1,9}$/.test(name)) {
      message.warning('请输入合法的用户名')
      return;
    }

    navigate(`/room/${room}`)
  }
  return (
    <>
      <TopNavBar />
      <Paper className='container animate__animated animate__fadeIn'>
        <form className='form'>
          <div className='item'>
            <TextField
              label="房间号"
              type="number"
              placeholder='请输入房间号'
              variant='standard'
              value={room}
              onChange={e => setRoom(e.target.value.trim())}></TextField>
          </div>
          <div className='item'>
            <TextField
              label="姓名"
              variant='standard'
              value={name}
              placeholder="请输入您的姓名"
              helperText={!/^\S{1,9}$/.test(name) ? '最多9个字符' : ''}
              onChange={e => setName(e.target.value.trim())}></TextField>
          </div>
          <Button
            endIcon={<GroupRounded />}
            className='submit-btn'
            variant='contained'
            onClick={handleClick}>
            加入
          </Button>
        </form>
      </Paper>
    </>
  )
}

export default Join