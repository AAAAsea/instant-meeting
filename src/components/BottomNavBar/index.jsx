import React from 'react'
import { useContext } from 'react'
import './index.css'
import CopyToClipboard from 'react-copy-to-clipboard'

import { ButtonGroup } from '@mui/material'
import { SocketContext } from '@/contexts/SocketContext'
import { MessageContext } from '@/contexts/MessageContext'
import { IconButton } from '@mui/material'
import { useMemo } from 'react'
import { MicRounded } from '@mui/icons-material'
import { MicOffRounded } from '@mui/icons-material'
import { VideocamRounded } from '@mui/icons-material'
import { VideocamOffRounded } from '@mui/icons-material'
import { ScreenShareRounded } from '@mui/icons-material'
import { StopScreenShareRounded } from '@mui/icons-material'
import { ShareRounded } from '@mui/icons-material'
import { FullscreenRounded } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { Hd } from '@mui/icons-material'
import { HdRounded } from '@mui/icons-material'
import { Menu } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useState } from 'react'
import { ListItemIcon } from '@mui/material'
import { Check } from '@mui/icons-material'
import { ListItemText } from '@mui/material'
import { MenuList } from '@mui/material'
import { qualities } from '../../utils'
import { TurnedInNotOutlined } from '@mui/icons-material'
import { Box } from '@mui/material'
import { FullscreenExitRounded } from '@mui/icons-material'
import { useEffect } from 'react'

const BottomNavBar = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const open = Boolean(anchorEl);
  const { initMyVideo, initMyVoice, voiceOpen, videoOpen, videoType, room, videoQuality, setVideoQuality, isLive, canScreenShare } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  // eslint-disable-next-line react/prop-types
  const { mainVideoRef, showMainVideo } = props;

  const shareLink = useMemo(() => `房间号：${room}\n房间链接：${location.href}\n快来加入我的房间吧！`, [room])

  // For Menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (quality) => {
    setAnchorEl(null);
    if (/[hmsl]/.test(quality)) {
      setVideoQuality(quality);
      initMyVideo({ type: videoType, quality, open: true })
    }
  };

  const share = () => {
    // console.log(room)
    message.success('房间已复制，快去分享吧~')
  }

  const handleFullScreen = (full) => {
    const currentFullScreenElement = document.fullscreenElement
    if (!currentFullScreenElement) {
      setIsFullScreen(true);
      if (showMainVideo)
        // eslint-disable-next-line react/prop-types
        mainVideoRef.current.requestFullscreen()
      else
        document.querySelector('#room-detail').requestFullscreen()
    } else {
      if (currentFullScreenElement) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  }

  useEffect(() => {
    window.onresize = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    }
  }, [])

  return (
    <div id="bottom">
      <ButtonGroup className='menu-btns animate__animated animate__slideInUp' variant="contained" aria-label="outlined primary button group">

        <Tooltip title={voiceOpen ? '麦克风已打开' : '麦克风已关闭'}>
          <IconButton
            style={{ visibility: isLive ? 'hidden' : 'visible' }}
            color={(voiceOpen) ? "error" : "primary"}
            onClick={() => { initMyVoice(!voiceOpen) }}
          >{
              voiceOpen ? <MicRounded /> : <MicOffRounded />
            }</IconButton>
        </Tooltip>

        <Tooltip title={(videoOpen && videoType) ? "摄像头打开" : "摄像头已关闭"}>
          <IconButton
            color={(videoOpen && videoType) ? "error" : "primary"}
            onClick={() => { initMyVideo({ type: 1, quality: 'h', open: !videoOpen || !videoType }) }}
          >{
              videoOpen && videoType ? <VideocamRounded /> : <VideocamOffRounded />
            }</IconButton>
        </Tooltip>
        <Tooltip title={(videoOpen && !videoType) ? "屏幕分享开启" : "屏幕分享已关闭"}>
          <IconButton
            color={(videoOpen && !videoType) ? "error" : "primary"}
            onClick={() => { if (!canScreenShare && !videoOpen) { message.warning("当前房间类型最多允许一人分享屏幕"); return; } initMyVideo({ type: 0, quality: 'h', open: !videoOpen || videoType }) }}
          >{
              videoOpen && !videoType ? <ScreenShareRounded /> : <StopScreenShareRounded />
            }</IconButton>
        </Tooltip>
        <Tooltip title={`当前清晰度：${qualities.desc[videoQuality]}`}>
          <IconButton
            color={"primary"}
            onClick={handleClick}
          >
            <HdRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullScreen ? '取消全屏' : '全屏'}>
          <IconButton
            color="primary"
            onClick={() => {
              handleFullScreen(!isFullScreen)
            }}
          >
            {
              isFullScreen ? <FullscreenExitRounded /> : <FullscreenRounded />
            }
          </IconButton>
        </Tooltip>
        <Tooltip title="分享">
          <Box>
            <CopyToClipboard text={shareLink}>
              <IconButton color='primary' onClick={share}><ShareRounded /></IconButton>
            </CopyToClipboard>
          </Box>
        </Tooltip>
      </ButtonGroup>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuList dense>
          {
            // console.log(Object.entries(qualities.desc))
            Object.entries(qualities.desc).map(e => (
              <MenuItem
                disabled={!videoOpen}
                onClick={() => {
                  handleClose(e[0])
                }}
                key={e[0]}
              >
                <ListItemIcon style={{
                  visibility: e[0] === videoQuality ? 'visible' : 'hidden'
                }}>
                  <Check />
                </ListItemIcon>
                <ListItemText >{e[1]}</ListItemText>
              </MenuItem>
            ))
          }
        </MenuList>
      </Menu>
    </div >
  )
}

export default BottomNavBar