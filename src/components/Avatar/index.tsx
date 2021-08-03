import React, { FC } from 'react'
import cn from 'classnames'

import styles from './Avatar.module.scss'

interface AvatarProps {
  avatar?: string
  className?: string
}

export const Avatar: FC<AvatarProps> = ({ className, avatar }) => (
  <div className={cn(styles.root, className)} style={{ backgroundImage: `url(${avatar})` }} />
)
