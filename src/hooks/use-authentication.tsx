// @ts-nocheck
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import session from '../redux/session'
import { useAuth } from './use-auth'

function useAuthentication() {
  const dispatch = useDispatch()
  const auth = useAuth()
  const { setAuthUser } = session.actions

  useEffect(() => {
    const listener = auth.onAuthUserListener(
      authUser => {
        localStorage.setItem('authUser', JSON.stringify(authUser))
        dispatch(setAuthUser(authUser))
      },
      () => {
        localStorage.removeItem('authUser')
        dispatch(setAuthUser(null))
      },
    )
    return function cleanup() {
      listener()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useAuthentication
