import coursesData from '@/data/courses-staff.json'
import type { CourseEntry, MeetingSlot } from '@/types/transcript'

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const DAYS = ['M', 'W', 'F', 'T', 'R']
const TERMS = ['Fall', 'Winter', 'Spring', 'Summer']
const CURRENT_YEAR = 2025

const randomFromArray = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const formatTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

const generateMeetingTime = (minHours: number): MeetingSlot => {
  // Random start hour between 8am and 5pm, ensuring enough time for the course
  const startHour = randomInt(8, 17 - minHours)
  const startMinute = randomInt(0, 1) * 30 // Either :00 or :30
  
  // Add minimum hours plus optional extra 30 minutes
  const durationHours = minHours + (Math.random() < 0.3 ? 0.5 : 0)
  const endHour = Math.floor(startHour + durationHours)
  const endMinute = ((startMinute + (durationHours % 1) * 60) % 60)

  const startTime = formatTime(startHour, startMinute)
  const endTime = formatTime(endHour, endMinute)

  // Random 1-3 days per week
  const numDays = randomInt(1, 3)
  const selectedDays = [...DAYS]
    .sort(() => Math.random() - 0.5)
    .slice(0, numDays)
    .sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
    .join('')

  // Generate date range
  const term = randomFromArray(TERMS)
  const year = CURRENT_YEAR
  const startMonth = term === 'Fall' ? 9 : term === 'Winter' ? 1 : term === 'Spring' ? 5 : 7
  const endMonth = startMonth + 3

  const startDate = new Date(year, startMonth - 1, randomInt(1, 7))
  const endDate = new Date(year, endMonth - 1, randomInt(8, 20))

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`
  }

  return {
    id: createId(),
    type: 'Class',
    time: `${startTime} - ${endTime}`,
    days: selectedDays,
    location: `${randomFromArray(['DTC', 'SE', 'NE', 'SW'])} - ${randomInt(100, 999)}`,
    dateRange: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    scheduleType: randomFromArray(['Lecture/Lab Combo', 'Lecture', 'Lab', 'Online']),
    instructors: '',
  }
}

export const generateRandomCourses = (): CourseEntry[] => {
  const allCourses: Array<{
    code: string
    title: string
    credits: number | null
    staff: Array<{ name: string }>
  }> = []

  coursesData.forEach((program) => {
    program.courses.forEach((course) => {
      allCourses.push({
        code: course.code,
        title: course.title,
        credits: course.credits,
        staff: program.staff,
      })
    })
  })

  const numCourses = randomInt(3, 5)
  const selectedCourses = [...allCourses]
    .sort(() => Math.random() - 0.5)
    .slice(0, numCourses)

  const term = randomFromArray(TERMS)
  const year = CURRENT_YEAR

  return selectedCourses.map((course) => {
    const instructor = randomFromArray(course.staff).name
    const crn = randomInt(10000, 99999).toString()
    const minHours = 3

    return {
      id: createId(),
      title: `${course.title} - ${course.code} - 0`,
      associatedTerm: `${term} ${year}`,
      crn,
      status: `**Registered** on ${randomFromArray(['Jul', 'Aug', 'Sep'])} ${randomInt(1, 30)}, ${year}`,
      assignedInstructor: instructor,
      gradeMode: '60% Pass Grade Required',
      credits: course.credits?.toFixed(3) || '3.000',
      level: 'BCIT Student',
      campus: randomFromArray(['Downtown', 'Burnaby', 'Distance / Online']),
      meetings: [generateMeetingTime(minHours)],
    }
  })
}
