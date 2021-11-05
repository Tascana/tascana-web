import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLogger } from '../../hooks/use-logger'
import { INDEX_PAGE_PATH, LOGIN_PAGE_PATH } from '../../constants/route'

import { User } from '../../entities/user'

import * as fb from 'firebase/app'
import 'firebase/auth'

import { firebase } from '../../index'

import session from '../../redux/session'

const FIREBASE_EMPTY_USER_INFO = { displayName: null, email: null }

const prepareUserData = ({ uid, providerData, photoURL: avatar }: fb.User): User => {
  const userInfo = Array.isArray(providerData) ? providerData[0] : null
  const { displayName: name, email } = userInfo || FIREBASE_EMPTY_USER_INFO

  return { uid, email, name, avatar }
}

function SignInEndPointGoogle() {
  const auth = firebase.getInstance().auth()
  const provider = new fb.auth.GoogleAuthProvider()
  const signInWithRedirect = () => auth.signInWithRedirect(provider)

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
  const [, user] = useAuth()

  const dispatch = useDispatch()
  const { setAuthUser } = session.actions

  if (user) {
    history.push(INDEX_PAGE_PATH)
    return null
  }
  auth
    .getRedirectResult()
    .then(function(result) {
      console.log(result)
      // The signed-in user info.
      var user = result.user
      if (user === null) {
        signInWithRedirect()
        return undefined
      }
      console.log(user)
      dispatch(setAuthUser(prepareUserData(user!)))
      onSignIn()
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code
      var errorMessage = error.message
      // The email of the user's account used.
      console.log(errorCode, errorMessage)
      // ...
      onError(error)
    })
  return <></>
}

export default SignInEndPointGoogle
