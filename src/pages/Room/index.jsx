import React from 'react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Create from '../../components/Create'
import Join from '../../components/Join'
import TopNavBar from '../../components/TopNavBar'

const Room = () => {
  const [search, setSearch] = useSearchParams();
  const type = search.get('type');

  const [value, setValue] = useState(type === 'create' ? 0 : 1)

  return (
    <div id="room">
      <TopNavBar value={value} onChange={setValue} />
      {
        value ? <Join /> : <Create />
      }
    </div>
  )
}

export default Room