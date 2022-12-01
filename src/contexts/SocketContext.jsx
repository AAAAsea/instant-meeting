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
  const [publicRooms, setPublicRooms] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [canScreenShare, setCanScreenShare] = useState(true);

  const { message } = useContext(MessageContext)

  const me = useRef('');
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const stream = useRef(null); // useEffect里面只能拿到初始值，故出此下策
  const usersRef = useRef([]); // 同上
  const messagesRef = useRef([]); // 同上
  const roomJoinnedCbRef = useRef(null);
  const roomCreatedCbRef = useRef(null);

  useEffect(() => {
    socket.on('me', (id) => me.current = id);

    socket.on('setPublicRooms', (publicRooms) => {
      setPublicRooms([...publicRooms])
    })

    socket.on('createRoomSuccess', ({ room, id, name }) => {
      setRoom(room)
      setRoomCreating(false);
      setRoomCreated(true);
      setRoomJoinned(true);
      roomCreatedCbRef.current && roomCreatedCbRef.current(room);
      roomCreatedCbRef.current = null;
      setUsers([{ id, name, peerConnected: true }]); // 只有我自己
      message.success('创建成功')
    })

    socket.on('joined', ({ users, newUser, room, isLive, canScreenShare }) => {
      if (newUser.id === me.current) {
        roomJoinnedCbRef.current && roomJoinnedCbRef.current();
        roomJoinnedCbRef.current = null;
      }
      message.info(`${newUser.name}进入了房间`)
      setRoom(room);
      setIsLive(isLive);
      setCanScreenShare(canScreenShare);
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
        if (usersRef.current.findIndex(e => e.id === user.id) < 0) {
          usersRef.current.push(user)
        }
      })
      setUsers([...usersRef.current]);

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

    socket.on('setVideo', ({ userId, open, type }) => {
      const user = usersRef.current.find(user => user.id === userId);
      if (user) {
        user.video = open;
        setUsers([...usersRef.current])
      }
      if (!type) {
        setCanScreenShare(!open);
      }
    })

    socket.on('removeUser', ({ userId, name }) => {
      peers[userId] && peers[userId].destroy()
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
      // console.log('smg', data)
      messagesRef.current.push(data);
      setMessages([...messagesRef.current]);
    })

    socket.on('disconnect', () => {
      message.error('已断开连接')
      setRoomErrorMsg('已断开连接')
    })

    socket.on('connection', () => {
      message.success('已连接')
    })

  }, [])

  const getPeerConnection = (userId, userName, isInitiator) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: 'turn:124.221.154.52:3478',
            credential: 'password',
            username: 'username'
          }
        ]
      }
    })

    peer.on('signal', (signal) => {
      socket.emit('peerConn', { signal, to: userId, from: me.current, name, isInitiator })
    })

    peer.on('stream', (stream) => {
      const user = usersRef.current.find(user => user.id === userId)
      user.stream = stream;
      setUsers([...usersRef.current])
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
      message.success(`与${userName}已连接`)

    })

    peer.on('close', () => {
      const user = usersRef.current.find(user => user.id === userId);
      user && (user.peerConnected = false);
      delete peers[userId];
    })

    peer.on('error', (err) => {
      const user = usersRef.current.find(user => user.id === userId);
      user && (user.peerConnected = false);
      console.log(err);
      setRoomJoinning(false);
      setRoomErrorMsg('音视频连接失败')
      message.error(`与${userName}连接失败`)
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
      oldVideoTrack && oldVideoTrack.stop();
      const oldAudioTrack = stream.current.getAudioTracks()[0];
      oldAudioTrack && oldAudioTrack.stop();
      socket.emit('setVideo', { id: me.current, open, room, type })
      return;
    }

    // 保存之前的stream用于判断之前是否addStream
    const originStream = stream.current;

    const handlePromise = (currentStream) => {
      socket.emit('setVideo', { id: me.current, open, room, type })
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

      const newAudioTrack = currentStream.getAudioTracks()[0];
      const oldAudioTrack = stream.current.getAudioTracks()[0];
      if (newAudioTrack && isLive) {
        oldAudioTrack && stream.current.removeTrack(oldAudioTrack);
        stream.current.addTrack(newAudioTrack);
      }

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
          } else if (newVideoTrack) {
            peers[peer].addTrack(newVideoTrack, myVideo)
          }

          // 视频轨道的替换或新增
          if (oldAudioTrack) {
            oldAudioTrack.stop();
            peers[peer].replaceTrack(oldAudioTrack, newAudioTrack, myVideo)
          } else if (newAudioTrack) {
            peers[peer].addTrack(newAudioTrack, myVideo)
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
          video: qualities[quality],
          audio: isLive
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

  const createRoom = (data) => {
    // console.log('createRoom')
    setRoomCreating(true);
    setName(name.trim());
    socket.emit('createRoom', data)
  }

  const joinRoom = ({ room, roomPwd }) => {
    if (room === '') {
      message.error('请输入房间号')
      return
    }
    setRoomJoinning(true);
    setName(name.trim());
    socket.emit('joinRoom', { room, name: name.trim(), roomPwd })
  }

  const leaveRoom = (room) => {
    setName('');
    setRoom('');
    setRoomJoinned(false);
    messagesRef.current = [];
    setMessages([])
    socket.emit('leaveRoom', { room, name: name.trim() })
  }

  const getPublicRooms = () => {
    socket.emit('getPublicRooms');
  }

  const sendMessage = (msg) => {
    // console.log(msg, room)
    socket.emit('sendMessage', { name, msg, room, time: new Date() })
  }

  return (
    <SocketContext.Provider value={{ me, call, callAccepted, callEnded, myVideo, setMyVideo, name, setName, initMyVideo, createRoom, joinRoom, peers, voiceOpen, initMyVoice, videoOpen, videoType, room, setRoom, roomCreating, roomJoinning, roomCreated, roomJoinned, setRoomCreated, roomErrorMsg, users, setUsers, speakerOpen, videoQuality, setVideoQuality, messages, setMessages, sendMessage, getPublicRooms, publicRooms, roomJoinnedCbRef, roomCreatedCbRef, setRoomJoinned, leaveRoom, isLive, setIsLive, canScreenShare }}>
      {children}
    </SocketContext.Provider>
  )

}

export { SocketContextProvider, SocketContext }