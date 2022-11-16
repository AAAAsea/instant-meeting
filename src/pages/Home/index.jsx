import { ArrowRight } from '@mui/icons-material'
import { CameraIndoor } from '@mui/icons-material'
import { Forward } from '@mui/icons-material'
import { Room } from '@mui/icons-material'
import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import logo from '/video.svg'
const Home = () => {
  const navigate = useNavigate();

  return (
    <div id="home">
      <img id="logo" src={logo} alt="" />
      <h1>Now Meeting</h1>
      <div className="start-btn">
        <Button size='large' color='primary' variant='contained' endIcon={<CameraIndoor></CameraIndoor>} onClick={() => { navigate('/create') }}>创建房间</Button>
        <Button size='large' color='neutral' variant='contained' endIcon={<Forward></Forward>} onClick={() => { navigate('/join') }}>加入房间</Button>
      </div>
    </div>
  )
}

export default Home