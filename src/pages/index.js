import React from 'react'
import { useSelector } from 'react-redux'
import { useCheckAuth } from '../components/Session'
import Header from '../components/Header'

function IndexPage() {
  const user = useSelector(state => state.user)
  useCheckAuth(authUser => !!authUser)

  return (
    <>
      <Header />
      <div>{JSON.stringify(user)}</div>
    </>
  )
}

export default IndexPage
