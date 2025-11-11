'use client'

import { useCallback, useMemo, useState } from 'react'
import { buildTranscriptFileName, buildTranscriptHtml } from '@/lib/transcriptTemplate'
import { generateRandomCourses } from '@/utils/courseRandomizer'
import type { CourseEntry, MeetingSlot, StudentDetails } from '@/types/transcript'

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const createEmptyMeeting = (): MeetingSlot => ({
  id: createId(),
  type: 'Class',
  time: '',
  days: '',
  location: '',
  dateRange: '',
  scheduleType: '',
  instructors: '',
})

const createEmptyCourse = (): CourseEntry => ({
  id: createId(),
  title: '',
  associatedTerm: '',
  crn: '',
  status: '',
  assignedInstructor: '',
  gradeMode: '',
  credits: '',
  level: '',
  campus: '',
  meetings: [createEmptyMeeting()],
})

const initialStudent: StudentDetails = {
  name: '',
  studentId: '',
  term: 'Fall 2025',
  generatedOn: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }),
  totalCredits: '0.000',
  note:
    'Part-time students: The information shown below is subject to change. On the first day of your class, please check back here or visit www.bcit.ca/rooms.',
}

const initialCourses: CourseEntry[] = [createEmptyCourse()]

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}

const Field = ({ label, value, onChange, placeholder, type = 'text' }: FieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium uppercase tracking-wider text-gray-600">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-[#003c71] focus:outline-none focus:ring-1 focus:ring-[#003c71]/50"
    />
  </label>
)

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: FieldProps & { rows?: number }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium uppercase tracking-wider text-gray-600">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-[#003c71] focus:outline-none focus:ring-1 focus:ring-[#003c71]/50"
    />
  </label>
)

