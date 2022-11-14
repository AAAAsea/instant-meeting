import { Paper } from '@mui/material'
import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SocketContext } from '../../contexts/SocketContext'
import Home from '../Home'
import BottomNavBar from './BottomNavBar'
import './index.css'
import Peer from 'simple-peer'

const Room = () => {
  const { myVideo, userStreams } = useContext(SocketContext)
  const [search] = useSearchParams()
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  useEffect(() => {
    myVideoRef.current.srcObject = myVideo;
    userVideoRef.current.childNodes.forEach((e, index) => {
      e.srcObject = userStreams[index].stream;
    })
    console.log("video 更新", userStreams)
  }, [myVideo, userStreams])


  return (
    <div className="room">
      {/* <Home></Home> */}
      <div className="video-container">
        <video className='my-video' playsInline muted autoPlay ref={myVideoRef}></video>
        <div className="other-video" ref={userVideoRef}>
          {
            userStreams.map((e) =>
              <video playsInline muted autoPlay key={e.userId}></video>
            )
          }
        </div>
      </div>
      <BottomNavBar></BottomNavBar>
    </div >
  )
}

export default Room