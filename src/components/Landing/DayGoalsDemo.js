import React from 'react'
import styles from './styles.module.scss'
import DayTaskBox from './DayTaskBox'
import * as types from '../../constants/task-types'

export const DayGoalsDemo = ({
  dayTasksState,
  setDayTasksState,
  monthTasksState,
}) => {
  return (
    <section className={styles.Section}>
      <div className={styles.DescriptionBlock}>
        <h2>Use natural breaks</h2>
        <p>
          You need time to&nbsp;focus and to&nbsp;stay productive. Context
          switching has a&nbsp;cost. It&nbsp;is&nbsp;impossible to&nbsp;predict
          how many minutes or&nbsp;hours a&nbsp;given task will take,
          so&nbsp;why bother? We&nbsp;help you to&nbsp;group{' '}
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
                  Now, take your monthly target and add a tiny step for tomorrow
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
  )
}
