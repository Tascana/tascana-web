import React from 'react'
import ReactDOM from 'react-dom'
import TaskBox from './task-box'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<TaskBox />, div)
  ReactDOM.unmountComponentAtNode(div)
})
