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

export const getTasksByType = tasks => params => {
  const { type, subtype } = params

  switch (type) {
    case types.YEAR:
      return tasks.filter(task => task.type === type)
    case types.MONTH:
      return tasks.filter(task => task.type === type)
    case types.DAY:
      return subtype
        ? tasks.filter(task => task.type === type && task.subtype === subtype)
        : tasks.filter(task => task.type === type)
    default: {
      return tasks
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
  let parents = null
  let children = []

  function getParents(parentId) {
    if (!parentId) return parents
    parents = parentId
    return getParents(getTaskById(tasks, parentId).firstParentId)
  }

  function getChildren(ids, parent) {
    if (parent) {
      const parents = tasks.filter(task => task.id == parent)[0].children
      const childrens = tasks.filter(task => task.id == ids)[0].id
      return (children = parents.concat(childrens))
    }
    return children
  }

  return {
    parents: getParents(firstParentId),
    children: getChildren(id, firstParentId),
  }
}

export function treeActions(tasks, todo) {
  const itemsTree = []

  const rootTreeSearch = todo => {
    let currentTodo = tasks.filter(task => task.id == todo)[0]
    currentTodo?.parent ? rootTreeSearch(currentTodo.parent) : treeBFS([currentTodo.id])
  }

  const treeBFS = root => {
    itemsTree.push(...root)
    const itemTask = []

    root.map(item => {
      let currentTask = tasks.filter(task => task.id == item)[0]
      if (currentTask.children.length) {
        itemTask.push(...currentTask.children)
      }
    })

    if (itemTask.length) treeBFS(itemTask)
  }
  rootTreeSearch(todo)

  return {
    itemsAllTree: itemsTree,
  }
}
