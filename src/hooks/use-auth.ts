import { useContext } from 'react'
import { useSelector } from 'react-redux'

import { IAuthProvider, AuthContext } from '../context/auth'
import { User } from '../entities/user'

export const useAuth = (): [IAuthProvider, User | null] => {
  // @ts-ignore
  const user = useSelector(state => state.session.authUser)
  const context = useContext(AuthContext)

  return [context, user]
}
