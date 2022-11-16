import { TextField } from '@mui/material'
import { Paper } from '@mui/material'
import React from 'react'
import { useContext } from 'react'
import TopNavBar from '../../components/TopNavBar'
import { MessageContext } from '@/contexts/MessageContext'
import './index.css'
import { SocketContext } from '../../contexts/SocketContext'
import { useNavigate } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { useEffect } from 'react'
import { VideoCameraFrontRounded } from '@mui/icons-material'

const Create = () => {
  const { message } = useContext(MessageContext)
  const { createRoom, name, setName, roomCreated, room, roomCreating } = useContext(SocketContext)

  const navigate = useNavigate()
  useEffect(() => {
    roomCreated && navigate('/room/' + room)
  }, [roomCreated])

  const handleClick = () => {
    if (!/^\S{1,9}$/.test(name)) {
      message.warning('请输入合法的用户名')
      return;
    }

    createRoom();
  }
  return (
    <>
      <TopNavBar />
      <Paper className='container'>
        <form className='form'>
          <div className="item">
            <TextField
              label="姓名"
              variant='standard'
              value={name}
              placeholder="请输入您的姓名"
              helperText={!/^\S{1,9}$/.test(name) ? '最多9个字符' : ''}
              onChange={e => setName(e.target.value.trim())}></TextField>
          </div>
          <div className="item">
            <TextField label="密码" placeholder='密码' variant='standard' ></TextField>
          </div>
          <LoadingButton
            endIcon={<VideoCameraFrontRounded />}
            loading={roomCreating}
            loadingIndicator="创建中..."
            className='submit-btn'
            variant='contained'
            onClick={handleClick}
          >
            创建
          </LoadingButton>
        </form>
      </Paper>
    </>
  )
}

export default Create