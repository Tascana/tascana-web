import { useEffect, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { FirebaseContext } from '../components/Firebase'
import session from '../redux/session'

function useAuthentication() {
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)
  const { setAuthUser } = session.actions

  useEffect(() => {
    const listener = firebase.onAuthUserListener(
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
