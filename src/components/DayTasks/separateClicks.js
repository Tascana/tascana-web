let clickCount = 0

let singleClickTimer

export function separateClicks(e, { onClick, onDoubleClick }) {
  clickCount++

  if (clickCount === 1) {
    singleClickTimer = setTimeout(function() {
      clickCount = 0
      onClick(e)
    }, 170)
  } else if (clickCount === 2) {
    clearTimeout(singleClickTimer)
    clickCount = 0
    onDoubleClick(e)
  }
}
