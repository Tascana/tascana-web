import React, { useCallback, useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLogger } from '../../hooks/use-logger'
import { INDEX_PAGE_PATH, LOGIN_PAGE_PATH } from '../../constants/route'

import session from '../../redux/session'

enum SignInButtonProvider {
  NONE = 'none',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

function SignInEndPointFacebook() {
  const history = useHistory()
  const { logEvent } = useLogger()

  const [error, setError] = useState(null)

  function onError(error: any) {
    setError(error.message)
    window.location.href = LOGIN_PAGE_PATH
  }

  function onSignIn() {
    logEvent('signin')
    setError(null)
    history.push(INDEX_PAGE_PATH)
  }
  const [{ signInWithFacebook, signInWithGoogle }, user] = useAuth()

  const provider = SignInButtonProvider.GOOGLE // Change this
  const dispatch = useDispatch()
  const { setAuthUser } = session.actions
  const signInFn = useCallback(() => {
    const map = {
      [SignInButtonProvider.NONE]: () => Promise.resolve(null),
      [SignInButtonProvider.GOOGLE]: signInWithGoogle,
      [SignInButtonProvider.FACEBOOK]: signInWithFacebook,
    }

    return map[provider]()
      .then(user => {
        dispatch(setAuthUser(user))
        return user
      })
      .then(onSignIn)
      .catch(onError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signInWithGoogle, signInWithFacebook, provider])

  if (user) {
    history.push(INDEX_PAGE_PATH)
    return null
  }
  signInFn()

  return <></>
}

export default SignInEndPointFacebook
