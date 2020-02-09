import nanoid from 'nanoid'
import * as types from '../../constants/task-types'

const demoYearTaskId = nanoid(10)
const demoUserId = nanoid(12)
const demoCreatedAt = Date.now()

export const year = new Date().getFullYear()
export const month = new Date().getMonth() + 1
const day = new Date().getDate()

const demoMonth1stTask = nanoid(10)
const demoMonth2ndTask = nanoid(10)

export const yearTasks = [
  {
    isDemo: true,
    task: 'Become a senior manager',
    done: false,
    progress: 0,
    type: types.YEAR,
    subtype: null,
    id: demoYearTaskId,
    year,
    month: -1,
    day: -1,
    parentId: null,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
]

export const monthTasks = [
  {
    isDemo: true,
    task: 'Finish MD work',
    done: false,
    progress: 0,
    type: types.MONTH,
    subtype: null,
    id: demoMonth1stTask,
    year,
    month,
    day: -1,
    parentId: demoYearTaskId,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
  {
    isDemo: true,
    task: 'Publish project report',
    done: false,
    progress: 0,
    type: 'MONTH',
    subtype: null,
    id: demoMonth2ndTask,
    year,
    month,
    day: -1,
    parentId: demoYearTaskId,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
]

export const dayTasks = [
  {
    isDemo: true,
    task: 'Finish printing parts',
    done: false,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
    year,
    month,
    day,
    parentId: demoMonth1stTask,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
  {
    isDemo: true,
    task: 'Start the design research',
    done: false,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
    year,
    month,
    day,
    parentId: demoMonth1stTask,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
  {
    isDemo: true,
    task: 'Collect references',
    done: true,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
    year,
    month,
    day,
    parentId: demoMonth1stTask,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
  {
    isDemo: true,
    task: 'Paint the parts',
    done: false,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
    year,
    month,
    day,
    parentId: demoMonth1stTask,
    userId: demoUserId,
    createdAt: demoCreatedAt,
    updatedAt: -1,
  },
]
