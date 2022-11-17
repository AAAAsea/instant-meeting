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
import { Mic } from '@mui/icons-material'
import { MicOff } from '@mui/icons-material'
import { Icon } from '@mui/material'
import { VideocamRounded } from '@mui/icons-material'
import { VideocamOffRounded } from '@mui/icons-material'

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

    window.onbeforeunload = function (e) {
      e.returnValue = ("确定离开当前页面吗？");
    }
  }, [])

  useEffect(() => {

    // 自己关闭摄像头
    if (!videoOpen && myVideo === mainVideoRef.current.srcObject) {
      setShowMainVideo(false);
    } else {
      // 当前用户关闭摄像头
      const currentUser = users.find(user => user.stream === mainVideoRef.current.srcObject);
      if (currentUser && !currentUser.video) {
        setShowMainVideo(false);
      }
    }

    // 更新侧边栏自己摄像头
    if (myVideoRef.current.srcObject !== myVideo)
      myVideoRef.current.srcObject = myVideo

    // 更新侧边栏其他用户
    userVideoRef.current.childNodes.forEach(e => {
      const user = users.find(user => user.id === e.getAttribute('data'));
      const video = e.querySelector('video');
      // console.log(user)
      if (user && video.srcObject !== user.stream) {
        video.srcObject = user.stream
      }
    })
  }, [myVideo, users])

  return (
    <div id="room" className='animate__animated animate__fadeIn'>
      <div className="loading-btn-wrapper">
        <LoadingButton
          style={{ visibility: roomJoinning ? 'visible' : 'hidden' }}
          endIcon={<CircularProgress size={14} color="error" />}
          loadingPosition="end"
          className='loading-btn animate__animated animate__zooIn'
          variant='contained'>
          视频连接中
        </LoadingButton>
      </div>

      <div
        style={{
          visibility: showMainVideo ? 'visible' : 'hidden'
        }}
        className="main-video-wrapper"
      >
        <video
          className='main-video'
          playsInline
          muted
          autoPlay
          ref={mainVideoRef}
        />
      </div>

      <div
        style={{
          visibility: showMainVideo ? 'hidden' : 'visible'
        }}
        className="avatar-wrapper">
        {
          users.map(user => (
            <div className="avatar-item animate__animated animate__zoomIn" key={user.id}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color='error'
                invisible={!user.video}
              >
                <Avatar
                  className='avatar-main '
                  sizes='large'
                  sx={{
                    bgcolor: stringToColor(user.name),
                    width: 60,
                    height: 60
                  }}
                >
                  {user.name[0]}
                </Avatar>
              </StyledBadge>
              <div className="avatar-footer">
                <span className='avatar-desc'>{user.name}</span>
                <Icon color='primary'>
                  {user.voice ? <Mic /> : <MicOff />}
                </Icon>
              </div>
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
          <span className='mask'>{name}📍</span>
          <Icon
            color='primary'
            className='video-mask'
            style={{ visibility: videoOpen ? 'hidden' : 'visible' }}
          >
            <VideocamOffRounded />
          </Icon>
          <video
            style={{ visibility: videoOpen ? 'visible' : 'hidden' }}
            onClick={(e) => {
              setShowMainVideo(e.target.srcObject !== null)
              mainVideoRef.current.srcObject = e.target.srcObject
            }}
            className='video-item'
            playsInline
            autoPlay
            muted
            ref={myVideoRef}></video>
        </div>
        <div className="other-video" ref={userVideoRef}>
          {
            users.filter(user => user.id !== me.current).map(user =>
              <div className="video-wrapper" key={user.id} data={user.id}>
                <span className="mask">{user.name}</span>
                <Icon
                  color='primary'
                  className='video-mask'
                  style={{ visibility: user.video ? 'hidden' : 'visible' }}
                >
                  <VideocamOffRounded />
                </Icon>
                <video
                  style={{ visibility: user.video ? 'visible' : 'hidden' }}
                  onClick={(e) => {
                    setShowMainVideo(e.target.srcObject !== null);
                    mainVideoRef.current.srcObject = e.target.srcObject;
                  }}
                  className="video-item"
                  playsInline
                  autoPlay
                ></video>
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