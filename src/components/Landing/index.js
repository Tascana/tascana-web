import React, { useEffect, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import nanoid from 'nanoid'
import { format } from 'date-fns'
import TaskBox from './TaskBox'
import AddingTaskBox from './AddingTaskBox'
import DayTaskBox from './DayTaskBox'
import { FirebaseContext } from '../Firebase'
import * as types from '../../constants/task-types'
import { yearTasks, monthTasks, dayTasks, year, month } from './demoData'
import styles from './styles.module.scss'

function scroll(element) {
  let start = null
  const target = element && element ? element.getBoundingClientRect().top : 0
  const firstPos = window.pageYOffset || document.documentElement.scrollTop
  let pos = 0

  ;(function() {
    var browser = ['ms', 'moz', 'webkit', 'o']

    for (
      let x = 0, length = browser.length;
      x < length && !window.requestAnimationFrame;
      x++
    ) {
      window.requestAnimationFrame =
        window[browser[x] + 'RequestAnimationFrame']
      window.cancelAnimationFrame =
        window[browser[x] + 'CancelAnimationFrame'] ||
        window[browser[x] + 'CancelRequestAnimationFrame']
    }
  })()

  function showAnimation(timestamp) {
    if (!start) {
      start = timestamp || new Date().getTime()
    }

    let elapsed = timestamp - start
    let progress = elapsed / 600

    const outQuad = function(n) {
      return n * (2 - n)
    }

    let easeInPercentage = +outQuad(progress).toFixed(2)

    pos =
      target === 0
        ? firstPos - firstPos * easeInPercentage
        : firstPos + target * easeInPercentage

    window.scrollTo(0, pos)

    if (
      (target !== 0 && pos >= firstPos + target) ||
      (target === 0 && pos <= 0)
    ) {
      cancelAnimationFrame(start)
      pos = 0
    } else {
      window.requestAnimationFrame(showAnimation)
    }
  }
  window.requestAnimationFrame(showAnimation)
}

function Landing() {
  const [error, setError] = useState(null)
  const [yearTasksState, setYearTasksState] = useState(yearTasks)
  const [monthTasksState, setMonthTasksState] = useState(monthTasks)
  const [dayTasksState, setDayTasksState] = useState(dayTasks)

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

  function handleSignIn(socialAuthUser) {
    createTasksFromLanding(socialAuthUser.user.uid)

    return firebase.user(socialAuthUser.user.uid).set({
      username: socialAuthUser.user.displayName,
      email: socialAuthUser.user.email,
    })
  }

  function signInWithGoogle() {
    firebase
      .signInWithGoogle()
      .then(handleSignIn)
      .then(user => {
        setError(null)
        history.push('/')
      })
      .catch(error => {
        setError(error.message)
      })
  }

  function signInWithFb() {
    firebase
      .signInWithFacebook()
      .then(handleSignIn)
      .then(() => {
        setError(null)
        history.push('/')
      })
      .catch(error => {
        setError(error.message)
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
                scroll(document.getElementById('signin'))
              }}
            >
              Sign in
            </button>
          </div>
        </header>
        <div className={styles.HeroImage} />
      </section>
      <section className={styles.Section}>
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
      <section className={styles.SignIn} id="signin">
        <h2>Sign in</h2>
        <div className={styles.SignInButtons}>
          <button
            className={styles.Google}
            type="button"
            onClick={() => {
              signInWithGoogle()
            }}
          >
            with Google
          </button>
          <button
            className={styles.Facebook}
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
