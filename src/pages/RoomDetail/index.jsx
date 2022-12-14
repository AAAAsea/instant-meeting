import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { SocketContext } from '../../contexts/SocketContext'
import BottomNavBar from '@/components/BottomNavBar'
import './index.css'
import { useParams } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
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
import { VideocamOffRounded } from '@mui/icons-material'
import { LinkRounded } from '@mui/icons-material'
import { Tabs } from '@mui/material'
import { Tab } from '@mui/material'
import { ChatRounded } from '@mui/icons-material'
import { TextField } from '@mui/material'
import { Button } from '@mui/material'
import { formatDate } from '@/utils/tools.js'
import { MessageContext } from '../../contexts/MessageContext'
import { VideocamRounded } from '@mui/icons-material'
import { TransitionGroup } from 'react-transition-group'
import { Collapse } from '@mui/material'
import { List } from '@mui/material'
import { ListItem } from '@mui/material'
import { LinkOffRounded } from '@mui/icons-material'
import { UploadFileRounded } from '@mui/icons-material'

const RoomDetail = () => {
  const [slideOpen, setSlideOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showMainVideo, setShowMainVideo] = useState(false);
  const [msg, setMsg] = useState('');

  const { myVideo, users, setUsers, joinRoom, setRoom, roomJoinning, name, setName, setRoomCreated, me, videoOpen, roomErrorMsg, roomJoinned, messages, sendMessage, setMessages, setRoomJoinned, leaveRoom, room, isLive, slideOpenRef } = useContext(SocketContext)

  const { id } = useParams()
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const mainVideoRef = useRef();
  const chatContainerRef = useRef();

  const navigate = useNavigate();

  const handleChangeTab = (e, value) => {
    setTabValue(value);
  }

  const handleSendMessage = () => {
    if (msg.trim() === '' || msg.trim().length > 100) {
      return;
    }
    sendMessage(msg.trim());
    setMsg('');
  }

  useEffect(() => {
    if (name === '') {
      navigate('/room?id=' + id);
      return;
    }
    setRoomCreated(false); // ??????????????????????????????

    // window.onbeforeunload = (e) => {
    //   e.preventDefault();
    //   e.returnValue = ("??????????????????????????????");
    // }
    document.title = name
    setRoom(id)
    return () => {
      window.onbeforeunload = null;
      leaveRoom(room);
      setUsers([]);
    }
  }, [])

  useEffect(() => {

    // ?????????????????????
    if (!videoOpen && myVideo === mainVideoRef.current.srcObject) {
      setShowMainVideo(false);
    } else {
      // ???????????????????????????
      const currentUser = users.find(user => user.stream === mainVideoRef.current.srcObject);
      if (!currentUser || !currentUser.video) {
        setShowMainVideo(false);
      }
    }

    // ??????????????????????????????
    if (myVideoRef.current.srcObject !== myVideo)
      myVideoRef.current.srcObject = myVideo

    // ???????????????????????????
    userVideoRef.current.childNodes.forEach(e => {
      const user = users.find(user => user.id === e.getAttribute('data'));
      const video = e.querySelector('video');
      // console.log(user)
      if (user && video.srcObject !== user.stream) {
        video.srcObject = user.stream
      }
    })
  }, [myVideo, users, videoOpen])

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages])

  return (
    <div id="room-detail" className='animate__animated animate__fadeIn'>
      {/* <div className="loading-btn-wrapper">
        <LoadingButton
          loading={roomJoinning}
          endIcon={<LinkRounded size={14} color="white" />}
          loadingPosition="end"
          className={[
            roomJoinning ? 'loading-btn' : undefined,
            'animate__animated',
            'animate__zooIn'
          ].join(' ')}
          variant='contained'
          color='primary'
        >
          {roomJoinning ? '??????????????????' : (
            roomJoinned ? '??????????????????' : roomErrorMsg
          )}
        </LoadingButton>
      </div> */}

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
                invisible={!user.video || !user.peerConnected}
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
                <Icon color={(user.voice && (user.peerConnected || user.id === me.current)) ? 'error' : 'primary'}>
                  {(user.peerConnected || user.id === me.current)
                    ? (user.voice ? <Mic /> : <MicOff />)
                    : <LinkOffRounded />
                  }
                </Icon>
              </div>
            </div>
          ))
        }
      </div>

      <div className="open-slide-btn" onClick={() => { setSlideOpen(true); slideOpenRef.current = true; }}>
        <ChevronLeft color='primary' />
      </div>
      {/* ????????? */}
      <div
        style={{ transform: slideOpen ? 'translateX(0)' : 'translateX(100%)' }}
        className="slide-wrapper">

        <div className="slide-header">
          <IconButton onClick={() => { setSlideOpen(false); slideOpenRef.current = false; }}>
            <ChevronRight color='primary' />
          </IconButton>
          <Tabs textColor='inherit' value={tabValue} onChange={handleChangeTab} aria-label="icon tabs example">
            <Tab icon={<VideocamRounded />} />
            <Tab icon={<ChatRounded />} />
          </Tabs>
        </div>

        <div className="slide-body" style={{ transform: !tabValue ? 'translateX(0)' : 'translateX(-50%)' }}>
          <div className="all-video-wrapper">
            <div className="video-wrapper my-video-wrapper">
              <span className='mask'>{name}????</span>
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
                      style={{ visibility: (user.peerConnected && user.video) ? 'hidden' : 'visible' }}
                    >
                      {user.peerConnected
                        ? <VideocamOffRounded />
                        : <LinkOffRounded />
                      }
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
          <div className="all-chat-wrapper">
            <ul className="message-wrapper" ref={chatContainerRef}>
              {
                messages.map((e, index) => (
                  <li className="message-item" key={index}>
                    <div
                      className="message-header"
                      style={{
                        color: me.current === e.id ? '#05d77e' : '#6e6ce9'
                      }}
                    >
                      <span>{e.name}</span>
                      <span>{formatDate(e.time, 'hh:mm:ss')}</span>
                    </div>
                    <div className="message-content">
                      {e.msg}
                    </div>
                  </li>
                ))
              }
            </ul>
            <div className="input-wrapper">
              {/* <IconButton color="primary" aria-label="upload picture" component="label">
                <input hidden type="file" onChange={e => { console.log(e.target.files) }} />
                <UploadFileRounded />
              </IconButton> */}
              <TextField
                value={msg}
                className='input-text-field'
                id="filled-multiline-static"
                multiline
                rows={5}
                placeholder="??????????????????..."
                variant='filled'
                color='primary'
                label={msg.trim().length > 100 ? '????????????' : ''}
                error={msg.trim().length > 100}
                onChange={(e) => setMsg(e.target.value)}
                onKeyUp={e => {
                  if (e.code === 'Enter') {
                    handleSendMessage()
                  }
                }}
              />
              <Button
                variant='contained'
                className='send-btn'
                size='small'
                onClick={handleSendMessage}
              >
                ??????</Button>
            </div>
          </div>
        </div>
      </div>
      <List className="bullet-chat" style={{ opacity: slideOpen ? '0' : '1' }}>
        <TransitionGroup>
          {
            messages.map((e, index) => (
              <Collapse key={e.time + index + e.id}>
                <ListItem
                  className="bullet-chat-item"
                >
                  <span className='bullet-chat-name'>{e.name}</span>:
                  <span className='bullet-chat-content'>{e.msg}</span>
                </ListItem>
              </Collapse>
            ))
          }
        </TransitionGroup>
      </List>
      <BottomNavBar mainVideoRef={mainVideoRef} showMainVideo={showMainVideo}></BottomNavBar>
    </div >
  )
}

export default RoomDetail