import { Paper } from '@mui/material'
import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { SocketContext } from '../../contexts/SocketContext'
import Home from '../Home'
import BottomNavBar from './BottomNavBar'
import './index.css'
import Peer from 'simple-peer'
import { useParams } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { Group } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'

const Room = () => {

  const { myVideo, userStreams, joinRoom, setRoom, roomJoinning, roomJoinned, room, name, setRoomCreated, roomErrorMsg } = useContext(SocketContext)
  const { id } = useParams()
  const myVideoRef = useRef();
  const userVideoRef = useRef();

  useEffect(() => {
    setRoomCreated(false);
    setRoom(id);
    joinRoom(id);
  }, [])

  useEffect(() => {
    myVideoRef.current.srcObject = myVideo;
    userVideoRef.current.childNodes.forEach((e, index) => {
      e.srcObject = userStreams[index].stream;
    })
  }, [myVideo, userStreams])


  return (
    <div className="room">
      <LoadingButton endIcon={roomJoinning ? <CircularProgress size={14} color="warning" /> : <></>} loadingPosition="end" className='submit-btn' variant='contained'>
        {roomJoinning ? '正在加入...' : (roomJoinned ? '已加入' : roomErrorMsg)}
      </LoadingButton>

      <div className="video-container">
        <video className='my-video' playsInline muted autoPlay ref={myVideoRef}></video>
        <div className="other-video" ref={userVideoRef}>
          {
            userStreams.map((e) =>
              <video playsInline autoPlay key={e.userId}></video>
            )
          }
        </div>
      </div>
      <BottomNavBar></BottomNavBar>
    </div >
  )
}

export default Room