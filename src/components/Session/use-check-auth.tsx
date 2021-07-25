// @ts-nocheck
import { useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FirebaseContext } from '../Firebase'

const useCheckAuth = condition => {
  const history = useHistory()
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)
  const authUser = useSelector(state => state.user)

  useEffect(() => {
    const listener = firebase.onAuthUserListener(
      authUser => {
        if (!condition(authUser)) {
          history.push('/signin')
        } else {
          dispatch({ type: 'SIGN_IN', payload: authUser })
        }
      },
      () => history.push('/signin'),
    )

    return function cleanup() {
      listener()
    }
  }, []) // eslint-disable-line

  return condition(authUser)
}

export default useCheckAuth
