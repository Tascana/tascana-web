import React from 'react'
import { useHistory } from 'react-router-dom'
import { getYear, addYears } from 'date-fns'
import months from '../../constants/months'
import classes from './styles.module.scss'

const date = new Date()

const currentYear = getYear(date)
const nextYear = getYear(addYears(date, 1))

function Years() {
  const history = useHistory()
  const years = [nextYear, currentYear]

  function toYearPage(year) {
    history.push(`/${year}`)
  }

  return (
    <ul className={classes.wrapper}>
      {years.map(year => (
        <li key={year} className={classes.year}>
          <h2>{year}</h2>
          <ul className={classes.months}>
            {months.map(month => (
              <li
                role="link"
                onClick={() => {
                  toYearPage(year)
                }}
                key={month}
                className={classes.month}
              >
                <div className={classes.item}>
                  <div className={classes.content}></div>
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

export default Years
