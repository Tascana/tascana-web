export function extractHeight(parent, dx) {
  var arr = []

  parent.current.childNodes.forEach(i => {
    arr.push(i.children[0].scrollHeight + 40)
  })

  return dx > 0 ? [arr[0], arr[1]] : [arr[1], arr[2]]
}

export function translateDay(date: Date) {
  const now = new Date(Date.now())
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
    return 'Today'

  now.setDate(now.getDate() - 1)
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
    return 'Yesterday'

  now.setDate(now.getDate() + 2)
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
    return 'Tomorrow'

  return date.toLocaleDateString()
}

export const translateYear = year => year

export function translateMonth(month, year) {
  const now = new Date(Date.now())

  if (now.getMonth() + 1 === month && now.getFullYear() === year)
    return 'This month'

  now.setMonth(now.getMonth() - 1)
  if (
    now.getMonth() + 1 === month &&
    now.getFullYear() === (month - 1 < 1 ? year - 1 : year)
  )
    return 'Previous month'

  now.setMonth(now.getMonth() + 2)
  if (
    now.getMonth() + 1 === month &&
    now.getFullYear() === (month + 1 > 12 ? year + 1 : year)
  )
    return 'Next month'

  switch (month) {
    case 1:
      return 'January'
    case 2:
      return 'February'
    case 3:
      return 'March'
    case 4:
      return 'April'
    case 5:
      return 'May'
    case 6:
      return 'June'
    case 7:
      return 'July'
    case 8:
      return 'August'
    case 9:
      return 'September'
    case 10:
      return 'October'
    case 11:
      return 'November'
    case 12:
      return 'December'
    default:
      break
  }
}
