import { Paper } from '@mui/material'
import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { SocketContext } from '../../contexts/SocketContext'
import Home from '../Join'
import BottomNavBar from '@/components/BottomNavBar'
import './index.css'
import Peer from 'simple-peer'
import { useParams } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { Group } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { IconButton } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { useState } from 'react'
import { ChevronLeft } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Room = () => {

  const [slideOpen, setSlideOpen] = useState(false);

  const { myVideo, userStreams, joinRoom, setRoom, roomJoinning, roomJoinned, room, name, setRoomCreated, roomErrorMsg, users } = useContext(SocketContext)
  const { id } = useParams()
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const mainVideoRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setRoom(id);

    if (name === '') {
      navigate('/join?id=' + id);
      return;
    }
    setRoomCreated(false); // 为了下次再次创建房间
    joinRoom(id);
  }, [])

  useEffect(() => {
    myVideoRef.current.srcObject = myVideo;
    if (!mainVideoRef.current.srcObject) {
      mainVideoRef.current.srcObject = myVideo;
    }
    userVideoRef.current.childNodes.forEach((e, index) => {
      e.childNodes[0].textContent = userStreams[index].userName;
      e.childNodes[1].srcObject = userStreams[index].stream;
    })
  }, [myVideo, userStreams])

  return (
    <div id="room">
      <div className="loading-btn-wrapper">
        <LoadingButton
          endIcon={roomJoinning ? <CircularProgress size={14} color="warning" /> : <></>} loadingPosition="end" className='loading-btn' variant='contained'>
          {roomJoinning ? '正在加入...' : (roomJoinned ? '已加入' : roomErrorMsg)}
        </LoadingButton>
      </div>
      <div className="main-video-wrapper">
        <video controls={false} className='main-video' playsInline muted autoPlay ref={mainVideoRef}></video>
      </div>
      <div className="open-slide-btn" onClick={() => { setSlideOpen(true) }}>
        {/* <IconButton onClick={() => { setSlideOpen(true) }}> */}
        <ChevronLeft color='primary' />
        {/* </IconButton> */}
      </div>
      <div
        style={{ transform: slideOpen ? 'translateX(0)' : 'translateX(100%)' }}
        className="slide-video-wrapper">
        <div className="slide-header">
          <IconButton onClick={() => { setSlideOpen(false) }}>
            <ChevronRight color='primary' />
          </IconButton>
        </div>
        <div className="video-wrapper my-video-wrapper">
          <span className='mask'>{name}（我）</span>
          <video onClick={(e) => { mainVideoRef.current.srcObject = e.target.srcObject }} className='video-item' playsInline muted autoPlay ref={myVideoRef}></video>
        </div>

        <div className="other-video" ref={userVideoRef}>
          {
            userStreams.map((e) =>
              <div className="video-wrapper" key={e.userId}>
                <span className="mask"></span>
                <video onClick={(e) => { mainVideoRef.current.srcObject = e.target.srcObject }} className="video-item" playsInline autoPlay ></video>
              </div>
            )
          }
        </div>
      </div>
      <BottomNavBar mainVideoRef={mainVideoRef}></BottomNavBar>
    </div >
  )
}

export default Room