import {
  format,
  isSameDay,
  isYesterday,
  isTomorrow,
  isSameMonth,
  getYear,
  differenceInCalendarMonths,
} from 'date-fns/esm'
import { YEAR, MONTH, DAY } from '../../constants/task-types'

export function translateDay(date, dateFormat = 'EEEE, d') {
  const now = new Date()

  if (isSameDay(now, date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (isTomorrow(date)) return 'Tomorrow'

  return format(date, dateFormat)
}

export function translateMonth(date) {
  const now = new Date()

  if (isSameMonth(now, date)) return 'This month'
  if (differenceInCalendarMonths(date, now) === -1) return 'Previous month'
  if (differenceInCalendarMonths(date, now) === 1) return 'Next month'

  return format(date, 'MMMM')
}

export function extractHeight(parent, dx) {
  var a = []
  parent.current.childNodes.forEach(i => {
    a.push(i.children[0].scrollHeight + 40)
  })
  return dx > 0 ? [a[0], a[1]] : [a[1], a[2]]
}

export const getDateObject = (type, year, month, day) => {
  switch (type) {
    case YEAR:
      return {
        year,
      }
    case MONTH:
      return {
        year,
        month: month + 1,
      }
    case DAY:
      return {
        year,
        month: month + 1,
        day,
      }
    default:
      break
  }
}

export const getName = (type, date) => {
  switch (type) {
    case YEAR:
      return getYear(date)
    case MONTH:
      return translateMonth(date)
    case DAY:
      return translateDay(date)
    default:
      break
  }
}
