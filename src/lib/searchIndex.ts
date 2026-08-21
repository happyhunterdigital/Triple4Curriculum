import { SearchResultItem } from '../types';
import { api } from './api';
import { institutionalDocuments } from './documents';

export async function searchGlobalPlatform(query: string, filterCategory?: string): Promise<SearchResultItem[]> {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  try {
    const [courses, assignments, timetable, users] = await Promise.all([
      api.getCourses().catch(() => []),
      api.getAssignments().catch(() => []),
      api.getTimetable().catch(() => []),
      api.getUsers().catch(() => [])
    ]);

    // 1. Courses Search
    courses.forEach(c => {
      if (
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.lecturerName.toLowerCase().includes(q)
      ) {
        results.push({
          id: `course_${c.id}`,
          type: 'course',
          title: `${c.code}: ${c.title}`,
          subtitle: `Faculty: ${c.lecturerName} • ${c.modulesCount} Modules (${c.credits} Credits)`,
          meta: `Syllabus Code: ${c.code}`,
          route: `/student/lectures`,
          badge: `${c.credits} Credits`,
          category: 'Courses & Modules',
          iconName: 'BookOpen'
        });
      }
    });

    // 2. Assignments Search
    assignments.forEach(a => {
      if (
        a.title.toLowerCase().includes(q) ||
        a.courseCode.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: `assignment_${a.id}`,
          type: 'assignment',
          title: a.title,
          subtitle: `${a.courseCode} • Due: ${a.dueDate} (${a.maxPoints} pts max)`,
          meta: `Status: ${a.status || 'Pending'}`,
          route: `/student/assignments`,
          badge: `Due ${a.dueDate}`,
          category: 'Assignments & Submissions',
          iconName: 'FileText'
        });
      }
    });

    // 3. Institutional Documents Search
    institutionalDocuments.forEach(doc => {
      if (
        doc.title.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.tags.some(t => t.toLowerCase().includes(q)) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.author.toLowerCase().includes(q)
      ) {
        results.push({
          id: `doc_${doc.id}`,
          type: 'document',
          title: doc.title,
          subtitle: `${doc.category} • ${doc.version} (${doc.fileFormat}, ${doc.fileSizeKb} KB)`,
          meta: doc.dhetAccreditationCode || 'POPIA Compliant',
          route: '#document',
          badge: doc.fileFormat,
          category: 'Internal Documents & Policies',
          iconName: 'FileCheck',
          documentId: doc.id
        });
      }
    });

    // 4. Faculty & Instructors Search
    const faculty = users.filter(u => u.role === 'lecturer' || u.role === 'admin');
    faculty.forEach(f => {
      if (
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.departmentName && f.departmentName.toLowerCase().includes(q))
      ) {
        results.push({
          id: `faculty_${f.id}`,
          type: 'faculty',
          title: f.name,
          subtitle: `${f.role === 'admin' ? 'Administrator' : 'Faculty Member'} • ${f.departmentName || 'Academic Senate'}`,
          meta: f.email,
          route: f.role === 'admin' ? '/admin/dashboard' : '/lecturer/dashboard',
          badge: f.role === 'admin' ? 'Executive' : 'Faculty',
          category: 'Faculty & Senate',
          iconName: 'Users'
        });
      }
    });

    // 5. Direct Quick Platform Actions
    const quickActions: SearchResultItem[] = [
      {
        id: 'action_speedgrader',
        type: 'action',
        title: 'Launch SpeedGrader™ Marking Suite',
        subtitle: 'Faculty grading dashboard with rubrics, audio feedback, and mark sync',
        route: '/lecturer/grading',
        badge: 'Faculty',
        category: 'Quick Actions',
        iconName: 'ClipboardCheck'
      },
      {
        id: 'action_sasams_audit',
        type: 'action',
        title: 'Run SA-SAMS Statutory Compliance Audit',
        subtitle: 'Export DHET/SETA verified attendance & academic reports',
        route: '/admin/reports',
        badge: 'Admin',
        category: 'Quick Actions',
        iconName: 'ShieldAlert'
      },
      {
        id: 'action_submit_assignment',
        type: 'action',
        title: 'Submit Assignment & Milestone Code',
        subtitle: 'Upload files with rubric verification for active course milestones',
        route: '/student/assignments',
        badge: 'Student',
        category: 'Quick Actions',
        iconName: 'UploadCloud'
      },
      {
        id: 'action_timetable',
        type: 'action',
        title: 'View Weekly Academic Timetable',
        subtitle: 'Real-time clash-free schedule with lab and lecture rooms',
        route: '/student/timetable',
        badge: 'Schedule',
        category: 'Quick Actions',
        iconName: 'Calendar'
      },
      {
        id: 'action_authoring',
        type: 'action',
        title: 'Create New Lecture & AI Quiz',
        subtitle: 'Author adaptive video modules, notes, and interactive quizzes',
        route: '/lecturer/authoring',
        badge: 'Faculty',
        category: 'Quick Actions',
        iconName: 'Sparkles'
      }
    ];

    quickActions.forEach(action => {
      if (action.title.toLowerCase().includes(q) || action.subtitle.toLowerCase().includes(q)) {
        results.push(action);
      }
    });

  } catch (err) {
    console.error('Global search indexing error:', err);
  }

  if (filterCategory && filterCategory !== 'All') {
    return results.filter(r => r.category.toLowerCase().includes(filterCategory.toLowerCase()) || r.type === filterCategory.toLowerCase());
  }

  return results;
}
