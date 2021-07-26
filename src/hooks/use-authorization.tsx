// @ts-nocheck
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from './use-auth'

function useAuthorization() {
  const history = useHistory()
  const auth = useAuth()
  const authUser = useSelector(state => state.session.authUser)

  useEffect(() => {
    const listener = auth.onAuthUserListener(
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

  return authUser
}

export default useAuthorization
