import React, { FC, ReactNode } from 'react'
import cn from 'classnames'

import styles from './Wrapper.module.scss'

interface WrapperProps {
  children: ReactNode
  className?: string
}

export const Wrapper: FC<WrapperProps> = ({ children, className }) => (
  <div className={cn(styles.root, className)}>{children}</div>
)
