import React from 'react'
import nanoid from 'nanoid'
import TaskBox from './TaskBox'
import AddingTaskBox from './AddingTaskBox'
import styles from './styles.module.scss'

export const YearGoalsDemo = ({
  year,
  yearTasksState,
  setMonthTasksState,
  setYearTasksState,
}) => {
  return (
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
              <TaskBox key={task.id} defaultValue={task.task} onEdit={onEdit} />
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
  )
}
