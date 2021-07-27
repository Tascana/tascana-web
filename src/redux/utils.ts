// @ts-nocheck
import * as types from '../constants/task-types'

export const getTasksBy = tasks => params => {
  const { day, month, year, type, subtype } = params

  switch (type) {
    case types.YEAR:
      return tasks.filter(task => task.type === type && task.year === year)
    case types.MONTH:
      return tasks.filter(task => task.type === type && task.year === year && task.month === month)
    case types.DAY:
      return tasks.filter(
        task =>
          task.type === type &&
          task.subtype === subtype &&
          task.year === year &&
          task.month === month &&
          task.day === day,
      )
    default: {
      return tasks
      // if (day) {
      //   return tasks.filter(
      //     task =>
      //       task.year === year && task.month === month && task.day === day,
      //   )
      // }

      // if (month) {
      //   return tasks.filter(task => task.year === year && task.month === month)
      // }

      // return tasks.filter(task => task.year === year)
    }
  }
}

export const getTaskById = (tasks, id) => (id ? tasks.find(task => task.id === id) : undefined)

export const addSibling = (siblings, newSibling) =>
  siblings
    .split(',')
    .concat(newSibling)
    .join(',')

export function getTree(tasks, { id, firstParentId }) {
  let parents = []
  let children = []

  function getParents(parentId) {
    if (!parentId) return parents
    parents.push(parentId)
    return getParents(getTaskById(tasks, parentId).firstParentId)
  }

  function getChildren(ids) {
    const childs = tasks.filter(task => ids.includes(task.firstParentId))

    if (!childs.length) return children
    children.push(...childs.map(c => c.id))
    return getChildren(childs.map(c => c.id))
  }

  return {
    parents: getParents(firstParentId),
    children: getChildren([id]),
  }
}
