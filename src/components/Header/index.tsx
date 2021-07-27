// @ts-nocheck
import React, { useState, useContext, useRef } from 'react'
import { useSelector } from 'react-redux'
import useOnClickOutside from 'use-onclickoutside'
import classes from './styles.module.scss'
import Datepicker from '../Datepicker'
import { FirebaseContext } from '../../context/firebase'
import { useAuth } from '../../hooks/use-auth'

function Header() {
  const [isOpenSettings, toggleSettings] = useState(false)
  const user = useSelector(state => state.session.authUser)
  const firebase = useContext(FirebaseContext)
  const [auth] = useAuth()
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
                    firebase.logEvent('logged_out')
                    auth.signOut()
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
