import React from 'react'
import { connect } from 'react-redux'
import { translateDay, translateMonth } from './util'
import { HorizontalUI } from './HorizontalUI'

import '../app.css'

const mapStateToPropsHorzUI = (state, ownProps) => {
  // Here, prev/current/next sets of tasks are generated for a given date. Called on load and after Redux dispatch
  switch (ownProps.type) {
    case 'YEAR':
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: { year: state.UI.year - 1 },
            name: state.UI.year - 1,
          },
          { id: { year: state.UI.year }, name: state.UI.year },
          {
            id: { year: state.UI.year + 1 },
            name: state.UI.year + 1,
          },
        ],
        UI: state.UI,
      }
    case 'MONTH': {
      const date1 = new Date(state.UI.year, state.UI.month - 2, state.UI.day)
      const date2 = new Date(state.UI.year, state.UI.month - 1, state.UI.day)
      const date3 = new Date(state.UI.year, state.UI.month, state.UI.day)
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: { year: date1.getFullYear(), month: date1.getMonth() + 1 },
            name: translateMonth(date1),
          },
          {
            id: { year: date2.getFullYear(), month: date2.getMonth() + 1 },
            name: translateMonth(date2),
          },
          {
            id: { year: date3.getFullYear(), month: date3.getMonth() + 1 },
            name: translateMonth(date3),
          },
        ],
        UI: state.UI,
      }
    }
    case 'DAY': {
      const date1 = new Date(
        state.UI.year,
        state.UI.month - 1,
        state.UI.day - 1,
      )
      const date2 = new Date(state.UI.year, state.UI.month - 1, state.UI.day)
      const date3 = new Date(
        state.UI.year,
        state.UI.month - 1,
        state.UI.day + 1,
      )
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: {
              year: date1.getFullYear(),
              month: date1.getMonth() + 1,
              day: date1.getDate(),
            },
            name: translateDay(date1),
          },
          {
            id: {
              year: date2.getFullYear(),
              month: date2.getMonth() + 1,
              day: date2.getDate(),
            },
            name: translateDay(date2),
          },
          {
            id: {
              year: date3.getFullYear(),
              month: date3.getMonth() + 1,
              day: date3.getDate(),
            },
            name: translateDay(date3),
          },
        ],
        UI: state.UI,
      }
    }
    default:
      throw new Error('Line not specified')
  }
}

export default function Lines() {
  const CHorzUI = connect(mapStateToPropsHorzUI)(HorizontalUI)
  return (
    <>
      <CHorzUI type={'YEAR'} />
      <CHorzUI type={'MONTH'} />
      <CHorzUI type={'DAY'} />
    </>
  )
}
