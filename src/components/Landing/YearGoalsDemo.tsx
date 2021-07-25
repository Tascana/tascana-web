// @ts-nocheck
import React from 'react'
import { format } from 'date-fns'
import cx from 'classnames'
import styles from './styles.module.scss'
import yearVideo from './tascana_year_video.mp4'
import { Video } from './video'

export const YearGoalsDemo = () => {
  return (
    <section className={cx(styles.Section, styles.YearsSection)}>
      <div className={styles.DescriptionBlock}>
        <h2>
          Focus on&nbsp;<nobr>long-term</nobr> impact
        </h2>
        <p>
          It&nbsp;is&nbsp;irrelevant what you achieve on&nbsp;the February, 2
          along, though it&nbsp;is&nbsp;important what you achieve
          in&nbsp;a&nbsp;year.
        </p>
        <p>
          In&nbsp;Tascana we&nbsp;help you define what is&nbsp;truly important
          in&nbsp;the next 12 months
        </p>
      </div>
      <div className={styles.AbilityBlock}>
        <h3>{format(new Date(), 'yyyy')}'s goals</h3>
        <div className={styles.Tasks}>
          <Video src={yearVideo} />
        </div>
      </div>
    </section>
  )
}
