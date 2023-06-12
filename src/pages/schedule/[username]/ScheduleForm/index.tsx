import { useState } from 'react'
import CalendarStep from './CalendarStep'
import { ConfirmStep } from './ConfirmStep'

export function ScheduleForm() {
  const [selectdDateTime, setSelectedDateTime] = useState<Date | null>(null)

  function handleClearSelectedDateTime() {
    setSelectedDateTime(null)
  }

  if (selectdDateTime) {
    return (
      <ConfirmStep
        schedulingDate={selectdDateTime}
        onCancelConfirmation={handleClearSelectedDateTime}
      />
    )
  }
  return <CalendarStep onSelectDateTime={setSelectedDateTime} />
}
