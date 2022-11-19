import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from 'simple-peer';
import { useContext } from "react";
import { MessageContext } from '@/contexts/MessageContext'
import React from 'react'
import { qualities } from "../utils";
const SocketContext = createContext();

// const socket = io('http://localhost:5000/');
const socket = io('https://meet.asea.fun/');
const peers = {};

// eslint-disable-next-line react/prop-types
const SocketContextProvider = ({ children }) => {
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState('')
  const [userVideo, setUserVideo] = useState([]);
  const [myVideo, setMyVideo] = useState(null);
  const [room, setRoom] = useState(""); // make the room controlled cause of the input
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [speakerOpen, setSpeakerOpen] = useState(false); // spaker
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoType, setVideoType] = useState(1); // 1 camera,  0 screen
  const [videoQuality, setVideoQuality] = useState('h'); // h m l
  const [roomCreating, setRoomCreating] = useState(false);
  const [roomJoinning, setRoomJoinning] = useState(false);
  const [roomJoinned, setRoomJoinned] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomErrorMsg, setRoomErrorMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const { message } = useContext(MessageContext)

  const me = useRef('');
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const stream = useRef(null); // useEffect里面只能拿到初始值，故出此下策
  const usersRef = useRef([]); // 同上
  const messagesRef = useRef([]); // 同上

  useEffect(() => {
    socket.once('me', (id) => me.current = id);

    socket.on('createRoomSuccess', ({ room }) => {
      setRoom(room)
      setRoomCreating(false);
      setRoomCreated(true);
      message.success('创建成功')
    })

    socket.on('joined', ({ users, newUser, room }) => {
      message.info(`${newUser.name}进入了房间`)
      setRoom(room);
      usersRef.current = users;
      setUsers([...usersRef.current]);
      if (users.length === 1) {
        setRoomJoinning(false)
        setRoomJoinned(true);
        return;
      }

      // 与未连接的用户建立连接
      users.forEach(user => {
        if (user.id !== socket.id && !peers[user.id]) {
          getPeerConnection(user.id, user.name, newUser.id !== socket.id);
        }
      })
    })

    // 每次收到peerConn，取出对应的signal事件执行
    socket.on('peerConn', ({ from, signal }) => {
      eventBucket.current[from] && eventBucket.current[from](signal);
    })

    socket.on('setVoice', ({ userId, open }) => {
      const user = usersRef.current.find(user => user.id === userId);
      if (user) {
        user.voice = open;
        setUsers([...usersRef.current])
      }
    })

    socket.on('setVideo', ({ userId, open }) => {
      const user = usersRef.current.find(user => user.id === userId);
      if (user) {
        user.video = open;
        setUsers([...usersRef.current])
      }
    })

    socket.on('removeUser', ({ userId, name }) => {
      peers[userId].destroy()
      message.info(`${name}离开了房间`)
      usersRef.current.splice(usersRef.current.findIndex(e => e.id === userId), 1)
      setUsers([...usersRef.current])
    })

    socket.on('joinError', ({ msg }) => {
      message.error(msg);
      setRoomErrorMsg(msg);
      setRoomJoinning(false);
    })

    socket.on('sendMessage', (data) => {
      messagesRef.current.push(data);
      setMessages([...messagesRef.current]);
    })

  }, [])

  const getPeerConnection = (userId, userName, isInitiator) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false
      // config: {
      //   iceServers: [
      //     { urls: 'stun:stun.l.google.com:19302' },
      //     { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
      //   ]
      // }
    })

    peer.on('signal', (signal) => {
      socket.emit('peerConn', { signal, to: userId, from: me.current, name, isInitiator })
    })

    peer.on('stream', (stream) => {
      // console.log('onStream', stream)
      const user = usersRef.current.find(user => user.id === userId)
      user.stream = stream;
      setUsers([...usersRef.current])
    })

    peer.on('track', (track) => {
      const user = usersRef.current.find(user => user.id === userId)
      // console.log('onTrack', track)
      if (user && user.stream) {
        // console.log(user.stream.getTracks())
      }

    })

    peer.on('connect', () => {
      if (stream.current)
        peer.addStream(stream.current);
      console.log('connected')
      const user = usersRef.current.find(user => user.id === userId);
      user && (user.peerConnected = true);
      setUsers([...usersRef.current]);
      peers[userId] = peer;
      setRoomJoinning(false);
      setRoomJoinned(true);
    })

    peer.once('close', () => {
      delete peers[userId];
    })

    peer.on('error', (err) => {
      console.log(err);
      setRoomJoinning(false);
      setRoomErrorMsg('音视频连接失败')
    })

    // 收集signal事件，待socket响应时触发
    eventBucket.current[userId] = (signal) => peer.signal(signal)
  }

  const initMyVoice = (open) => {

    // 关闭麦克风
    if (!open) {
      if (!stream.current) return;
      const oldMicroPhoneTrack = stream.current.getAudioTracks().find(track => track.label !== 'System Audio')
      oldMicroPhoneTrack && oldMicroPhoneTrack.stop()
      socket.emit('setVoice', { id: me.current, open, room })
      setVoiceOpen(open)

      return;
    }

    // 打开音频
    const originStream = stream.current;
    const handlePromise = (currentStream) => {
      setVoiceOpen(open)
      socket.emit('setVoice', { id: me.current, open, room })

      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream)
      }
      const oldMicroPhoneTrack = stream.current.getAudioTracks().find(track => track.label !== 'System Audio')
      const newMicroPhoneTrack = currentStream.getAudioTracks()[0];

      oldMicroPhoneTrack && stream.current.removeTrack(oldMicroPhoneTrack);
      stream.current.addTrack(newMicroPhoneTrack);
      // console.log(stream.current.getTracks())

      // 之前没有stream的话需要通知添加stream，否则更新track
      if (!originStream) {
        setMyVideo(stream.current);
        for (let peer in peers) {
          // console.log(peers[peer])
          peers[peer].addStream(stream.current)
        }
      } else {
        for (let peer in peers) {
          // 之前没有音频轨道的话需要添加，否则替换
          if (oldMicroPhoneTrack) {
            peers[peer].replaceTrack(oldMicroPhoneTrack, newMicroPhoneTrack, myVideo)
          } else {
            peers[peer].addTrack(newMicroPhoneTrack, myVideo)
          }
        }
      }
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        audio: true
      }).then(handlePromise).catch(err => {
        console.log(err);
        message.error('当前设备或浏览器不支持话筒')
      })
    } else {
      message.error('当前设备或浏览器不支持话筒')
    }

  }

  const initMyVideo = ({ type, quality = videoQuality, open }) => {

    // 关闭视频
    if (!open) {
      setVideoOpen(open)
      if (!stream.current) return;
      const oldVideoTrack = stream.current.getVideoTracks()[0];
      // 同时关掉屏幕共享的音频（已取消音频共享的功能）
      if (!type) {
        // const oldSpeakerTrack = stream.current.getAudioTracks().find(track => track.lavel === 'System Audio');
        // oldSpeakerTrack && oldSpeakerTrack.stop();
        oldVideoTrack && oldVideoTrack.stop();
      }
      socket.emit('setVideo', { id: me.current, open, room })
      return;
    }

    // 保存之前的stream用于判断之前是否addStream
    const originStream = stream.current;

    const handlePromise = (currentStream) => {
      socket.emit('setVideo', { id: me.current, open, room })
      setVideoOpen(open)
      setVideoType(type)

      // 需要监听用户停止屏幕共享的事件
      if (!type) {
        currentStream.getVideoTracks()[0].onended = () => {
          // console.log('ended')
          initMyVideo({ type, open: false })
        }
      }
      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream)
      }

      const oldVideoTrack = stream.current.getVideoTracks()[0];
      const newVideoTrack = currentStream.getVideoTracks()[0];
      oldVideoTrack && stream.current.removeTrack(oldVideoTrack);
      stream.current.addTrack(newVideoTrack);
      // console.log(oldVideoTrack, newVideoTrack)
      // 之前没有stream的话需要通知添加stream
      if (!originStream) {
        setMyVideo(stream.current);
        for (let peer in peers) {
          // console.log(peers[peer])
          peers[peer].addStream(stream.current)
        }
      } else {
        for (let peer in peers) {
          // 视频轨道的替换或新增
          if (oldVideoTrack) {
            oldVideoTrack.stop();
            peers[peer].replaceTrack(oldVideoTrack, newVideoTrack, myVideo)
          } else {
            peers[peer].addTrack(newVideoTrack, myVideo)
          }
        }
      }
    }
    // camera 1  or screen 0
    if (type) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: qualities[quality]
        }).then(handlePromise).catch(() => {
          message.error('当前设备或浏览器不支持摄像头')
        })
      } else {
        message.error('当前设备或浏览器不支持摄像头')
      }

    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
          video: qualities[quality]
        }).then(handlePromise).catch(err => {
          console.log(err)
          initMyVideo({ type, open: false })
          message.error('当前设备或浏览器未支持屏幕共享')
        })
      } else {
        message.error('当前设备或浏览器未支持屏幕共享')
      }

    }
  }

  const createRoom = () => {
    setRoomCreating(true);
    setName(name.trim());
    socket.emit('createRoom', { name: name.trim() })
  }

  const joinRoom = (room) => {
    if (!/^\d{9}$/.test(room)) {
      message.error('请输入正确的房间号')
      return
    }
    setRoomJoinning(true);
    setName(name.trim());
    socket.emit('joinRoom', { room, name: name.trim(), stream })
  }

  const sendMessage = (msg) => {
    socket.emit('sendMessage', { name, msg, room, time: new Date() })
  }

  return (
    <SocketContext.Provider value={{ me, call, callAccepted, callEnded, myVideo, setMyVideo, name, setName, initMyVideo, createRoom, joinRoom, peers, voiceOpen, initMyVoice, videoOpen, videoType, room, setRoom, roomCreating, roomJoinning, roomCreated, roomJoinned, setRoomCreated, roomErrorMsg, users, speakerOpen, videoQuality, setVideoQuality, messages, setMessages, sendMessage }}>
      {children}
    </SocketContext.Provider>
  )

}

export { SocketContextProvider, SocketContext }