import { ChatRounded } from '@mui/icons-material'
import { GroupRounded } from '@mui/icons-material'
import { VideoCameraFrontRounded } from '@mui/icons-material'
import { VideocamRounded } from '@mui/icons-material'
import { Tabs } from '@mui/material'
import { Button } from '@mui/material'
import { Tab } from '@mui/material'
import { ButtonGroup } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import './index.css'
const TopNavBar = (props) => {
  // eslint-disable-next-line react/prop-types
  const { value, onChange } = props;
  return (
    <nav>
      <Tabs centered textColor='inherit' value={value} onChange={(e, val) => { onChange(val) }} >
        <Tab icon={<VideoCameraFrontRounded />} />
        <Tab icon={<GroupRounded />} />
      </Tabs>
    </nav>
  )
}

export default TopNavBar