import React, { FC, useCallback } from 'react'

import styles from './ProfileSettings.module.scss'
import { useAuth } from '../../hooks/use-auth'
import { useLogger } from '../../hooks/use-logger'

interface ProfileSettingsProps {}

export const ProfileSettings: FC<ProfileSettingsProps> = () => {
  const [{ signOut }] = useAuth()
  const { logEvent } = useLogger()
  const logout = useCallback(() => {
    logEvent('logged_out')
    signOut()
  }, [signOut]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      <button type="button" className={styles.item} onClick={logout}>
        Log Out
      </button>
    </div>
  )
}
