import React, { FC } from 'react'
import cn from 'classnames'

import styles from './Logo.module.scss'

interface LogoProps {
  className?: string
  onClick?: () => void
}

export const Logo: FC<LogoProps> = ({ className, onClick }) => (
  <div className={cn(styles.root, className)} onClick={onClick}>
    T
  </div>
)
