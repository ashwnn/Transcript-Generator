import { TranscriptData, CourseEntry, MeetingSlot } from "@/types/transcript";

const escapeHtml = (raw: string): string => {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderMeetingRow = (meeting: MeetingSlot): string => {
  const safe = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? escapeHtml(trimmed) : "&nbsp;";
  };

  return `<tr>
  <td class="dddefault">${safe(meeting.type)}</td>
  <td class="dddefault">${safe(meeting.time)}</td>
  <td class="dddefault">${safe(meeting.days)}</td>
  <td class="dddefault">${safe(meeting.location)}</td>
  <td class="dddefault">${safe(meeting.dateRange)}</td>
  <td class="dddefault">${safe(meeting.scheduleType)}</td>
  <td class="dddefault">${safe(meeting.instructors)}</td>
</tr>`;
};

const renderCourseSection = (course: CourseEntry): string => {
  const safe = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? escapeHtml(trimmed) : "&nbsp;";
  };

  const meetings = course.meetings.length
    ? course.meetings.map(renderMeetingRow).join("\n")
    : renderMeetingRow({
        id: "placeholder",
        type: "Class",
        time: "TBA",
        days: "",
        location: "TBA",
        dateRange: "",
        scheduleType: "",
        instructors: "TBA",
      });

  return `<table class="datadisplaytable" summary="This layout table is used to present the schedule course detail">
  <caption class="captiontext">${safe(course.title)}</caption>
  <tbody>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Associated Term:</th>
      <td class="dddefault">${safe(course.associatedTerm)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row"><acronym title="Course Reference Number">CRN</acronym>:</th>
      <td class="dddefault">${safe(course.crn)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Status:</th>
      <td class="dddefault">${safe(course.status)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Assigned Instructor:</th>
      <td class="dddefault">${safe(course.assignedInstructor)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Grade Mode:</th>
      <td class="dddefault">${safe(course.gradeMode)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Credits:</th>
      <td class="dddefault"> ${safe(course.credits)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Level:</th>
      <td class="dddefault">${safe(course.level)}</td>
    </tr>
    <tr>
      <th colspan="2" class="ddlabel" scope="row">Campus:</th>
      <td class="dddefault">${safe(course.campus)}</td>
    </tr>
  </tbody>
</table>
<table class="datadisplaytable" summary="This table lists the scheduled meeting times and assigned instructors for this class..">
  <caption class="captiontext">Scheduled Meeting Times</caption>
  <tbody>
    <tr>
      <th class="ddheader" scope="col">Type</th>
      <th class="ddheader" scope="col">Time</th>
      <th class="ddheader" scope="col">Days</th>
      <th class="ddheader" scope="col">Where</th>
      <th class="ddheader" scope="col">Date Range</th>
      <th class="ddheader" scope="col">Schedule Type</th>
      <th class="ddheader" scope="col">Instructors</th>
    </tr>
    ${meetings}
  </tbody>
</table>
<br>`;
};

export const buildTranscriptHtml = (data: TranscriptData): string => {
  const safe = (value: string) => escapeHtml(value.trim());
  const safeMultiline = (value: string) =>
    escapeHtml(value.trim()).replace(/\n/g, "<br />");

  const courseSections = data.courses.map(renderCourseSection).join("\n");

  const student = data.student;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/transitional.dtd">
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Pragma" name="Cache-Control" content="no-cache">
  <meta http-equiv="Cache-Control" name="Cache-Control" content="no-cache">
  <title>View Course Schedule</title>
  <meta http-equiv="Content-Script-Type" name="Default_Script_Language" content="text/javascript">
  <style>
    .rightaligntext { text-align: right; font-size: 90%; }
    .captiontext {
      color: #1E2B83;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: bold;
      font-size: 100%;
      font-style: italic;
      text-align: left;
      margin-top: 1em;
    }
    .infotext {
      color: #666;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: normal;
      font-size: 90%;
      font-style: normal;
      text-align: left;
    }
    BODY {
      background-color: #fff;
      color: #000;
      font-family: verdana, helvetica, arial, sans-serif;
      font-style: normal;
      text-align: left;
      margin-top: 0px;
      margin-left: 2%;
      background-repeat: no-repeat;
    }
    DIV.pagetitlediv { text-align: left; }
    DIV.infotextdiv { text-align: left; }
    DIV.pagebodydiv { text-align: left; }
    DIV.staticheaders { text-align: right; font-size: 90%; }
    H1 {
      color: #27b;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: bold;
      font-style: normal;
      font-size: 90%;
      margin-top: 0px;
      padding-top: 0px;
      padding-bottom: 3px;
      border-bottom: 1px dotted #aaa;
    }
    H2 {
      color: #247;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: normal;
      font-size: 120%;
      font-style: normal;
    }
    TABLE.datadisplaytable {
      border-bottom: 0px solid;
      border-left: 0px solid;
      border-right: 0px solid;
      border-top: 0px solid;
    }
    TABLE.plaintable {
      border-bottom: 0px solid;
      border-left: 0px solid;
      border-right: 0px solid;
      border-top: 0px solid;
    }
    TABLE TD {
      vertical-align: top;
      color: #666;
    }
    TABLE TH.ddheader {
      background-color: #EEEEEE;
      color: #222;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: bold;
      font-size: 90%;
      font-style: normal;
      text-align: left;
      vertical-align: top;
    }
    TABLE TH.ddlabel {
      background-color: #EEEEEEE;
      color: #222;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: bold;
      font-size: 90%;
      font-style: normal;
      text-align: left;
      vertical-align: top;
    }
    TABLE TD.dddefault {
      color: #222;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: normal;
      font-size: 90%;
      font-style: normal;
      text-align: left;
      vertical-align: top;
    }
    TABLE TD.pldefault {
      font-weight: normal;
      font-size: 90%;
    }
    TABLE TD.indefault {
      color: #222;
      font-family: verdana, helvetica, arial, sans-serif;
      font-weight: normal;
      font-size: 90%;
      font-style: normal;
      text-align: left;
    }
  </style>
</head>
<body>
<div class="pagetitlediv">
  <table class="plaintable" summary="This table displays title and static header displays." width="100%">
    <tbody>
      <tr>
        <td class="pldefault">
          <h2>View Course Schedule</h2>
        </td>
        <td class="pldefault">&nbsp;</td>
        <td class="pldefault">
          <p class="rightaligntext">
            <div class="staticheaders">
              ${safe(student.studentId)} ${safe(student.name)}<br>
              ${safe(student.term)}<br>
              ${safe(student.generatedOn)}<br>
            </div>
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<div class="pagebodydiv">
  <div class="infotextdiv">
    <table class="infotexttable" summary="This layout table contains information that may be helpful in understanding the content and functionality of this page.">
      <tbody>
        <tr>
          <td class="indefault">
            <span class="infotext">
              <p>${safeMultiline(student.note)}</p>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <p></p>
  </div>
  Total Credit Hours: ${safe(student.totalCredits)}
  <br><br>
  ${courseSections}
</div>
</body>
</html>`;
};

export const buildTranscriptFileName = (data: TranscriptData): string => {
  const termToken = data.student.term
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const idToken = data.student.studentId
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = termToken ? `-${termToken}` : "";
  const prefix = idToken ? `${idToken}-` : "transcript-";

  return `${prefix}course-schedule${suffix || ""}.html`;
};
