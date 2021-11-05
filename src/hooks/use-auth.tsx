import { useContext } from 'react'
import { useSelector } from 'react-redux'
import { useLocalStorage } from 'react-use'

import { IAuthProvider, AuthContext } from '../context/auth'
import { User } from '../entities/user'
import { AUTH_USER_STORAGE_KEY } from '../constants/storage'

export const useAuth = (): [IAuthProvider, User | null] => {
  const [storageUser] = useLocalStorage(AUTH_USER_STORAGE_KEY)
  // @ts-ignore
  const user = useSelector(state => state.session.authUser) || storageUser
  const context = useContext(AuthContext)

  return [context, user]
}
