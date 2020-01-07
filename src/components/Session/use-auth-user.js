import { useEffect, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { FirebaseContext } from '../Firebase'

const useAuthUser = () => {
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  useEffect(() => {
    const listener = firebase.onAuthUserListener(
      authUser => {
        localStorage.setItem('authUser', JSON.stringify(authUser))
        dispatch('SIGN_IN', authUser)
      },
      () => {
        localStorage.removeItem('authUser')
        dispatch('SIGN_OUT')
      },
    )

    return function cleanup() {
      listener()
    }
  }, [firebase, dispatch])
}

export default useAuthUser
