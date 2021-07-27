import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import session from '../redux/session'
import { useAuth } from './use-auth'
import { User } from '../entities/user'

const AUTH_USER_STORAGE_KEY = 'authUser'

export const useAuthStateChange = (): void => {
  const history = useHistory()
  const dispatch = useDispatch()
  const [{ onAuthStateChanged }] = useAuth()
  const { setAuthUser } = session.actions
  const onSignIn = (user: User): void => {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
    dispatch(setAuthUser(user))
  }
  const onSignOut = (): void => {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    dispatch(setAuthUser(null))
    history.push('/signin')
  }

  useEffect(() => {
    const subscription = onAuthStateChanged(onSignIn, onSignOut)
    return () => subscription()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
