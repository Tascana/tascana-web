import React from 'react'
import cn from 'classnames'

import styles from './SignInButton.module.scss'

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
}

const SignInButton: React.FC<SignInButtonProps> = ({
  text,
  provider = SignInButtonProvider.NONE,
  size = SignInButtonSize.M,
  className,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(styles.root, styles[`_${provider}`], styles[`_${size}`], className)}
  >
    {text}
  </button>
)

export { SignInButtonProvider, SignInButtonSize, SignInButton }
