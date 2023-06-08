import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)

  const { year, month } = req.query

  if (!year || !month) {
    return res.status(400).json({ message: 'Invalid date' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User not found' })
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const blockedWeekDays = Array.from({ length: 7 })
    .map((_, i) => i)
    .filter((weekdDay) => {
      return !availableWeekDays.some(
        (availableWeekDay) => availableWeekDay.week_day === weekdDay,
      )
    })

  const yearMonth = `${year}-${String(month).padStart(2, '0')}`

  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT  
      EXTRACT(DAY FROM s.date) as date,
      COUNT(s.date) as amount,
      ((uti.time_end_in_minutes - uti.time_start_in_minutes) / 60 ) as size
    FROM schedulings s

    LEFT JOIN user_time_intervals uti 
      ON uti.week_day = WEEKDAY(DATE_ADD(s.date, INTERVAL 1 DAY))
      AND uti.user_id = s.user_id
     
    WHERE 1 = 1 
      AND s.user_id = ${user.id}
      AND DATE_FORMAT(s.date, '%Y-%m') = ${yearMonth}
    
    GROUP by EXTRACT(DAY FROM s.date), ((uti.time_end_in_minutes - uti.time_start_in_minutes) / 60 )

    HAVING amount >= size
  `

  const blockedDates = blockedDatesRaw.map((item) => item.date)

  return res.json({ blockedWeekDays, blockedDates })
}
