// @ts-nocheck
import { useState } from 'react'

function selectLineToSwipe(lines) {
  switch (true) {
    case lines.YEAR && lines.MONTH && !lines.DAY:
      return 'MONTH'
    case !lines.YEAR && lines.MONTH && lines.DAY:
      return 'DAY'
    default:
      return 'DAY'
  }
}

export function useShortcutSwipe() {
  const [line, setLine] = useState('YEAR')
  const [lines, setLines] = useState({
    YEAR: null,
    MONTH: null,
    DAY: null,
  })

  function onScroll(lineType, inView) {
    const newLines = {
      ...lines,
      [lineType]: inView,
    }

    setLines(newLines)
    setLine(selectLineToSwipe(newLines))
  }

  return { onScroll, line }
}
