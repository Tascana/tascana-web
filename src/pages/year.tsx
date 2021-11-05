import React from 'react'
import Header from '../components/Header'
import Months from '../components/Months'
import { useAuthStateChange } from '../hooks/use-auth-state-change'

function YearPage() {
  useAuthStateChange()

  return (
    <>
      <Header />
      <Months />
    </>
  )
}

export default YearPage
