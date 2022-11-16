import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import Footer from '@/components/Footer';
import logo from '/video.svg'
import { GroupRounded } from '@mui/icons-material'
import { VideoCameraFrontRounded } from '@mui/icons-material'

const Home = () => {
  const navigate = useNavigate();
  const a = 1;

  return (
    <>
      <div id="home">
        <img id="logo" src={logo} onClick={() => { navigate('/') }} />
        <h1>Instant Meeting</h1>
        {/* <span className="desc">Start your own meeting room!</span> */}
        <div className="start-btn">
          <Button size='large' color='primary' variant='contained' startIcon={<VideoCameraFrontRounded />} onClick={() => { navigate('/create') }}>Create</Button>
          <Button size='large' color='neutral' variant='contained' endIcon={<GroupRounded />} onClick={() => { navigate('/join') }}>Join</Button>
        </div>
      </div>
      <Footer></Footer>
    </>

  )
}

export default Home