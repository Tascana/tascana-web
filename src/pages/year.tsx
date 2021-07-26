import React from 'react'
import Header from '../components/Header'
import Months from '../components/Months'
import useAuthorization from '../hooks/use-authorization'

function YearPage() {
  useAuthorization()

  return (
    <>
      <Header />
      <Months />
    </>
  )
}

export default YearPage
