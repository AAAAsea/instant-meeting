import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { SocketContext } from '../../contexts/SocketContext'
import BottomNavBar from '@/components/BottomNavBar'
import './index.css'
import { useParams } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { CircularProgress } from '@mui/material'
import { IconButton } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { useState } from 'react'
import { ChevronLeft } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@mui/material'
import { stringToColor } from '@/utils'
import { StyledBadge } from '@/components/MUI'

const Room = () => {
  const [slideOpen, setSlideOpen] = useState(false);
  const { myVideo, users, joinRoom, setRoom, roomJoinning, name, setRoomCreated, me, videoOpen } = useContext(SocketContext)
  const { id } = useParams()
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const mainVideoRef = useRef();
  const navigate = useNavigate();

  const [showMainVideo, setShowMainVideo] = useState(false);

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

    // 自己关闭摄像头
    if (!videoOpen && myVideo === mainVideoRef.current.srcObject) {
      mainVideoRef.current.srcObject = null;
      setShowMainVideo(false);
    } else {
      // 当前用户关闭摄像头
      const currentUser = users.find(user => user.stream === mainVideoRef.current.srcObject);
      if (currentUser && !currentUser.video) {
        mainVideoRef.current.srcObject = null;
        setShowMainVideo(false);
      }
    }

    // 更新侧边栏自己摄像头
    myVideoRef.current.srcObject = videoOpen ? myVideo : null;

    // 更新侧边栏其他用户
    const usersWithoutMe = users.filter(user => user.id !== me.current)
    userVideoRef.current.childNodes.forEach((e, index) => {
      e.childNodes[0].textContent = usersWithoutMe[index].name;
      e.childNodes[1].srcObject =
        usersWithoutMe[index].video
          ? usersWithoutMe[index].stream
          : null;
    })
  }, [myVideo, users])

  return (
    <div id="room" className='animate__animated animate__fadeIn'>
      <div className="loading-btn-wrapper">
        <LoadingButton
          style={{ display: roomJoinning ? 'inline' : 'none' }}
          endIcon={roomJoinning ? <CircularProgress size={14} color="warning" /> : <></>} loadingPosition="end" className='loading-btn' variant='contained'>
          视频连接中
        </LoadingButton>
      </div>

      <div style={{
        visibility: showMainVideo ? 'visible' : 'hidden'
      }} className="main-video-wrapper">
        <video controls={false} className='main-video' playsInline muted autoPlay ref={mainVideoRef}></video>
      </div>

      <div
        style={{
          visibility: showMainVideo ? 'hidden' : 'visible'
        }}
        className="avatar-wrapper">
        {
          users.map(user => (
            <div className="avatar-item" key={user.id}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color='error'
                invisible={!user.video}
              >
                <Avatar className='avatar-main' sizes='large' alt="Remy Sharp" sx={{ bgcolor: stringToColor(user.name), width: 60, height: 60 }} >
                  {user.name[0]}
                </Avatar>
              </StyledBadge>
              <span className='avatar-desc'>{user.name}</span>
            </div>
          ))
        }
      </div>

      <div className="open-slide-btn" onClick={() => { setSlideOpen(true) }}>
        <ChevronLeft color='primary' />
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
          <span className='mask'>{name}📌</span>
          <video onClick={(e) => {
            setShowMainVideo(e.target.srcObject !== null)
            mainVideoRef.current.srcObject = e.target.srcObject
          }} className='video-item' playsInline muted autoPlay ref={myVideoRef}></video>
        </div>
        <div className="other-video" ref={userVideoRef}>
          {
            users.filter(user => user.id !== me.current).map(user =>
              <div className="video-wrapper" key={user.id}>
                <span className="mask"></span>
                <video onClick={(e) => {
                  setShowMainVideo(e.target.srcObject !== null);
                  mainVideoRef.current.srcObject = e.target.srcObject;
                }} className="video-item" playsInline autoPlay ></video>
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