import React, { useState, useContext, useRef } from 'react'
import { useSelector } from 'react-redux'
import useOnClickOutside from 'use-onclickoutside'
import { FirebaseContext } from '../Firebase'
import classes from './styles.module.scss'

function Header() {
  const [isOpenSettings, toggleSettings] = useState(false)
  const user = useSelector(state => state.session.authUser)
  const firebase = useContext(FirebaseContext)
  const ref = useRef(null)

  useOnClickOutside(ref, () => toggleSettings(false))

  return (
    <header className={classes.header}>
      <div className={classes.left}>
        <div className={classes.logo}>T</div>
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
          <p className={classes.username}>{user.username}</p>
          <div
            className={classes.avatar}
            style={{
              backgroundImage: `url(${user.providerData.photoURL})`,
            }}
          />
          {isOpenSettings ? (
            <div className={classes.settings}>
              <button type="button">Settings</button>
              <div className={classes.separator} />
              <button type="button">About</button>
              <div className={classes.separator} />
              <button
                type="button"
                onClick={() => {
                  firebase.signOut()
                }}
              >
                Log Out
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

export default Header
