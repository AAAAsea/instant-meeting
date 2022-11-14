import { TextField } from '@mui/material'
import { Typography } from '@mui/material'
import { Paper } from '@mui/material'
import { Button } from '@mui/material'
import React from 'react'
import { useContext } from 'react'
import TopNavBar from '../../components/TopNavBar'
import { MessageContext } from '@/contexts/MessageContext'
import './index.css'
import { SocketContext } from '../../contexts/SocketContext'
import { useNavigate } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { useEffect } from 'react'

const Personal = () => {
  const { message } = useContext(MessageContext)
  const { createRoom, name, setName, roomCreating, roomCreated, room } = useContext(SocketContext)

  const navigate = useNavigate()
  useEffect(() => {
    console.log(roomCreated)
    roomCreated && navigate('/room/' + room)
  }, [roomCreated])
  return (
    <>
      <TopNavBar />
      <Paper className='container'>
        <form className='form'>
          <div className="item">
            <label>参会姓名</label>
            <TextField label="姓名" placeholder='姓名' variant='standard' value={name} onChange={e => setName(e.target.value)}></TextField>
          </div>
          <div className="item">
            <label>房间密码</label>
            <TextField label="密码" placeholder='密码' variant='standard' ></TextField>
          </div>
          <LoadingButton loading={roomCreating} loadingIndicator="创建中..." className='submit-btn' variant='contained' onClick={createRoom}>
            创建
          </LoadingButton>
        </form>
      </Paper>
    </>
  )
}

export default Personal