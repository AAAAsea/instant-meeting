import isElectron from 'is-electron';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { AlertDialog } from '../MUI'

const UpdateModel = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClose = ()=>{
    if(isUpdating) return;
    setOpen(false)
  }
  const handleConfirm = ()=>{
    if(isUpdating) return;
    window.electron.ipcRenderer.send('startUpdate');
    setIsUpdating(true);
    setContent("开始下载...")
  }

  useEffect(()=>{
    if(isElectron()){
      window.electron.onUpdateMessage((_event, data) => {
        const {type,info} = data;
        if(type==="update-available")
        {
          setOpen(true);
          setContent("发现新版本，是否立即更新？")
        }
        else
          setContent(info);
      });
    }
  }, [])

  return (
    <AlertDialog 
    handleClose={handleClose}
    open={open}
    content={content}
    title="更新"
    handleConfirm={handleConfirm}
    handleCancel={handleClose}
    confirmTitle="立即更新"
    cancelTitle="暂不更新"
    />
  )
}

export default UpdateModel