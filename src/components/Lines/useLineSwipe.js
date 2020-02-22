import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useDrag } from 'react-use-gesture'
import { useSprings } from 'react-spring'
import { translateDay, translateMonth, extractHeight } from './util'

import '../app.css'

import ui from '../../redux/UI'

/* eslint-disable react-hooks/exhaustive-deps, eqeqeq */
export function useLineSwipe({
  type,
  num,
  dispatch,
  items0,
  UI,
  animatedContainer,
}) {
  const [items, setItems] = React.useState(items0) // Load blocks from Redux into state
  const dragging = React.useRef(false) // Defines which row is being dragged
  const offset = window.innerWidth
  const addMode = useSelector(state => state.UI.addMode)

  const [springs, set] = useSprings(items.length, i => ({
    // Set up function for react-spring
    from: {
      x: offset * (i - 1),
      scale: 1,
      display: 'block',
      height: 'unset',
    },
  }))

  const bind = useDrag(
    ({ down, first, last, movement: [x, y], direction: [dx], cancel }) => {
      // Set up function for react-use-gestures
      if (UI.sort) return

      if (first) {
        dragging.current = true // set dragging bool for the row that is currently dragged
      }

      if (last) {
        dragging.current = false // disable dragging bool when the gesture is finished
      }

      if ((first || last) && x == 0) {
        animatedContainer.current.setAttribute('class', '') // removes 'noselect' class on click
      }

      if (Math.abs(x) > 0) {
        animatedContainer.current.setAttribute('class', 'noselect') // adds 'noselect' on drag begin
      }

      if (down && Math.abs(x) > window.innerWidth / 3) {
        // 1. when mouse offset is more than 1/3rd of the window
        cancel() // 2. cancel the gesture
        set(i => ({
          // 3. immediately change the current block to either one on the left, or one on the right
          immediate: true,
          x: springs[i].x.value + offset * (dx > 0 ? -1 : 1), // x position takes the current translation of the block and offsets it to the right or left
          height:
            down && Math.abs(x) > 50
              ? Math.max(...extractHeight(animatedContainer, x)) // takes max height from neighbours
              : animatedContainer.current.children[1 + (dx > 0 ? -1 : 1)]
                  .children[0].scrollHeight + 40, // takes height from the current row
        }))
        dispatch(ui.actions.set({ tasktype: type, id: dx > 0 ? -1 : 1 })) // 4. tell Redux to update all task blocks. See also line 287
        return // 8. after return useDrag will be called once more
      }
      set(i => ({
        // 8. this animates row by mouse offset or moves it back to zero
        x: down ? x + offset * (i - 1) : 0 + offset * (i - 1),
        display: i < 1 - 1 || i > 1 + 1 ? 'none' : 'block',
        height:
          down && Math.abs(x) > 50
            ? Math.max(...extractHeight(animatedContainer, x))
            : animatedContainer.current.children[1].children[0].scrollHeight +
              40,
      }))
    },
    {
      event: { passive: true, capture: false },
      threshold: 5,
      filterTaps: true,
      axis: 'x',
    },
  )

  function recalculateRowHeight() {
    setTimeout(() => {
      set(() => {
        return {
          height:
            animatedContainer.current.children[1].children[0].scrollHeight + 40,
        }
      })
    }, 1)
  }

  useEffect(() => {
    recalculateRowHeight()
  }, [num, addMode.type])

  useEffect(() => {
    // 5. This function watches Redux to update all task blocks
    setItems(items0) // 5a. Update all blocks with info from Redux (could be a bug)
    console.log(type, ' ', dragging.current)
    animatedContainer.current.setAttribute('class', 'noselect') // add 'noselect' if it was removed

    // 6. on line 150
    // 7. on line 107
    // 8. on line 72-74

    function pos(dx) {
      // 7. this is called from jump year/month/day. This function handles animation of the dependent blocks
      items[dx > 0 ? 2 : 0] = items[1] // sets left or right block of the dependent row to the previous date
      switch (
        type // this sets the central block of the dependent row to the new date. 'type' is prop
      ) {
        case 'YEAR':
          items[1] = { id: { year: UI.year }, name: UI.year } // NB: UI prop is already updated, but the actual task block is not changed until setItems is called
          break
        case 'MONTH':
          items[1] = {
            id: { year: UI.year, month: UI.month }, // NB: Redux only sets year/month/day ID prop of the TaskBox, the actual data is retreived by TaskBox component itself.
            name: translateMonth(new Date(UI.year, UI.month - 1, UI.day)),
          }
          break
        case 'DAY':
          items[1] = {
            id: { year: UI.year, month: UI.month, day: UI.day },
            name: translateDay(new Date(UI.year, UI.month - 1, UI.day)), // Naming function
          }
          break
        default:
          break
      }
      setItems([...items]) // update UI with the above changes
      set(i => ({
        // immediately offset the dependent row to the right or left
        immediate: true,
        x: springs[i].x.value + offset * (dx > 0 ? -1 : 1),
      }))
      setTimeout(
        dx => {
          // first timeout animates the dependent row back to 0 offset (i.e. reveals the new date)
          set(i => ({
            x: 0 + offset * (i - 1),
            height:
              animatedContainer.current.children[1].children[0].scrollHeight +
              40,
          }))
          setTimeout(() => {
            // second timeout updates previous and next dates to sequential
            setItems(items0)
          }, 500)
        },
        1,
        dx,
      )
    }

    // 6. Check if current row has changed AND that it is NOT dragged. Then update, if required

    // Jump year
    if (UI.year !== UI.prevyear && !dragging.current) {
      const dx = UI.prevyear - UI.year
      pos(dx)
      return
    }

    // Jump month or day
    if (
      UI.month !== UI.prevmonth &&
      !dragging.current &&
      (type === 'MONTH' || type === 'DAY')
    ) {
      const dx = UI.prevmonth - UI.month
      pos(dx)
      return
    }
  }, [UI.year, UI.month, UI.day, UI.prevyear, UI.prevmonth, UI.prevday]) // handles changes in dates

  function style() {
    var h = springs[0]
    return { height: h.height, margin: 'auto' }
  }

  function changeDirectionOnClick(id) {
    const isSelected = UI.selectedTree.length > 0
    const { isEditing, isLinking } = UI
    if (!isEditing && !isSelected && !isLinking)
      dispatch(ui.actions.set({ tasktype: type, id }))
  }

  return {
    springs,
    bind,
    style,
    items,
    changeDirectionOnClick,
    recalculateRowHeight,
  }
}
