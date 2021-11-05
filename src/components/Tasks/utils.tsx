// @ts-nocheck
import { rainbow } from '../../constants/rainbow'

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

// eslint-disable-next-line
export const getTodosByType = (
  store,
  type,
  year = -1,
  month = -1,
  day = -1,
) => {
  const todos = store.tasks
  switch (type) {
    case 'YEAR':
      return todos.filter(todo => todo.type === type && todo.year === year)
    case 'MONTH':
      return todos.filter(todo => todo.type === type && todo.year === year && todo.month === month)
    case 'DAY':
      return todos.filter(
        todo =>
          // eslint-disable-next-line
          todo.type === type &&
          todo.year === year &&
          todo.month === month &&
          todo.day === day,
      )
    default:
      return todos
  }
}

export function getTodos(state, type, id) {
  switch (type) {
    case 'YEAR':
      return getTodosByType(state, type, id.year)
    case 'MONTH':
      return getTodosByType(state, type, id.year, id.month)
    case 'DAY':
      return getTodosByType(state, type, id.year, id.month, id.day)
    default:
      break
  }
}

export function randomGrad(i) {
  const deg = Math.round(20 * i + 210 - 30 / Math.trunc((i + 18) / 18)) % 360
  const deg2 = Math.round(20 * i + 210 + 20 - 30 / Math.trunc((i + 18) / 18)) % 360
  return (
    'linear-gradient(330deg, rgb(' +
    rainbow[deg * 4 + 0] +
    ',' +
    rainbow[deg * 4 + 1] +
    ',' +
    rainbow[deg * 4 + 2] +
    ') 0%, rgb(' +
    rainbow[deg2 * 4 + 0] +
    ',' +
    rainbow[deg2 * 4 + 1] +
    ',' +
    rainbow[deg2 * 4 + 2] +
    ') 100%)'
  )
}
