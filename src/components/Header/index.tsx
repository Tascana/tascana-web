import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import useOnClickOutside from 'use-onclickoutside'
import classes from './styles.module.scss'
import Datepicker from '../Datepicker'
import { useAuth } from '../../hooks/use-auth'
import { useLogger } from '../../hooks/use-logger'

function Header() {
  const [isOpenSettings, toggleSettings] = useState(false)
  // @ts-ignore
  const user = useSelector(state => state.session.authUser)
  const [{ signOut }] = useAuth()
  const { logEvent } = useLogger()
  const ref = useRef(null)

  useOnClickOutside(ref, () => toggleSettings(false))

  return (
    <header className={classes.header}>
      <div className={classes.content}>
        <div className={classes.left}>
          <div className={classes.logo}>T</div>
        </div>
        <div className={classes.center}>
          <div>
            <Datepicker />
          </div>
        </div>
        {user ? (
          <div
            ref={ref}
            className={classes.right}
            onClick={() => {
              if (isOpenSettings) toggleSettings(false)
              else toggleSettings(true)
            }}
          >
            <p className={classes.username}>{user.name}</p>
            <div
              className={classes.avatar}
              style={{
                backgroundImage: `url(${user.avatar})`,
              }}
            />
            {isOpenSettings ? (
              <div className={classes.settings}>
                {/* <button type="button">Settings</button>
                <div className={classes.separator} />
                <button type="button">About</button>
                <div className={classes.separator} /> */}
                <button
                  type="button"
                  onClick={() => {
                    logEvent('logged_out')
                    signOut()
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Header
