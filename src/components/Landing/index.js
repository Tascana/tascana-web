import React, { useEffect, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import nanoid from 'nanoid'
import TaskBox from './TaskBox'
import AddingTaskBox from './AddingTaskBox'
import DayTaskBox from './DayTaskBox'
import HeroImage from './HeroImage'
import { FirebaseContext } from '../Firebase'
import styles from './styles.module.scss'

import * as types from '../../constants/task-types'

const dayTasks = [
  {
    task: 'Finish printing parts',
    done: false,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
  },
  {
    task: 'Start the design research',
    done: false,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
  },
  {
    task: 'Collect references',
    done: true,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
  },
  {
    task: 'Paint the parts',
    done: false,
    type: types.DAY,
    subtype: types.MORNING,
    id: nanoid(10),
  },
]

function Landing() {
  const [error, setError] = useState(null)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  useEffect(() => {
    const tooltips = Array.from(document.querySelectorAll('.' + styles.Tooltip))

    tooltips.forEach(tooltip => {
      tooltip.style.right = -tooltip.offsetWidth / 2 + 100 - 12 + 'px'
    })
  }, [])

  function signInWithGoogle() {
    firebase
      .signInWithGoogle()
      .then(socialAuthUser =>
        firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.user.displayName,
          email: socialAuthUser.user.email,
        }),
      )
      .then(() => {
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
      .then(socialAuthUser =>
        firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.additionalUserInfo.profile.name,
          email: socialAuthUser.additionalUserInfo.profile.email,
        }),
      )
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
        <HeroImage />
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
          <h3>2019's goals</h3>
          <div className={styles.Tasks}>
            <div className={styles.TooltipWrapper}>
              <TaskBox defaultValue="Become a senior manager" />
              <div className={styles.Tooltip}>
                Double-click to edit the task or add one more
              </div>
            </div>
            <AddingTaskBox />
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
          <h3>February's targets</h3>
          <div className={styles.Tasks}>
            <div className={styles.TooltipWrapper}>
              <TaskBox defaultValue="Finish MD work" />
              <div className={styles.Tooltip}>
                Can you break down your year's goal into a plan?
              </div>
            </div>
            <TaskBox defaultValue="Publish project report" />
            <AddingTaskBox />
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
          <h3>Tomorrow's plan</h3>
          <div className={styles.Tasks}>
            {[types.MORNING, types.AFTERNOON, types.EVENING].map((i, index) =>
              index === 0 ? (
                <div className={styles.TooltipWrapper} key={i}>
                  <DayTaskBox tasks={dayTasks} subtype={i} />
                  <div className={styles.Tooltip}>
                    Now, take your monthly target and add a tiny step for
                    tomorrow
                  </div>
                </div>
              ) : (
                <DayTaskBox key={i} tasks={dayTasks} subtype={i} />
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
      </section>
    </main>
  )
}

export default Landing
