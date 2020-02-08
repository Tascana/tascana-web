import React, { useEffect, useContext, useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import nanoid from 'nanoid'
import { format } from 'date-fns'
import TaskBox from './TaskBox'
import AddingTaskBox from './AddingTaskBox'
import DayTaskBox from './DayTaskBox'
import { FirebaseContext } from '../Firebase'
import styles from './styles.module.scss'

import * as types from '../../constants/task-types'

const demoYearTaskId = nanoid(10)
const demoUserId = nanoid(12)
const demoCreatedAt = Date.now()

const year = new Date().getFullYear()
const month = new Date().getMonth() + 1
const day = new Date().getDate()

const demoMonth1stTask = nanoid(10)
const demoMonth2ndTask = nanoid(10)

const yearTasks = [
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

const monthTasks = [
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

const dayTasks = [
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

function Landing() {
  const [error, setError] = useState(null)
  const [yearTasksState, setYearTasksState] = useState(yearTasks)
  const [monthTasksState, setMonthTasksState] = useState(monthTasks)
  const [dayTasksState, setDayTasksState] = useState(dayTasks)
  const firstSection = useRef(null)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  useEffect(() => {
    const tooltips = Array.from(document.querySelectorAll('.' + styles.Tooltip))

    tooltips.forEach(tooltip => {
      tooltip.style.right = -tooltip.offsetWidth / 2 + 100 - 12 + 'px'
    })
  })

  function createTasksFromLanding(userId) {
    const allTasks = [
      ...yearTasksState,
      ...monthTasksState,
      ...dayTasksState,
    ].filter(t => !t.isDemo)

    if (allTasks.length > 0) {
      allTasks
        .map(t => ({
          ...t,
          userId,
        }))
        .forEach(t => {
          firebase.createTask(t, userId, t.id)
        })
    }
  }

  function signInWithGoogle() {
    firebase
      .signInWithGoogle()
      .then(socialAuthUser => {
        createTasksFromLanding(socialAuthUser.user.uid)

        return firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.user.displayName,
          email: socialAuthUser.user.email,
        })
      })
      .then(user => {
        setError(null)
        history.push('/')
      })
      .catch(error => {
        setError(error)
      })
  }

  function signInWithFb() {
    firebase
      .signInWithFacebook()
      .then(socialAuthUser => {
        createTasksFromLanding(socialAuthUser.user.uid)

        return firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.additionalUserInfo.profile.name,
          email: socialAuthUser.additionalUserInfo.profile.email,
        })
      })
      .then(() => {
        setError(null)
        history.push('/')
      })
      .catch(error => {
        setError(error)
      })
  }

  return (
    <main>
      <section className={styles.Hero}>
        <header>
          <h1 className={styles.Title}>
            Achieve your <nobr>long-term</nobr> goals with Tascana
          </h1>
          <div>
            <button
              type="button"
              onClick={() => {
                signInWithGoogle()
              }}
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => {
                signInWithFb()
              }}
            >
              Sign in with Facebook
            </button>
          </div>
        </header>
        <div className={styles.HeroImage} />
      </section>
      <section className={styles.Section} ref={firstSection}>
        <div className={styles.DescriptionBlock}>
          <h2>
            Focus on&nbsp;<nobr>long-term</nobr> impact
          </h2>
          <p>
            It&nbsp;is&nbsp;irrelevant what you achieve on&nbsp;the February, 2
            along, though it&nbsp;is&nbsp;important what you achieve
            in&nbsp;a&nbsp;year.
            <br />
            In&nbsp;Tascana we&nbsp;help you define what is&nbsp;truly important
            in&nbsp;the next 12 months
          </p>
        </div>
        <div className={styles.AbilityBlock}>
          <h3>{year}'s goals</h3>
          <div className={styles.Tasks}>
            {yearTasksState.map((task, index, array) => {
              function onEdit(value) {
                setMonthTasksState(
                  array.map(t => {
                    if (t.id === task.id) {
                      return {
                        ...t,
                        task: value,
                        updatedAt: Date.now(),
                      }
                    }

                    return t
                  }),
                )
              }

              if (index === 0) {
                return (
                  <div key={task.id} className={styles.TooltipWrapper}>
                    <TaskBox defaultValue={task.task} onEdit={onEdit} />
                    <div className={styles.Tooltip}>
                      Double-click to edit the task or add one more
                    </div>
                  </div>
                )
              }

              return (
                <TaskBox
                  key={task.id}
                  defaultValue={task.task}
                  onEdit={onEdit}
                />
              )
            })}
            {yearTasksState.length === 1 && (
              <AddingTaskBox
                onAdd={value => {
                  const newId = nanoid(10)

                  setYearTasksState([
                    ...yearTasksState,
                    {
                      task: value,
                      done: false,
                      progress: 0,
                      type: 'YEAR',
                      subtype: null,
                      id: newId,
                      year,
                      month: -1,
                      day: -1,
                      parentId: null,
                      userId: '',
                      createdAt: Date.now(),
                      updatedAt: -1,
                    },
                  ])
                }}
              />
            )}
          </div>
        </div>
      </section>
      <section className={styles.Section}>
        <div className={styles.DescriptionBlock}>
          <h2>Make a&nbsp;plan</h2>
          <p>
            Reaching yearly goals might feel hard. But not if&nbsp;you break
            them in&nbsp;a&nbsp;few monthly priorities.
          </p>
        </div>
        <div className={styles.AbilityBlock}>
          <h3>{format(new Date(), 'MMMM')}'s targets</h3>
          <div className={styles.Tasks}>
            {monthTasksState.map((task, index, array) => {
              function onEdit(value) {
                setYearTasksState(
                  array.map(t => {
                    if (t.id === task.id) {
                      return {
                        ...t,
                        task: value,
                        updatedAt: Date.now(),
                      }
                    }

                    return t
                  }),
                )
              }

              if (index === 0) {
                return (
                  <div key={task.id} className={styles.TooltipWrapper}>
                    <TaskBox defaultValue={task.task} onEdit={onEdit} />
                    <div className={styles.Tooltip}>
                      Can you break down your year's goal into a plan?
                    </div>
                  </div>
                )
              }

              return (
                <TaskBox
                  key={task.id}
                  defaultValue={task.task}
                  onEdit={onEdit}
                />
              )
            })}
            {monthTasksState.length === 2 && (
              <AddingTaskBox
                disabled={!yearTasksState.find(t => !t.isDemo)}
                onAdd={value => {
                  const newId = nanoid(10)

                  setMonthTasksState([
                    ...monthTasksState,
                    {
                      task: value,
                      done: false,
                      progress: 0,
                      type: 'MONTH',
                      subtype: null,
                      id: newId,
                      year,
                      month,
                      day: -1,
                      parentId: yearTasksState.find(t => !t.isDemo).id,
                      userId: '',
                      createdAt: Date.now(),
                      updatedAt: -1,
                    },
                  ])
                }}
              />
            )}
          </div>
        </div>
      </section>
      <section className={styles.Section}>
        <div className={styles.DescriptionBlock}>
          <h2>Use natural breaks</h2>
          <p>
            You need time to&nbsp;focus and to&nbsp;stay productive. Context
            switching has a&nbsp;cost. It&nbsp;is&nbsp;impossible
            to&nbsp;predict how many minutes or&nbsp;hours a&nbsp;given task
            will take, so&nbsp;why bother? We&nbsp;help you to&nbsp;group{' '}
            <nobr>context-related</nobr> tasks together and put them in&nbsp;one
            of&nbsp;3 available time slots: morning, afternoon, and evening.
          </p>
        </div>
        <div className={styles.AbilityBlock}>
          <h3>Today's plan</h3>
          <div className={styles.Tasks}>
            {[types.MORNING, types.AFTERNOON, types.EVENING].map((i, index) =>
              index === 0 ? (
                <div className={styles.TooltipWrapper} key={i}>
                  <DayTaskBox
                    tasks={dayTasksState}
                    setTasks={setDayTasksState}
                    subtype={i}
                    disabled={!monthTasksState.find(t => !t.isDemo)}
                    parentId={
                      monthTasksState.find(t => !t.isDemo) &&
                      monthTasksState.find(t => !t.isDemo).id
                    }
                  />
                  <div className={styles.Tooltip}>
                    Now, take your monthly target and add a tiny step for
                    tomorrow
                  </div>
                </div>
              ) : (
                <DayTaskBox
                  key={i}
                  tasks={dayTasksState}
                  setTasks={setDayTasksState}
                  subtype={i}
                  disabled={!monthTasksState.find(t => !t.isDemo)}
                  parentId={
                    monthTasksState.find(t => !t.isDemo) &&
                    monthTasksState.find(t => !t.isDemo).id
                  }
                />
              ),
            )}
          </div>
        </div>
      </section>
      <section className={styles.SignIn}>
        <h2>Sign in</h2>
        <div className={styles.SignInButtons}>
          <button
            type="button"
            onClick={() => {
              signInWithGoogle()
            }}
          >
            with Google
          </button>
          <button
            type="button"
            onClick={() => {
              signInWithFb()
            }}
          >
            with Facebook
          </button>
        </div>
        {error && <div>{error}</div>}
        <p className={styles.Note}>
          Your tasks will be saved, unless you reload the page
        </p>
      </section>
    </main>
  )
}

export default Landing
