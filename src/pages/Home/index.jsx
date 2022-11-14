import { TextField } from '@mui/material'
import { Grid } from '@mui/material'
import { Paper } from '@mui/material'
import { Button } from '@mui/material'
import React from 'react'
import { useContext } from 'react'
import TopNavBar from '@/components/TopNavBar'
import { MessageContext } from '@/contexts/MessageContext'
import './index.css'
import { useState } from 'react'
import { SocketContext } from '@/contexts/SocketContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { message } = useContext(MessageContext);
  const { callUser, name, setName, joinRoom } = useContext(SocketContext);
  const navigate = useNavigate();
  const [id, setId] = useState('');
  return (
    <>
      <TopNavBar />
      <Paper className='container'>
        <form className='form'>
          <div className='item'>
            <label>会议ID</label>
            <TextField label="ID" placeholder='房间ID' variant='standard' value={id} onChange={e => setId(e.target.value)}></TextField>
          </div>
          <div className='item'>
            <label>参会姓名</label>
            <TextField label="姓名" placeholder='姓名' variant='standard' value={name} onChange={e => setName(e.target.value)}></TextField>
          </div>
          <Button className='submit-btn' variant='contained' onClick={() => { joinRoom(id); navigate('/room') }}>加入</Button>
        </form>
      </Paper>
    </>
  )
}

export default Home