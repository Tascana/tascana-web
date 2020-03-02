import React from 'react'
import { useParams } from 'react-router-dom'
import { getDaysInMonth } from 'date-fns'
import range from 'lodash.range'
import months from '../../constants/months'
import classes from './styles.module.scss'

function Years() {
  const { year } = useParams()

  return (
    <ul className={classes.wrapper}>
      {months.map((month, index) => {
        const date = new Date(`${year}.${index + 1}.1`)
        const days = range(1, getDaysInMonth(date) + 1)

        return (
          <li key={month} className={classes.year}>
            <h2>
              {month} {year}
            </h2>
            <ul className={classes.months}>
              {days.map(day => (
                <li role="link" key={day} className={classes.month}>
                  <div className={classes.item}>
                    <div className={classes.content}></div>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ul>
  )
}

export default Years
