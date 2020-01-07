import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { FirebaseContext } from '../Firebase'

function SignInFacebook() {
  const [error, setError] = useState(null)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  return (
    <form
      onSubmit={event => {
        firebase
          .signInWithFacebook()
          .then(socialAuthUser =>
            firebase.user(socialAuthUser.user.uid).set({
              username: socialAuthUser.additionalUserInfo.profile.name,
              email: socialAuthUser.additionalUserInfo.profile.email,
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
      <button type="submit">Sign in with Facebook</button>
      {error && <p>{error.message}</p>}
    </form>
  )
}

export default SignInFacebook
