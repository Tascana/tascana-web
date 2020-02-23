import React from 'react'
import { useCheckAuth } from '../components/Session'
import Header from '../components/Header'
import Months from '../components/Months'

function YearPage() {
  useCheckAuth(authUser => !!authUser)

  return (
    <>
      <Header />
      <Months />
    </>
  )
}

export default YearPage
