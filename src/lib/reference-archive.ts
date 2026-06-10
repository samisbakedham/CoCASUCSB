export interface ReferenceFile {
  title: string;
  path: string;
  group: string;
  kind: "minutes" | "chairs";
  date?: string;
}

export const minuteArchive: ReferenceFile[] = [
  { title: "September 29, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/9-29-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-09-29" },
  { title: "October 6, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/ 10-6-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-10-06" },
  { title: "October 13, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/10-13-25 Committee on Committees Minutes_.docx", group: "Fall 2025", kind: "minutes", date: "2025-10-13" },
  { title: "October 20, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/10-20-25 Committee on Committees Minutes_.docx", group: "Fall 2025", kind: "minutes", date: "2025-10-20" },
  { title: "October 27, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/10-27-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-10-27" },
  { title: "November 3, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/11-3-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-11-03" },
  { title: "November 10, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/11-10-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-11-10" },
  { title: "November 17, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/11-17-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-11-17" },
  { title: "November 24, 2025 Committee on Committees Minutes", path: "reference/Minutes/Fall quarter 2025 - CoC minutes/11-24-25 Committee on Committees Minutes.docx", group: "Fall 2025", kind: "minutes", date: "2025-11-24" },
  { title: "January 5, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/1-5-26 Committee on Committees Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-01-05" },
  { title: "January 12, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/1-12-26 Committee on Committees Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-01-12" },
  { title: "January 26, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/1-26-26 Committee on Committees Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-01-26" },
  { title: "February 2, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/2-2-26 Committee on Committees Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-02-02" },
  { title: "February 16, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/2-16-26 Committee on Committee Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-02-16" },
  { title: "February 23, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/2-23-26 Committee on Committees Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-02-23" },
  { title: "March 2, 2026 Committee on Committees Minutes", path: "reference/Minutes/Winter quarter/3-2-26 Committee on Committees Minutes.docx", group: "Winter 2026", kind: "minutes", date: "2026-03-02" },
  { title: "April 1, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/4-1-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-04-01" },
  { title: "April 8, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/4-8-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-04-08" },
  { title: "April 15, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/4-15-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-04-15" },
  { title: "April 22, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/4-22-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-04-22" },
  { title: "April 29, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/4-29-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-04-29" },
  { title: "May 6, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/5-6-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-05-06" },
  { title: "May 13, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/5-13-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-05-13" },
  { title: "May 20, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/5-20-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-05-20" },
  { title: "May 27, 2026 Committee on Committees Minutes", path: "reference/Minutes/Spring quarter/5-27-26 Committee on Committees Minutes.docx", group: "Spring 2026", kind: "minutes", date: "2026-05-27" },
];

export const chairsMeetingArchive: ReferenceFile[] = [
  { title: "AS Senate Meeting 10/6/25", path: "reference/Chairs Meeting/AS Senate Meeting 10_6_25.docx", group: "Chairs meeting source files", kind: "chairs", date: "2025-10-06" },
  { title: "Fall Quarter 2025 AS Chairs Meeting Summary", path: "reference/Chairs Meeting/Fall Quarter 2025 AS Chairs Meeting Summary.docx", group: "Chairs meeting source files", kind: "chairs" },
  { title: "Chairs Meeting 1/12/26 Notes", path: "reference/Chairs Meeting/Chairs Meeting 1_12_26 Notes.docx", group: "Chairs meeting source files", kind: "chairs", date: "2026-01-12" },
  { title: "Winter 2026 Chairs Meeting Planning", path: "reference/Chairs Meeting/Chairs meeting W26 planning.docx", group: "Chairs meeting source files", kind: "chairs" },
  { title: "Winter 2026 Chairs Meeting Notes", path: "reference/Chairs Meeting/W26 Chairs Meeting notes.docx", group: "Chairs meeting source files", kind: "chairs" },
  { title: "Chairs Meeting Attendance Tracking", path: "reference/Chairs Meeting/Chairs Meeting Attendance Tracking.xlsx", group: "Chairs meeting source files", kind: "chairs" },
  { title: "Quarterly Chairs Meeting RSVP Responses", path: "reference/Chairs Meeting/Quarterly Chairs Meeting RSVP (Responses).xlsx", group: "Chairs meeting source files", kind: "chairs" },
];

export const referenceArchive = [...minuteArchive, ...chairsMeetingArchive];
