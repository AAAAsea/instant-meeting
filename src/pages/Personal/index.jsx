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
const Personal = () => {
  const { message } = useContext(MessageContext)
  const { createRoom, name, setName } = useContext(SocketContext)

  const navigate = useNavigate()
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
          <Button className='submit-btn' variant='contained' onClick={() => { createRoom(); navigate('/room') }}>创建</Button>
        </form>
      </Paper>
    </>
  )
}

export default Personal