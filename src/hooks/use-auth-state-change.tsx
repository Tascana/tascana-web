import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import session from '../redux/session'
import { useAuth } from './use-auth'
import { User } from '../entities/user'
import { AUTH_USER_STORAGE_KEY } from '../constants/storage'
import { LOGIN_PAGE_PATH } from '../constants/route'

export const useAuthStateChange = (): void => {
  const history = useHistory()
  const dispatch = useDispatch()
  const [{ onAuthStateChanged }] = useAuth()
  const [, setItem, removeItem] = useLocalStorage(AUTH_USER_STORAGE_KEY)
  const { setAuthUser } = session.actions
  const onSignIn = (user: User): void => {
    setItem(user)
    dispatch(setAuthUser(user))
  }
  const onSignOut = (): void => {
    removeItem()
    dispatch(setAuthUser(null))
    history.push(LOGIN_PAGE_PATH)
  }

  useEffect(() => {
    const subscription = onAuthStateChanged(onSignIn, onSignOut)
    return () => subscription()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
