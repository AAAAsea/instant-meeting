import { TextField } from '@mui/material'
import { Grid } from '@mui/material'
import { Paper } from '@mui/material'
import { Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react'
import { useContext } from 'react'
import TopNavBar from '@/components/TopNavBar'
import './index.css'
import { SocketContext } from '@/contexts/SocketContext'
import { useNavigate } from 'react-router-dom'
import { Group } from '@mui/icons-material';
import { MessageContext } from '../../contexts/MessageContext';

const Join = () => {
  const { name, setName, room, setRoom } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  const navigate = useNavigate();

  const handleClick = () => {
    if (!/^\d{9}$/.test(room)) {
      message.warning('请输入正确格式的房间ID')
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
      <Paper className='container'>
        <form className='form'>
          <div className='item'>
            <TextField
              error={!/^\d{9}$/.test(room)}
              required
              label="房间ID"
              type="number"
              placeholder='请输入房间ID'
              variant='standard'
              value={room}
              onChange={e => setRoom(e.target.value.trim())}></TextField>
          </div>
          <div className='item'>
            <TextField
              error={!/^\S{1,9}$/.test(name)}
              required
              label="姓名"
              variant='standard'
              value={name}
              placeholder="请输入您的姓名"
              helperText={!/^\S{1,9}$/.test(name) ? '最多9个字符' : ''}
              onChange={e => setName(e.target.value.trim())}></TextField>
          </div>
          <Button
            endIcon={<Group />}
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