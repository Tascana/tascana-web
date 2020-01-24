export const getTodosByType = (
  store,
  type,
  year = -1,
  month = -1,
  day = -1,
) => {
  const todos = Object.entries(store.tasks).map(i => ({ ...i[1], id: i[0] }))
  switch (type) {
    case 'YEAR':
      return todos.filter(todo => todo.type === type && todo.year === year)
    case 'MONTH':
      return todos.filter(
        todo =>
          todo.type === type && todo.year === year && todo.month === month,
      )
    case 'DAY':
      return todos.filter(
        todo =>
          todo.type === type &&
          todo.year === year &&
          todo.month === month &&
          todo.day === day,
      )
    default:
      return todos
  }
}

function hwb(hue, sat, int) {
  const h = (hue % 360) / 60
  const s = sat / 100
  const i = int / 100

  const z = 1 - Math.abs((h % 2) - 1)
  const c = (3 * i * s) / (1 + z)
  const x = c * z

  const j = Math.floor(h)

  let r, g, b

  switch (j) {
    default:
    case 6:
    case 0:
      r = c
      g = x
      b = 0
      break
    case 1:
      r = x
      g = c
      b = 0
      break
    case 2:
      r = 0
      g = c
      b = x
      break
    case 3:
      r = 0
      g = x
      b = c
      break
    case 4:
      r = x
      g = 0
      b = c
      break
    case 5:
      r = c
      g = 0
      b = x
      break
  }

  const m = i * (1 - s)
  r += m
  g += m
  b += m

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255,
  )})`
}

export function randomGrad(i) {
  const modifiedI = Math.ceil(
    i +
      ''
        .split('')
        .reverse()
        .join('') /
        10000000000,
  )
  const deg = ((20 * modifiedI) % 360) + 190
  const s = 50
  const l = 60

  return `linear-gradient(330deg, ${hwb(deg + 25, s - 40, l + 30)} 0%, ${hwb(
    deg,
    s,
    l,
  )} 100%)`
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
