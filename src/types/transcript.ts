export interface MeetingSlot {
  id: string;
  type: string;
  time: string;
  days: string;
  location: string;
  dateRange: string;
  scheduleType: string;
  instructors: string;
}

export interface CourseEntry {
  id: string;
  title: string;
  associatedTerm: string;
  crn: string;
  status: string;
  assignedInstructor: string;
  gradeMode: string;
  credits: string;
  level: string;
  campus: string;
  meetings: MeetingSlot[];
}

export interface StudentDetails {
  name: string;
  studentId: string;
  term: string;
  generatedOn: string;
  totalCredits: string;
  note: string;
}

export interface TranscriptData {
  student: StudentDetails;
  courses: CourseEntry[];
}
