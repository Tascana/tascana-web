import React from 'react'
import { useSelector } from 'react-redux'
import { useCheckAuth } from '../components/Session'
import SignOut from '../components/SignOut'

function IndexPage() {
  const user = useSelector(state => state.user)
  useCheckAuth(authUser => !!authUser)

  return (
    <div>
      {JSON.stringify(user)}
      <SignOut />
    </div>
  )
}

export default IndexPage
