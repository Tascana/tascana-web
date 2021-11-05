const TASK_BACKGROUND_GRADIENTS = [
  ['#965cff', '#5700e2', 100],
  ['#3276ff', '#0018ff', 100],
  ['#32d5ff', '#00a7ff', 100],
  ['#47f0e7', '#00e795', 75],
  ['#c2ea07', '#99d903', 100],
  ['#ffe775', '#fed421', 75],
  ['#ff9d46', '#ff7800', 100],
  ['#ff6e6e', '#ff3a3a', 100],
  ['#f061af', '#e10577', 100],
  ['#be61f7', '#b510d3', 100],
]

export function getRandomBg() {
  const bg = TASK_BACKGROUND_GRADIENTS[Math.floor(Math.random() * 10)]

  return `linear-gradient(to bottom, ${bg[0]}, ${bg[1]} ${bg[2]}%)`
}
