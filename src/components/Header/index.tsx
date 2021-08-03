// @ts-nocheck
import React, { useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import cn from 'classnames'
import useOnClickOutside from 'use-onclickoutside'

import { Logo } from '../Logo'
import { Avatar } from '../Avatar'
import { ProfileSettings } from '../ProfileSettings'
import { Wrapper } from '../Wrapper'
import Datepicker from '../Datepicker'
import { useAuth } from '../../hooks/use-auth'
import { INDEX_PAGE_PATH } from '../../constants/route'

import styles from './Header.module.scss'

function Header() {
  const [isOpenSettings, setIsOpenSettings] = useState(false)
  const [, { name, avatar }] = useAuth()
  const history = useHistory()
  const ref = useRef()
  const isIndexPage = history.location.pathname === INDEX_PAGE_PATH

  useOnClickOutside(ref, () => setIsOpenSettings(false))

  return (
    <header className={styles.root}>
      <div className={styles.content}>
        <Logo
          className={cn(styles.logo, isIndexPage && styles.logo_disable)}
          onClick={() => history.push(INDEX_PAGE_PATH)}
        />

        <Wrapper>
          <Datepicker />
        </Wrapper>

        <div
          ref={ref}
          className={styles.profile}
          onClick={() => setIsOpenSettings(!isOpenSettings)}
        >
          <div className={styles.username}>{name}</div>
          <Avatar avatar={avatar} />

          {isOpenSettings && (
            <div className={styles.settings}>
              <ProfileSettings />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
