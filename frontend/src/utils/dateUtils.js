/**
 * Shared Date Formatting Utility
 * Prevents timezone offset bugs and normalizes date rendering across components.
 */

// Format Date object or ISO string to YYYY-MM-DD
export const formatLocalDate = (dateInput) => {
  if (!dateInput) return 'N/A'
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(dateObj.getTime())) return 'N/A'
  
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format to user-friendly readable date (e.g. "Jul 29, 2026")
export const formatReadableDate = (dateInput) => {
  if (!dateInput) return 'N/A'
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(dateObj.getTime())) return 'N/A'
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format to local date + time string (e.g. "7/29/2026, 6:14 PM")
export const formatLocalDateTime = (dateInput) => {
  if (!dateInput) return 'N/A'
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(dateObj.getTime())) return 'N/A'

  return dateObj.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}