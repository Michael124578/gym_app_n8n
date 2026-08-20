import React, { forwardRef } from 'react'
import Pill from './Pill'

const PillButton = forwardRef((props, ref) => {
  return <Pill ref={ref} variant="button" {...props} />
})

PillButton.displayName = 'PillButton'
export default PillButton
