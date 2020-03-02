import React from 'react'
import { format } from 'date-fns'
import styles from './styles.module.scss'
import { Video } from './video'
import monthVideo from './tascana_month_video.mp4'

export const MonthGoalsDemo = () => {
  return (
    <section className={styles.Section}>
      <div className={styles.DescriptionBlock}>
        <h2>Make a&nbsp;plan</h2>
        <p>
          Reaching yearly goals might feel hard. But not if&nbsp;you break them
          in&nbsp;a&nbsp;few monthly priorities.
        </p>
      </div>
      <div className={styles.AbilityBlock}>
        <h3>{format(new Date(), 'MMMM')}'s targets</h3>
        <div className={styles.Tasks}>
          <Video src={monthVideo} />
        </div>
      </div>
    </section>
  )
}
