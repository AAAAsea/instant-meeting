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
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const Join = () => {
  const { name, setName, room, setRoom } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id');

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

  useEffect(() => {
    id && setRoom(id);
  }, [])
  return (
    <>
      <TopNavBar />
      <Paper className='container'>
        <h2 className='animate__animated animate__fadeIn'>加入房间</h2>
        <form className='form animate__animated animate__fadeIn'>
          <div className='item'>
            <TextField
              label="房间号"
              type="number"
              placeholder='请输入房间号'
              variant='standard'
              value={room}
              onKeyUp={e => {
                if (e.code === 'Enter') {
                  handleClick();
                }
              }}
              onChange={e => setRoom(e.target.value.trim())}></TextField>
          </div>
          <div className='item'>
            <TextField
              label="姓名"
              variant='standard'
              value={name}
              autoFocus
              placeholder="请输入您的姓名"
              error={name.length > 9}
              helperText={!/^\S{1,9}$/.test(name) ? '最多9个字符' : ''}
              onKeyUp={e => {
                console.log(e.code)
                if (e.code === 'Enter') {
                  handleClick();
                }
              }}
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