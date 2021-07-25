// @ts-nocheck
import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { FirebaseContext } from '../Firebase'

function SignInGoogle() {
  const [error, setError] = useState(null)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  return (
    <form
      onSubmit={async event => {
        firebase
          .signInWithGoogle()
          .then(socialAuthUser =>
            firebase.user(socialAuthUser.user.uid).set({
              username: socialAuthUser.user.displayName,
              email: socialAuthUser.user.email,
            }),
          )
          .then(() => {
            setError(null)
            history.push('/')
          })
          .catch(error => {
            setError(error)
          })

        event.preventDefault()
      }}
    >
      <button type="submit">Sign in with Google</button>
      {error && <p>{error.message}</p>}
    </form>
  )
}

export default SignInGoogle
