import React, { useContext } from 'react'
import { useDispatch } from 'react-redux'
import { FirebaseContext } from '../Firebase'

function SignOutButton() {
  const firebase = useContext(FirebaseContext)
  const dispatch = useDispatch()

  return (
    <button
      type="button"
      onClick={() => {
        firebase.signOut()
        dispatch({ type: 'SIGN_OUT' })
      }}
    >
      Sign Out
    </button>
  )
}

export default SignOutButton
