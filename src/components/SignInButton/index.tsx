import React, { useCallback } from 'react'
import cn from 'classnames'

import styles from './SignInButton.module.scss'
import { useAuth } from '../../hooks/use-auth'
import { User } from '../../entities/user'
import { useDispatch } from 'react-redux'
import session from '../../redux/session'

enum SignInButtonProvider {
  NONE = 'none',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

enum SignInButtonSize {
  S = 'small',
  M = 'medium',
}

interface SignInButtonProps {
  text: string
  provider?: SignInButtonProvider
  size?: SignInButtonSize
  className?: string
  onClick?: () => void
  onSignInSuccess?: (user: User | null) => void
  onSignInFailure?: (error: Error) => void
}

const SignInButton: React.FC<SignInButtonProps> = ({
  text,
  provider = SignInButtonProvider.NONE,
  size = SignInButtonSize.M,
  className,
  onClick,
  onSignInSuccess,
  onSignInFailure,
}) => {
  const [{ signInWithFacebook, signInWithGoogle }] = useAuth()
  const classes = cn(styles.root, styles[`_${provider}`], styles[`_${size}`], className)
  const dispatch = useDispatch()
  const { setAuthUser } = session.actions
  const signInFn = useCallback(() => {
    const map = {
      [SignInButtonProvider.NONE]: () => Promise.resolve(null),
      [SignInButtonProvider.GOOGLE]: signInWithGoogle,
      [SignInButtonProvider.FACEBOOK]: signInWithFacebook,
    }

    return map[provider]()
      .then(user => {
        dispatch(setAuthUser(user))
        return user
      })
      .then(onSignInSuccess)
      .catch(onSignInFailure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signInWithGoogle, signInWithFacebook, provider, onSignInSuccess, onSignInFailure])

  return (
    <button
      type="button"
      onClick={() => {
        signInFn()
        onClick && onClick()
      }}
      className={classes}
    >
      {text}
    </button>
  )
}

export { SignInButtonProvider, SignInButtonSize, SignInButton }
