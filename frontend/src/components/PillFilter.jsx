import React, { forwardRef } from 'react'
import Pill from './Pill'

const PillFilter = forwardRef((props, ref) => {
  return <Pill ref={ref} variant="filter" {...props} />
})

PillFilter.displayName = 'PillFilter'
export default PillFilter
