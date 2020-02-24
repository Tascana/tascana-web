import React from 'react'
import nanoid from 'nanoid'
import { format } from 'date-fns'
import TaskBox from './TaskBox'
import AddingTaskBox from './AddingTaskBox'
import styles from './styles.module.scss'

export const MonthGoalsDemo = ({
  monthTasksState,
  setYearTasksState,
  yearTasksState,
  setMonthTasksState,
  year,
  month,
}) => {
  return (
    <section className={styles.Section}>
      <div className={styles.DescriptionBlock}>
        <h2>Make a&nbsp;plan</h2>
        <p>
          Reaching yearly goals might feel hard. But not if&nbsp;you break them
          in&nbsp;a&nbsp;few monthly priorities.
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
              <TaskBox key={task.id} defaultValue={task.task} onEdit={onEdit} />
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
  )
}
