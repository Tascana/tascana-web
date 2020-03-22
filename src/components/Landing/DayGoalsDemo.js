import React from 'react'
import styles from './styles.module.scss'
import dayVideo from './tascana_day_video.mp4'
import { Video } from './video'

export const DayGoalsDemo = () => {
  return (
    <section className={styles.Section}>
      <div className={styles.DescriptionBlock}>
        <h2>Use natural breaks</h2>
        <p>
          It is impossible to predict how many minutes or hours a given task
          will take, so why bother?
        </p>
        <p>
          We help you to group context-related tasks together and put them in
          one of 3 available time slots: morning, afternoon, and evening.
        </p>
      </div>
      <div className={styles.AbilityBlock}>
        <h3>Today's plan</h3>
        <div className={styles.Tasks}>
          <Video src={dayVideo} />
        </div>
      </div>
    </section>
  )
}
