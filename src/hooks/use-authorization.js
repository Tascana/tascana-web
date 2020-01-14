import { useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../components/Firebase'

function useAuthorization(condition) {
  const history = useHistory()
  const firebase = useContext(FirebaseContext)
  const authUser = useSelector(state => state.session.authUser)

  useEffect(() => {
    const listener = firebase.onAuthUserListener(
      authUser => {
        if (!Boolean(authUser)) {
          history.push('/signin')
        }
      },
      () => history.push('/signin'),
    )

    return function cleanup() {
      listener()
    }
  }, []) // eslint-disable-line

  return Boolean(authUser)
}

export default useAuthorization