export const TranscriptBuilder = () => {
  const [student, setStudent] = useState<StudentDetails>(initialStudent)
  const [courses, setCourses] = useState<CourseEntry[]>(initialCourses)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [studentExpanded, setStudentExpanded] = useState(true)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set(initialCourses.map((c) => c.id))
  )

  const transcriptData = useMemo(() => ({ student, courses }), [student, courses])
  const previewHtml = useMemo(
    () => buildTranscriptHtml(transcriptData),
    [transcriptData],
  )

  const handleStudentChange = useCallback(
    (field: keyof StudentDetails, value: string) => {
      setStudent((previous) => ({ ...previous, [field]: value }))
    },
    [],
  )

  const handleCourseChange = useCallback(
    (courseId: string, field: keyof CourseEntry, value: string) => {
      setCourses((previous) =>
        previous.map((course) =>
          course.id === courseId ? { ...course, [field]: value } : course,
        ),
      )
    },
    [],
  )

  const handleMeetingChange = useCallback(
    (courseId: string, meetingId: string, field: keyof MeetingSlot, value: string) => {
      setCourses((previous) =>
        previous.map((course) =>
          course.id === courseId
            ? {
                ...course,
                meetings: course.meetings.map((meeting) =>
                  meeting.id === meetingId
                    ? { ...meeting, [field]: value }
                    : meeting,
                ),
              }
            : course,
        ),
      )
    },
    [],
  )

  const handleAddCourse = useCallback(() => {
    const newCourse = createEmptyCourse()
    setCourses((previous) => [...previous, newCourse])
    setExpandedCourses((prev) => new Set(prev).add(newCourse.id))
  }, [])

  const handleRemoveCourse = useCallback((courseId: string) => {
    setCourses((previous) => previous.filter((course) => course.id !== courseId))
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      next.delete(courseId)
      return next
    })
  }, [])

  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }, [])

  const handleRandomize = useCallback(() => {
    const randomCourses = generateRandomCourses()
    setCourses(randomCourses)
    setExpandedCourses(new Set(randomCourses.map((c) => c.id)))
    
    // Update total credits
    const totalCredits = randomCourses.reduce((sum, course) => {
      const credits = parseFloat(course.credits) || 0
      return sum + credits
    }, 0)
    setStudent((prev) => ({
      ...prev,
      totalCredits: totalCredits.toFixed(3),
    }))
  }, [])

  const handleAddMeeting = useCallback((courseId: string) => {
    setCourses((previous) =>
      previous.map((course) =>
        course.id === courseId
          ? { ...course, meetings: [...course.meetings, createEmptyMeeting()] }
          : course,
      ),
    )
  }, [])

  const handleRemoveMeeting = useCallback((courseId: string, meetingId: string) => {
    setCourses((previous) =>
      previous.map((course) =>
        course.id === courseId
          ? {
              ...course,
              meetings: course.meetings.filter((meeting) => meeting.id !== meetingId),
            }
          : course,
      ),
    )
  }, [])

  const handleDownload = useCallback(() => {
    const fileName = buildTranscriptFileName(transcriptData)
    const blob = new Blob([previewHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    URL.revokeObjectURL(url)
  }, [previewHtml, transcriptData])

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setStudentExpanded(!studentExpanded)}
          className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50"
        >
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Student Information</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {student.studentId} • {student.name} • {student.term}
            </p>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              studentExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {studentExpanded && (
          <div className="border-t border-gray-100 px-6 pb-6 pt-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Student ID"
                value={student.studentId}
                onChange={(value) => handleStudentChange('studentId', value)}
                placeholder="A01234567"
              />
              <Field
                label="Student Name"
                value={student.name}
                onChange={(value) => handleStudentChange('name', value)}
                placeholder="First Last"
              />
              <Field
                label="Term"
                value={student.term}
                onChange={(value) => handleStudentChange('term', value)}
                placeholder="Fall 2025"
              />
              <Field
                label="Generated On"
                value={student.generatedOn}
                onChange={(value) => handleStudentChange('generatedOn', value)}
                placeholder="Nov 03, 2025 07:26 pm"
              />
              <Field
                label="Total Credits"
                value={student.totalCredits}
                onChange={(value) => handleStudentChange('totalCredits', value)}
                placeholder="14.500"
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Note"
                value={student.note}
                onChange={(value) => handleStudentChange('note', value)}
                placeholder="Part-time students: The information shown below is subject to change..."
                rows={3}
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        {courses.map((course, index) => {
          const isExpanded = expandedCourses.has(course.id)
          return (
            <div key={course.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleCourse(course.id)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Course {index + 1}
                    </span>
                    {courses.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveCourse(course.id)
                        }}
                        className="cursor-pointer rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {course.title || 'Untitled Course'}
                  </p>
                  {!isExpanded && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {course.crn && `CRN ${course.crn}`}
                      {course.crn && course.credits && ' • '}
                      {course.credits && `${course.credits} credits`}
                    </p>
                  )}
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddMeeting(course.id)}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      Add Meeting
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Field
                        label="Course Title"
                        value={course.title}
                        onChange={(value) => handleCourseChange(course.id, 'title', value)}
                        placeholder="Course name and code"
                      />
                    </div>
                    <Field
                      label="Term"
                      value={course.associatedTerm}
                      onChange={(value) => handleCourseChange(course.id, 'associatedTerm', value)}
                      placeholder="Fall 2025"
                    />
                    <Field
                      label="CRN"
                      value={course.crn}
                      onChange={(value) => handleCourseChange(course.id, 'crn', value)}
                      placeholder="12345"
                    />
                    <Field
                      label="Status"
                      value={course.status}
                      onChange={(value) => handleCourseChange(course.id, 'status', value)}
                      placeholder="**Registered** on Jul 11, 2025"
                    />
                    <Field
                      label="Instructor"
                      value={course.assignedInstructor}
                      onChange={(value) =>
                        handleCourseChange(course.id, 'assignedInstructor', value)
                      }
                      placeholder="Instructor name"
                    />
                    <Field
                      label="Grade Mode"
                      value={course.gradeMode}
                      onChange={(value) => handleCourseChange(course.id, 'gradeMode', value)}
                      placeholder="60% Pass Grade Required"
                    />
                    <Field
                      label="Credits"
                      value={course.credits}
                      onChange={(value) => handleCourseChange(course.id, 'credits', value)}
                      placeholder="3.000"
                    />
                    <Field
                      label="Level"
                      value={course.level}
                      onChange={(value) => handleCourseChange(course.id, 'level', value)}
                      placeholder="Student"
                    />
                    <Field
                      label="Campus"
                      value={course.campus}
                      onChange={(value) => handleCourseChange(course.id, 'campus', value)}
                      placeholder="Downtown"
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {course.meetings.map((meeting, meetingIndex) => (
                      <div
                        key={meeting.id}
                        className="rounded-md border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Meeting {meetingIndex + 1}
                          </p>
                          {course.meetings.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMeeting(course.id, meeting.id)}
                              className="text-xs font-medium text-red-600 transition hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            label="Type"
                            value={meeting.type}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'type', value)
                            }
                            placeholder="Class"
                          />
                          <Field
                            label="Time"
                            value={meeting.time}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'time', value)
                            }
                            placeholder="8:30 am - 11:20 am"
                          />
                          <Field
                            label="Days"
                            value={meeting.days}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'days', value)
                            }
                            placeholder="MWF"
                          />
                          <Field
                            label="Location"
                            value={meeting.location}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'location', value)
                            }
                            placeholder="DTC - 462"
                          />
                          <Field
                            label="Date Range"
                            value={meeting.dateRange}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'dateRange', value)
                            }
                            placeholder="Sep 02, 2025 - Dec 12, 2025"
                          />
                          <Field
                            label="Schedule Type"
                            value={meeting.scheduleType}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'scheduleType', value)
                            }
                            placeholder="Lecture/Lab Combo"
                          />
                          <Field
                            label="Instructors"
                            value={meeting.instructors}
                            onChange={(value) =>
                              handleMeetingChange(course.id, meeting.id, 'instructors', value)
                            }
                            placeholder="Name (P)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </section>

      <section className="sticky bottom-6 z-10 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="cursor-pointer rounded-md border border-[#003c71] bg-[#003c71]/5 px-4 py-2 text-sm font-medium text-[#003c71] transition hover:bg-[#003c71]/10"
          >
            🎲 Randomize
          </button>
          <button
            type="button"
            onClick={handleAddCourse}
            className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            Add Course
          </button>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="cursor-pointer rounded-md bg-[#003c71] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#004a8a]"
          >
            Download HTML
          </button>
        </div>
      </section>

      {previewOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Preview Transcript</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-md bg-[#003c71] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#004a8a]"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              title="Transcript preview"
              srcDoc={previewHtml}
              className="h-full w-full bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TranscriptBuilder
