import {
  format,
  isSameDay,
  isYesterday,
  isTomorrow,
  isSameMonth,
  differenceInCalendarMonths,
} from 'date-fns'

export function translateDay(date) {
  const now = new Date()

  if (isSameDay(now, date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (isTomorrow(date)) return 'Tomorrow'

  return format(date, 'EEEE, d')
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
