import { Button } from '@mui/material'
import { ButtonGroup } from '@mui/material'
import React from 'react'
import { NavLink } from 'react-router-dom'
import './index.css'
const TopNavBar = () => {
  return (
    <nav>
      <ButtonGroup variant="text" aria-label="text button group">
        <Button>
          <NavLink to='/' activeclassname="active" >加入</NavLink>
        </Button>
        <Button>
          <NavLink to='/user' activeclassname="active">创建</NavLink>
        </Button>
      </ButtonGroup>
    </nav>
  )
}

export default TopNavBar