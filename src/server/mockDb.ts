import { 
  User, Department, Course, Lecture, TimetableSlot, 
  Assignment, AssignmentSubmission, AttendanceRecord, 
  Badge, AuditLog, PushNotification, ChatMessage, SystemAnnouncement,
  LearnerCourseProgress, TeacherSummary
} from '../types';

export class DatabaseStore {
  users: User[] = [
    {
      id: 'stu_01',
      name: 'Sarah Khumalo',
      email: 'sarah.k@triple4c.edu',
      role: 'student',
      studentId: '444-STU-8821',
      departmentId: 'dept_cs',
      departmentName: 'Department of Computing & Applied AI',
      level: 6,
      xp: 2450,
      streakDays: 6,
      lastActiveDate: '2026-08-20',
      badges: ['badge_pioneer', 'badge_streak7', 'badge_quiz_master', 'badge_ethics'],
      registeredDate: '2025-02-10'
    },
    {
      id: 'stu_02',
      name: 'Liam Naidoo',
      email: 'liam.n@triple4c.edu',
      role: 'student',
      studentId: '444-STU-9042',
      departmentId: 'dept_eng',
      departmentName: 'Department of Systems Engineering & Robotics',
      level: 4,
      xp: 1620,
      streakDays: 3,
      lastActiveDate: '2026-08-19',
      badges: ['badge_pioneer', 'badge_fast_submit'],
      registeredDate: '2025-03-01'
    },
    {
      id: 'stu_03',
      name: 'Tebogo Molefe',
      email: 'tebogo.m@triple4c.edu',
      role: 'student',
      studentId: '444-STU-7419',
      departmentId: 'dept_biz',
      departmentName: 'Department of Digital Business & FinTech',
      level: 5,
      xp: 1980,
      streakDays: 4,
      lastActiveDate: '2026-08-20',
      badges: ['badge_pioneer', 'badge_ethics'],
      registeredDate: '2025-01-15'
    },
    {
      id: 'stu_04',
      name: 'Anesu Moyo',
      email: 'anesu.m@triple4c.edu',
      role: 'student',
      studentId: '444-STU-6310',
      departmentId: 'dept_cs',
      departmentName: 'Department of Computing & Applied AI',
      level: 5,
      xp: 2100,
      streakDays: 5,
      lastActiveDate: '2026-08-20',
      badges: ['badge_pioneer', 'badge_quiz_master'],
      registeredDate: '2025-02-18'
    },
    {
      id: 'stu_05',
      name: 'Keagan Peters',
      email: 'keagan.p@triple4c.edu',
      role: 'student',
      studentId: '444-STU-5128',
      departmentId: 'dept_eng',
      departmentName: 'Department of Systems Engineering & Robotics',
      level: 3,
      xp: 1140,
      streakDays: 1,
      lastActiveDate: '2026-08-16',
      badges: ['badge_pioneer'],
      registeredDate: '2025-03-12'
    },
    {
      id: 'stu_06',
      name: 'Thandiwe Sithole',
      email: 'thandiwe.s@triple4c.edu',
      role: 'student',
      studentId: '444-STU-8193',
      departmentId: 'dept_biz',
      departmentName: 'Department of Digital Business & FinTech',
      level: 6,
      xp: 2600,
      streakDays: 8,
      lastActiveDate: '2026-08-20',
      badges: ['badge_pioneer', 'badge_streak7', 'badge_fast_submit'],
      registeredDate: '2025-01-20'
    },
    {
      id: 'stu_07',
      name: 'Ethan Botha',
      email: 'ethan.b@triple4c.edu',
      role: 'student',
      studentId: '444-STU-4921',
      departmentId: 'dept_cs',
      departmentName: 'Department of Computing & Applied AI',
      level: 7,
      xp: 2890,
      streakDays: 11,
      lastActiveDate: '2026-08-20',
      badges: ['badge_pioneer', 'badge_streak7', 'badge_quiz_master'],
      registeredDate: '2025-01-10'
    },
    {
      id: 'stu_08',
      name: 'Fatima Al-Mansoor',
      email: 'fatima.m@triple4c.edu',
      role: 'student',
      studentId: '444-STU-9382',
      departmentId: 'dept_med',
      departmentName: 'Department of Health Sciences & Informatics',
      level: 6,
      xp: 2520,
      streakDays: 7,
      lastActiveDate: '2026-08-20',
      badges: ['badge_pioneer', 'badge_ethics'],
      registeredDate: '2025-02-05'
    },
    {
      id: 'stu_09',
      name: 'Sipho Dube',
      email: 'sipho.d@triple4c.edu',
      role: 'student',
      studentId: '444-STU-3184',
      departmentId: 'dept_cs',
      departmentName: 'Department of Computing & Applied AI',
      level: 2,
      xp: 850,
      streakDays: 0,
      lastActiveDate: '2026-08-14',
      badges: ['badge_pioneer'],
      registeredDate: '2025-03-25'
    },
    {
      id: 'stu_10',
      name: 'Chloe Van Zyl',
      email: 'chloe.v@triple4c.edu',
      role: 'student',
      studentId: '444-STU-7751',
      departmentId: 'dept_med',
      departmentName: 'Department of Health Sciences & Informatics',
      level: 5,
      xp: 2040,
      streakDays: 4,
      lastActiveDate: '2026-08-19',
      badges: ['badge_pioneer', 'badge_quiz_master'],
      registeredDate: '2025-02-22'
    },
    {
      id: 'lec_01',
      name: 'Dr. Arthur Vance',
      email: 'arthur.vance@triple4c.edu',
      role: 'lecturer',
      employeeId: '444-FAC-104',
      departmentId: 'dept_cs',
      departmentName: 'Department of Computing & Applied AI',
      registeredDate: '2024-01-08'
    },
    {
      id: 'lec_02',
      name: 'Prof. Nomvula Dlamini',
      email: 'nomvula.d@triple4c.edu',
      role: 'lecturer',
      employeeId: '444-FAC-108',
      departmentId: 'dept_eng',
      departmentName: 'Department of Systems Engineering & Robotics',
      registeredDate: '2024-02-14'
    },
    {
      id: 'lec_03',
      name: 'Dr. Johan van der Merwe',
      email: 'johan.v@triple4c.edu',
      role: 'lecturer',
      employeeId: '444-FAC-112',
      departmentId: 'dept_biz',
      departmentName: 'Department of Digital Business & FinTech',
      registeredDate: '2024-03-10'
    },
    {
      id: 'lec_04',
      name: 'Dr. Priya Patel',
      email: 'priya.p@triple4c.edu',
      role: 'lecturer',
      employeeId: '444-FAC-115',
      departmentId: 'dept_med',
      departmentName: 'Department of Health Sciences & Informatics',
      registeredDate: '2024-04-01'
    },
    {
      id: 'adm_01',
      name: 'Dean Margaret Edwards',
      email: 'm.edwards@triple4c.edu',
      role: 'admin',
      employeeId: '444-ADM-001',
      departmentId: 'dept_core',
      departmentName: 'Department of 444 Core Foundations & Governance',
      registeredDate: '2023-11-01'
    }
  ];

  departments: Department[] = [
    {
      id: 'dept_cs',
      name: 'Department of Computing & Applied AI',
      code: '444-CS',
      description: 'Advanced algorithms, machine learning systems, distributed computing, and secure cloud software engineering.',
      headOfDepartment: 'Dr. Arthur Vance',
      facultyCount: 14,
      studentCount: 380,
      color: '#15803d'
    },
    {
      id: 'dept_eng',
      name: 'Department of Systems Engineering & Robotics',
      code: '444-ENG',
      description: 'Autonomous hardware, embedded IoT telematics, cyber-physical automation, and mechatronic design.',
      headOfDepartment: 'Prof. Nomvula Dlamini',
      facultyCount: 11,
      studentCount: 295,
      color: '#ca8a04'
    },
    {
      id: 'dept_biz',
      name: 'Department of Digital Business & FinTech',
      code: '444-BIZ',
      description: 'Decentralized finance, automated quantitative strategies, platform economics, and high-growth leadership.',
      headOfDepartment: 'Dr. Johan van der Merwe',
      facultyCount: 9,
      studentCount: 320,
      color: '#166534'
    },
    {
      id: 'dept_med',
      name: 'Department of Health Sciences & Informatics',
      code: '444-MED',
      description: 'Biomedical data systems, clinical epidemiology analytics, telemedicine architectures, and digital health.',
      headOfDepartment: 'Dr. Priya Patel',
      facultyCount: 8,
      studentCount: 210,
      color: '#0f766e'
    },
    {
      id: 'dept_core',
      name: 'Department of 444 Core Foundations & Ethics',
      code: '444-CORE',
      description: 'Character, Competency, Critical Thinking, and Creativity foundational curriculum for all institutional cohorts.',
      headOfDepartment: 'Dean Margaret Edwards',
      facultyCount: 12,
      studentCount: 1205,
      color: '#000000'
    }
  ];

  courses: Course[] = [
    {
      id: 'crs_cs201',
      code: 'CSC-441',
      title: 'Distributed Systems & Adaptive Cloud Architectures',
      departmentId: 'dept_cs',
      lecturerId: 'lec_01',
      lecturerName: 'Dr. Arthur Vance',
      credits: 16,
      description: 'Design resilient microservices, consensus protocols, adaptive streaming pipelines, and serverless high-concurrency architectures.',
      semester: 'Semester 2 - 2026',
      progressPercent: 78,
      modulesCount: 6,
      totalHours: 48
    },
    {
      id: 'crs_ai302',
      code: 'CSC-442',
      title: 'Neural Networks, LLMs & Cognitive Systems',
      departmentId: 'dept_cs',
      lecturerId: 'lec_01',
      lecturerName: 'Dr. Arthur Vance',
      credits: 20,
      description: 'Mathematical foundations of transformer architectures, attention mechanisms, reinforcement learning, and multimodal reasoning.',
      semester: 'Semester 2 - 2026',
      progressPercent: 62,
      modulesCount: 8,
      totalHours: 60
    },
    {
      id: 'crs_eng101',
      code: 'ENG-441',
      title: 'Autonomous Robotics & Sensor Fusion',
      departmentId: 'dept_eng',
      lecturerId: 'lec_02',
      lecturerName: 'Prof. Nomvula Dlamini',
      credits: 16,
      description: 'Kalman filtering, real-time PID motor controls, ROS2 node pipelines, and computer vision lidar mapping.',
      semester: 'Semester 2 - 2026',
      progressPercent: 45,
      modulesCount: 5,
      totalHours: 50
    },
    {
      id: 'crs_biz204',
      code: 'BIZ-441',
      title: 'FinTech Rails, Payment Gateways & Cryptoeconomics',
      departmentId: 'dept_biz',
      lecturerId: 'lec_03',
      lecturerName: 'Dr. Johan van der Merwe',
      credits: 14,
      description: 'Regional payment infrastructure (PayFast, Ozow, Paystack), settlement reconciliations, and API security tokenization.',
      semester: 'Semester 2 - 2026',
      progressPercent: 30,
      modulesCount: 4,
      totalHours: 36
    },
    {
      id: 'crs_med101',
      code: 'MED-441',
      title: 'Biomedical Informatics & Clinical Telemetry',
      departmentId: 'dept_med',
      lecturerId: 'lec_04',
      lecturerName: 'Dr. Priya Patel',
      credits: 16,
      description: 'Health data standards (FHIR/HL7), clinical decision telemetry, epidemiology modeling, and medical AI pipelines.',
      semester: 'Semester 2 - 2026',
      progressPercent: 55,
      modulesCount: 6,
      totalHours: 44
    },
    {
      id: 'crs_core101',
      code: 'COR-441',
      title: '444 Curriculum: Critical Thinking & Data Ethics',
      departmentId: 'dept_core',
      lecturerId: 'adm_01',
      lecturerName: 'Dean Margaret Edwards',
      credits: 12,
      description: 'Ethical governance, POPIA compliance protocols, cognitive bias mitigation, and philosophical frameworks for technology leaders.',
      semester: 'Semester 2 - 2026',
      progressPercent: 90,
      modulesCount: 4,
      totalHours: 32
    }
  ];

  lectures: Lecture[] = [
    {
      id: 'lec_01_01',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      title: 'Lecture 1: Principles of Fault-Tolerant Distributed Consensus',
      moduleName: 'Module 1: Resilient Architectures',
      order: 1,
      videoDurationMinutes: 34,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      bitrates: [
        { label: 'Auto (Adaptive)', resolution: 'Dynamic', bitrateKbps: 0 },
        { label: '1080p Full HD', resolution: '1920x1080', bitrateKbps: 4500 },
        { label: '720p HD', resolution: '1280x720', bitrateKbps: 2200 },
        { label: '480p SD (Data Saver)', resolution: '854x480', bitrateKbps: 800 }
      ],
      summary: 'Explores CAP theorem tradeoffs, Raft leader election, split-brain resolutions, and state machine replication over lossy networks.',
      readingNotes: `### Core Principles of 444 Distributed Consensus
1. **Network Partitions & Asynchrony**: Real-world internet infrastructure fluctuates across nodes. Raft solves state agreement by guaranteeing leader determinism and log term invariants.
2. **Dynamic DRM & Intellectual Property Protection**: All distributed learning assets are protected with cryptographic user watermarking to satisfy institutional compliance and educational copyright laws.
3. **Adaptive Bitrate Streaming (ABS)**: Video segments are chunked via HLS/DASH to match real-time network throughput and prevent buffer starvation.`,
      completed: true,
      quiz: {
        question: 'Under the CAP theorem, when a network partition (P) occurs, what must a distributed storage system choose between?',
        options: [
          'Latency and Throughput',
          'Consistency (C) and Availability (A)',
          'Bandwidth and Compression Ratio',
          'Encryption and Key Rotation'
        ],
        correctIndex: 1,
        explanation: 'During an unavoidable network partition, a distributed system must choose between returning consistent data or remaining available for all read/write requests.',
        xpReward: 150
      }
    },
    {
      id: 'lec_01_02',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      title: 'Lecture 2: Event-Driven Microservices & Message Brokers',
      moduleName: 'Module 2: Streaming & Messaging',
      order: 2,
      videoDurationMinutes: 42,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      bitrates: [
        { label: 'Auto (Adaptive)', resolution: 'Dynamic', bitrateKbps: 0 },
        { label: '1080p Full HD', resolution: '1920x1080', bitrateKbps: 4500 },
        { label: '720p HD', resolution: '1280x720', bitrateKbps: 2200 },
        { label: '480p SD (Data Saver)', resolution: '854x480', bitrateKbps: 800 }
      ],
      summary: 'Deep dive into asynchronous event brokers, idempotency keys, dead-letter queues, and outbox transactional patterns.',
      readingNotes: `### Event-Driven Architectures in Practice
- **At-Least-Once Delivery**: Consumer handlers must be idempotent to tolerate re-delivery.
- **Outbox Pattern**: Atomically persist business entities and domain events in a single database transaction.`,
      completed: false,
      quiz: {
        question: 'Why are idempotency keys critical in financial event-driven message architectures?',
        options: [
          'To encrypt messages at rest',
          'To prevent duplicate transactions when networks retry delivery',
          'To compress the JSON payload',
          'To speed up CPU clock cycles'
        ],
        correctIndex: 1,
        explanation: 'Idempotency keys ensure that processing a retry message multiple times yields the exact same state without double charging or corrupting balances.',
        xpReward: 150
      }
    },
    {
      id: 'lec_02_01',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      title: 'Lecture 1: Scaled Dot-Product Attention & Positional Encoding',
      moduleName: 'Module 1: Transformers',
      order: 1,
      videoDurationMinutes: 38,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      bitrates: [
        { label: 'Auto (Adaptive)', resolution: 'Dynamic', bitrateKbps: 0 },
        { label: '1080p Full HD', resolution: '1920x1080', bitrateKbps: 4500 },
        { label: '720p HD', resolution: '1280x720', bitrateKbps: 2200 },
        { label: '480p SD (Data Saver)', resolution: '854x480', bitrateKbps: 800 }
      ],
      summary: 'Mathematical formulation of Query, Key, Value vectors, softmax temperature normalization, and RoPE rotary embeddings.',
      readingNotes: `### Scaled Attention Mathematics
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V.
The scaling factor sqrt(d_k) prevents small gradients when the dimensionality of keys is high.`,
      completed: true,
      quiz: {
        question: 'What is the primary role of dividing by sqrt(d_k) in scaled dot-product attention?',
        options: [
          'To prevent the softmax function from having extremely small gradients in high dimensions',
          'To convert text into binary numbers',
          'To reduce GPU memory by half',
          'To eliminate the need for training weights'
        ],
        correctIndex: 0,
        explanation: 'For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Scaling mitigates this.',
        xpReward: 175
      }
    }
  ];

  timetable: TimetableSlot[] = [
    {
      id: 'slot_01',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      lecturerName: 'Dr. Arthur Vance',
      lecturerId: 'lec_01',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'Turing Hall A & Stream Room 1',
      type: 'Lecture',
      departmentId: 'dept_cs',
      onlineLink: 'https://meet.triple4c.edu/cs201-live'
    },
    {
      id: 'slot_02',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      lecturerName: 'Dr. Arthur Vance',
      lecturerId: 'lec_01',
      dayOfWeek: 'Monday',
      startTime: '11:00',
      endTime: '12:30',
      room: 'AI Supercomputing Lab 3',
      type: 'Lab',
      departmentId: 'dept_cs',
      onlineLink: 'https://meet.triple4c.edu/ai302-lab'
    },
    {
      id: 'slot_03',
      courseId: 'crs_core101',
      courseCode: 'COR-441',
      courseTitle: '444 Curriculum: Critical Thinking & Data Ethics',
      lecturerName: 'Dean Margaret Edwards',
      lecturerId: 'adm_01',
      dayOfWeek: 'Tuesday',
      startTime: '10:00',
      endTime: '11:30',
      room: 'Mandela Auditorium',
      type: 'Lecture',
      departmentId: 'dept_core',
      onlineLink: 'https://meet.triple4c.edu/core441'
    },
    {
      id: 'slot_04',
      courseId: 'crs_eng101',
      courseCode: 'ENG-441',
      courseTitle: 'Autonomous Robotics & Sensor Fusion',
      lecturerName: 'Prof. Nomvula Dlamini',
      lecturerId: 'lec_02',
      dayOfWeek: 'Wednesday',
      startTime: '14:00',
      endTime: '16:00',
      room: 'Robotics Prototyping Bay 2',
      type: 'Lab',
      departmentId: 'dept_eng',
      onlineLink: 'https://meet.triple4c.edu/eng441-robotics'
    },
    {
      id: 'slot_05',
      courseId: 'crs_biz204',
      courseCode: 'BIZ-441',
      courseTitle: 'FinTech Rails, Payment Gateways & Cryptoeconomics',
      lecturerName: 'Dr. Johan van der Merwe',
      lecturerId: 'lec_01',
      dayOfWeek: 'Thursday',
      startTime: '09:30',
      endTime: '11:00',
      room: 'FinTech Center 102',
      type: 'Lecture',
      departmentId: 'dept_biz',
      onlineLink: 'https://meet.triple4c.edu/biz441-fintech'
    },
    {
      id: 'slot_06',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      lecturerName: 'Dr. Arthur Vance',
      lecturerId: 'lec_01',
      dayOfWeek: 'Friday',
      startTime: '13:00',
      endTime: '14:30',
      room: 'Online Interactive Arena',
      type: 'Tutorial',
      departmentId: 'dept_cs',
      onlineLink: 'https://meet.triple4c.edu/cs201-tutorial'
    }
  ];

  assignments: Assignment[] = [
    {
      id: 'asg_01',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      title: 'Milestone 1: Resilient Raft Cluster Implementation',
      description: 'Construct a 3-node in-memory cluster simulating heartbeat RPCs, election timers, and log term replication under simulated 20% packet drops.',
      dueDate: '2026-08-28 23:59',
      maxPoints: 100,
      departmentId: 'dept_cs',
      lecturerId: 'lec_01',
      rubric: [
        { id: 'r1', title: 'Leader Election & Heartbeat Timers', maxScore: 30, description: 'Correct state transition to candidate and unanimous majority votes.' },
        { id: 'r2', title: 'Log Replication & Term Validation', maxScore: 40, description: 'Strict verification of term IDs and log index append validation.' },
        { id: 'r3', title: 'Code Clarity & 444 Architecture Cleanliness', maxScore: 30, description: 'Adherence to clean module interfaces and unit test coverage.' }
      ],
      status: 'submitted'
    },
    {
      id: 'asg_02',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      title: 'Milestone 2: Attention Map Visualizer & KV-Cache Analysis',
      description: 'Implement a multi-head self-attention module in PyTorch/NumPy and compute KV-cache memory footprints for long context windows.',
      dueDate: '2026-09-04 23:59',
      maxPoints: 100,
      departmentId: 'dept_cs',
      lecturerId: 'lec_01',
      rubric: [
        { id: 'r1', title: 'Attention Formula Exactness', maxScore: 40, description: 'Scaled dot-product matrix multiplication and causal masking.' },
        { id: 'r2', title: 'KV-Cache Memory Benchmarks', maxScore: 35, description: 'Accurate byte calculations across batch sizes and token lengths.' },
        { id: 'r3', title: 'Visualization & Report', maxScore: 25, description: 'Clear heatmap renderings of cross-head attention distributions.' }
      ],
      status: 'pending'
    },
    {
      id: 'asg_03',
      courseId: 'crs_core101',
      courseCode: 'COR-441',
      courseTitle: '444 Curriculum: Critical Thinking & Data Ethics',
      title: 'Essay: POPIA Data Residency & AI Algorithmic Accountability',
      description: 'Write a 1,500-word critical evaluation on data protection compliance, biometric information consent, and educational auditing.',
      dueDate: '2026-08-25 18:00',
      maxPoints: 50,
      departmentId: 'dept_core',
      lecturerId: 'adm_01',
      rubric: [
        { id: 'r1', title: 'POPIA Legal Reasoning', maxScore: 20, description: 'Deep application of South African statutory data privacy principles.' },
        { id: 'r2', title: 'Critical Evaluation & Case Studies', maxScore: 20, description: 'Analysis of real-world corporate and academic data breach risks.' },
        { id: 'r3', title: 'Structure & Academic Style', maxScore: 10, description: 'Harvard-style referencing and coherent argument flow.' }
      ],
      status: 'graded'
    }
  ];

  submissions: AssignmentSubmission[] = [
    {
      id: 'sub_01',
      assignmentId: 'asg_01',
      assignmentTitle: 'Milestone 1: Resilient Raft Cluster Implementation',
      courseCode: 'CSC-441',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      studentEmail: 'sarah.k@triple4c.edu',
      submittedAt: '2026-08-19 16:42',
      fileName: 'Sarah_Khumalo_Raft_Cluster_Submission.zip',
      fileSizeKb: 2450,
      contentNotes: 'Completed full Raft leader election and heartbeat protocol with 99.4% test suite pass rate under network split simulation.',
      status: 'submitted',
      maxGrade: 100
    },
    {
      id: 'sub_02',
      assignmentId: 'asg_01',
      assignmentTitle: 'Milestone 1: Resilient Raft Cluster Implementation',
      courseCode: 'CSC-441',
      studentId: 'stu_02',
      studentName: 'Liam Naidoo',
      studentEmail: 'liam.n@triple4c.edu',
      submittedAt: '2026-08-19 20:15',
      fileName: 'Liam_Naidoo_Raft_v2.tar.gz',
      fileSizeKb: 1890,
      contentNotes: 'Implemented state transitions and random election backoffs. Includes automated docker-compose harness.',
      status: 'graded',
      grade: 92,
      maxGrade: 100,
      feedback: 'Outstanding split-brain resolution logic! Clean adherence to the 444 Curriculum principles of robust engineering.',
      rubricScores: { r1: 28, r2: 36, r3: 28 },
      gradedBy: 'Dr. Arthur Vance',
      gradedAt: '2026-08-20 09:15'
    },
    {
      id: 'sub_03',
      assignmentId: 'asg_03',
      assignmentTitle: 'Essay: POPIA Data Residency & AI Algorithmic Accountability',
      courseCode: 'COR-441',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      studentEmail: 'sarah.k@triple4c.edu',
      submittedAt: '2026-08-18 11:30',
      fileName: 'Sarah_Khumalo_POPIA_Ethics_Essay.pdf',
      fileSizeKb: 840,
      contentNotes: 'Includes comparative analysis between GDPR and South African POPIA regulations with specific regard to student biometrics.',
      status: 'graded',
      grade: 48,
      maxGrade: 50,
      feedback: 'Superb legal framing and practical remediation steps for institutional data stewardship. First-class scholarship.',
      rubricScores: { r1: 19, r2: 20, r3: 9 },
      gradedBy: 'Dean Margaret Edwards',
      gradedAt: '2026-08-19 14:00'
    }
  ];

  attendanceRecords: AttendanceRecord[] = [
    {
      id: 'att_01',
      date: '2026-08-18',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      status: 'Present',
      checkInTime: '08:58',
      method: 'Self Check-in'
    },
    {
      id: 'att_02',
      date: '2026-08-18',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      studentId: 'stu_02',
      studentName: 'Liam Naidoo',
      status: 'Present',
      checkInTime: '09:02',
      method: 'QR Code'
    },
    {
      id: 'att_03',
      date: '2026-08-19',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      status: 'Present',
      checkInTime: '10:55',
      method: 'Self Check-in'
    },
    {
      id: 'att_04',
      date: '2026-08-19',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      studentId: 'stu_03',
      studentName: 'Tebogo Molefe',
      status: 'Late',
      checkInTime: '11:18',
      method: 'Lecturer Roster'
    },
    {
      id: 'att_05',
      date: '2026-08-20',
      courseId: 'crs_core101',
      courseCode: 'COR-441',
      courseTitle: '444 Curriculum: Critical Thinking & Data Ethics',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      status: 'Present',
      checkInTime: '09:56',
      method: 'Self Check-in'
    }
  ];

  badges: Badge[] = [
    {
      id: 'badge_pioneer',
      name: '444 Founding Scholar',
      description: 'Enrolled in the inaugural Triple 4C academic cohort.',
      icon: 'Award',
      category: 'mastery',
      rarity: 'Legendary',
      color: '#ca8a04',
      unlockedAt: '2025-02-10'
    },
    {
      id: 'badge_streak7',
      name: '7-Day Lightning Streak',
      description: 'Maintained uninterrupted daily learning activity for a full week.',
      icon: 'Zap',
      category: 'streak',
      rarity: 'Epic',
      color: '#15803d',
      unlockedAt: '2026-08-15'
    },
    {
      id: 'badge_quiz_master',
      name: 'Quiz Master 100%',
      description: 'Achieved flawless first-attempt accuracy across 5 embedded lecture quizzes.',
      icon: 'CheckCircle2',
      category: 'academic',
      rarity: 'Rare',
      color: '#eab308',
      unlockedAt: '2026-08-12'
    },
    {
      id: 'badge_ethics',
      name: 'POPIA Compliance Champion',
      description: 'Completed the 444 Core Data Ethics and Privacy mastery checkpoint.',
      icon: 'ShieldCheck',
      category: 'engagement',
      rarity: 'Rare',
      color: '#166534',
      unlockedAt: '2026-08-18'
    },
    {
      id: 'badge_fast_submit',
      name: 'Early Bird Submitter',
      description: 'Delivered an assignment milestone more than 48 hours ahead of the deadline.',
      icon: 'Clock',
      category: 'academic',
      rarity: 'Common',
      color: '#0f172a'
    },
    {
      id: 'badge_perfect_attendance',
      name: 'Centurion Attendance',
      description: 'Achieved 100% attendance across all scheduled timetable modules in a month.',
      icon: 'CalendarCheck',
      category: 'engagement',
      rarity: 'Epic',
      color: '#15803d'
    }
  ];

  auditLogs: AuditLog[] = [
    {
      id: 'log_101',
      timestamp: '2026-08-20 05:12:44',
      userId: 'stu_01',
      userName: 'Sarah Khumalo',
      userRole: 'student',
      action: 'USER_LOGIN',
      resource: '/api/v1/auth/login',
      details: 'Successful biometric OAuth token handshake from student portal',
      ipAddress: '197.89.241.12',
      status: 'SUCCESS',
      popiaCompliant: true
    },
    {
      id: 'log_102',
      timestamp: '2026-08-20 04:45:10',
      userId: 'lec_01',
      userName: 'Dr. Arthur Vance',
      userRole: 'lecturer',
      action: 'SPEED_GRADER_SUBMIT',
      resource: '/api/v1/assignments/asg_01/grade',
      details: 'Recorded grade 92/100 and rubric evaluation for Liam Naidoo (sub_02)',
      ipAddress: '105.22.109.84',
      status: 'SUCCESS',
      popiaCompliant: true
    },
    {
      id: 'log_103',
      timestamp: '2026-08-19 22:15:30',
      userId: 'adm_01',
      userName: 'Dean Margaret Edwards',
      userRole: 'admin',
      action: 'REPORT_EXPORT_SASAMS',
      resource: '/api/v1/reports/sa-sams-sync',
      details: 'Generated encrypted DBE SA-SAMS national dataset XML export with 1,205 student records',
      ipAddress: '196.25.1.18',
      status: 'SUCCESS',
      popiaCompliant: true
    },
    {
      id: 'log_104',
      timestamp: '2026-08-19 16:42:01',
      userId: 'stu_01',
      userName: 'Sarah Khumalo',
      userRole: 'student',
      action: 'ASSIGNMENT_UPLOAD',
      resource: '/api/v1/assignments/asg_01/submit',
      details: 'Uploaded encrypted payload Sarah_Khumalo_Raft_Cluster_Submission.zip (2450 KB)',
      ipAddress: '197.89.241.12',
      status: 'SUCCESS',
      popiaCompliant: true
    },
    {
      id: 'log_105',
      timestamp: '2026-08-19 14:02:18',
      userId: 'adm_01',
      userName: 'Dean Margaret Edwards',
      userRole: 'admin',
      action: 'RBAC_PERMISSION_AUDIT',
      resource: '/api/v1/admin/users/roles',
      details: 'Audited faculty RBAC permission boundaries for SETA/QCTO inspection',
      ipAddress: '196.25.1.18',
      status: 'SUCCESS',
      popiaCompliant: true
    },
    {
      id: 'log_106',
      timestamp: '2026-08-19 09:00:15',
      userId: 'stu_01',
      userName: 'Sarah Khumalo',
      userRole: 'student',
      action: 'ATTENDANCE_CHECKIN',
      resource: '/api/v1/attendance/check-in',
      details: 'Checked in to CSC-441 Distributed Systems live stream',
      ipAddress: '197.89.241.12',
      status: 'SUCCESS',
      popiaCompliant: true
    },
    {
      id: 'log_107',
      timestamp: '2026-08-18 19:30:22',
      userId: 'stu_02',
      userName: 'Liam Naidoo',
      userRole: 'student',
      action: 'DRM_MEDIA_ACCESS',
      resource: '/api/v1/lectures/lec_01_01/stream',
      details: 'Streamed video with active watermark [liam.n@triple4c.edu | 444-STU-9042]',
      ipAddress: '41.13.72.99',
      status: 'SUCCESS',
      popiaCompliant: true
    }
  ];

  notifications: PushNotification[] = [
    {
      id: 'notif_01',
      recipientRole: 'all',
      title: '🔥 6-Day Streak Activated!',
      message: 'Great momentum, Sarah! Complete today’s CSC-441 module to hit the 7-Day Lightning Milestone.',
      category: 'streak',
      timestamp: '2026-08-20 05:00',
      read: false,
      priority: 'high'
    },
    {
      id: 'notif_02',
      recipientRole: 'student',
      recipientId: 'stu_01',
      title: 'Grade Released: POPIA Data Ethics Essay',
      message: 'Dean Edwards has published your evaluation: 48/50 (96%). Check out your personalized SpeedGrader feedback.',
      category: 'grading',
      timestamp: '2026-08-19 14:05',
      read: false,
      actionUrl: '/student/assignments',
      priority: 'normal'
    },
    {
      id: 'notif_03',
      recipientRole: 'all',
      title: 'Campus Operational Alert: Upcoming Live Masterclass',
      message: 'Dr. Arthur Vance will host a live Raft consensus debug clinic today at 13:00 on Stream Room 1.',
      category: 'announcement',
      timestamp: '2026-08-20 04:30',
      read: true,
      actionUrl: '/student/timetable',
      priority: 'normal'
    },
    {
      id: 'notif_04',
      recipientRole: 'all',
      title: 'New Timetable Clash Detector Enabled',
      message: 'The academic registry has updated room allocations for Semester 2. Check your revised schedule.',
      category: 'academic',
      timestamp: '2026-08-18 10:00',
      read: true,
      priority: 'low'
    }
  ];

  announcements: SystemAnnouncement[] = [
    {
      id: 'ann_01',
      title: 'Triple 4C Academic Governance: Semester 2 Standards & POPIA Safeguards',
      content: 'Welcome to Semester 2 of the 444 Curriculum. All learning materials, lecture video watermarks, and SpeedGrader rubrics have been certified for POPIA compliance and SETA/QCTO quality metrics. Please ensure all assignment submissions adhere to the 444 academic integrity guidelines.',
      targetAudience: 'All',
      createdAt: '2026-08-15 08:00',
      authorName: 'Dean Margaret Edwards',
      pinned: true,
      priority: 'critical'
    },
    {
      id: 'ann_02',
      title: 'Department of Computing: High-Performance GPU Cluster Access',
      content: 'Undergraduate and postgraduate students enrolled in CSC-442 Neural Networks have been allocated dedicated cloud compute tokens for transformer model fine-tuning. Access your keys via the student portal.',
      targetAudience: 'Students',
      createdAt: '2026-08-18 09:30',
      authorName: 'Dr. Arthur Vance',
      pinned: true,
      priority: 'info'
    },
    {
      id: 'ann_03',
      title: 'Mandatory Faculty SpeedGrader Standardization Workshop',
      content: 'All faculty members are invited to the rubric weighting and anonymized grading calibration session this Friday at 15:00 SAST in the Mandela Auditorium.',
      targetAudience: 'Lecturers',
      createdAt: '2026-08-19 11:00',
      authorName: 'Prof. Nomvula Dlamini',
      pinned: false,
      priority: 'warning'
    }
  ];

  messages: ChatMessage[] = [
    {
      id: 'msg_01',
      senderId: 'lec_01',
      senderName: 'Dr. Arthur Vance',
      senderRole: 'lecturer',
      channelId: 'cs201-cohort',
      message: 'Good morning everyone! Please check out the Raft heartbeat diagram in Module 1 before today\'s practical session.',
      timestamp: '2026-08-20 04:40'
    },
    {
      id: 'msg_02',
      senderId: 'stu_01',
      senderName: 'Sarah Khumalo',
      senderRole: 'student',
      channelId: 'cs201-cohort',
      message: 'Thanks Dr. Vance! Is the split-brain test case expecting an odd or even number of nodes in the cluster setup?',
      timestamp: '2026-08-20 04:52'
    },
    {
      id: 'msg_03',
      senderId: 'lec_01',
      senderName: 'Dr. Arthur Vance',
      senderRole: 'lecturer',
      channelId: 'cs201-cohort',
      message: 'Always use an odd number (3 or 5) so the majority quorum (N/2 + 1) is strictly deterministic! See you in class.',
      timestamp: '2026-08-20 05:01'
    }
  ];

  learnerProgress: LearnerCourseProgress[] = [
    // CSC-441 - Dr. Arthur Vance
    {
      id: 'lp_cs201_stu01',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      studentEmail: 'sarah.k@triple4c.edu',
      studentIdNumber: '444-STU-8821',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-10',
      overallProgressPercent: 85,
      completedLecturesCount: 5,
      totalLecturesCount: 6,
      averageQuizScore: 94,
      quizzesAttemptedCount: 5,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 2,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 95,
      attendanceRatePercent: 98,
      streakDays: 6,
      lastActive: 'Today, 11:30 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Exceptional grasp of Raft consensus protocol and Byzantine fault resilience. Ready for honors project.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Resilient Architectures', lectureTitle: 'Lecture 1: Fault-Tolerant Consensus', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 45 },
        { moduleId: 'm2', moduleName: 'Module 2: Streaming & Messaging', lectureTitle: 'Lecture 2: Event-Driven Microservices', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 50 },
        { moduleId: 'm3', moduleName: 'Module 3: Dynamic DRM Security', lectureTitle: 'Lecture 3: DRM Cryptographic Pipeline', completed: true, watchedPercent: 100, quizScore: 100, quizPassed: true, completedAt: '2026-08-16', timeSpentMinutes: 38 },
        { moduleId: 'm4', moduleName: 'Module 4: Cluster Rebalancing', lectureTitle: 'Lecture 4: Consistent Hashing Algorithms', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 42 },
        { moduleId: 'm5', moduleName: 'Module 5: Observability & Tracing', lectureTitle: 'Lecture 5: OpenTelemetry & Distributed Spans', completed: true, watchedPercent: 100, quizScore: 93, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 35 },
        { moduleId: 'm6', moduleName: 'Module 6: Capstone Integration', lectureTitle: 'Lecture 6: Multi-Region Failover Architecture', completed: false, watchedPercent: 40, timeSpentMinutes: 15 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_cs_01', title: 'Practical Lab: Raft Consensus Cluster Simulation in Node.js', submittedAt: '2026-08-15 14:20', status: 'graded', grade: 95, maxGrade: 100, feedback: 'Flawless quorum election simulation and split-brain recovery tests!' },
        { assignmentId: 'asg_cs_02', title: 'Dynamic DRM Watermarking & Cryptographic Token Auth', submittedAt: '2026-08-19 16:45', status: 'submitted', maxGrade: 100 }
      ]
    },
    {
      id: 'lp_cs201_stu07',
      studentId: 'stu_07',
      studentName: 'Ethan Botha',
      studentEmail: 'ethan.b@triple4c.edu',
      studentIdNumber: '444-STU-4921',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-10',
      overallProgressPercent: 92,
      completedLecturesCount: 6,
      totalLecturesCount: 6,
      averageQuizScore: 96,
      quizzesAttemptedCount: 6,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 2,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 98,
      attendanceRatePercent: 100,
      streakDays: 11,
      lastActive: 'Today, 09:15 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Top of class. Submitted high-performance Golang microservices benchmark with zero packet loss.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Resilient Architectures', lectureTitle: 'Lecture 1: Fault-Tolerant Consensus', completed: true, watchedPercent: 100, quizScore: 100, quizPassed: true, completedAt: '2026-08-11', timeSpentMinutes: 40 },
        { moduleId: 'm2', moduleName: 'Module 2: Streaming & Messaging', lectureTitle: 'Lecture 2: Event-Driven Microservices', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-13', timeSpentMinutes: 45 },
        { moduleId: 'm3', moduleName: 'Module 3: Dynamic DRM Security', lectureTitle: 'Lecture 3: DRM Cryptographic Pipeline', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 35 },
        { moduleId: 'm4', moduleName: 'Module 4: Cluster Rebalancing', lectureTitle: 'Lecture 4: Consistent Hashing Algorithms', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-17', timeSpentMinutes: 40 },
        { moduleId: 'm5', moduleName: 'Module 5: Observability & Tracing', lectureTitle: 'Lecture 5: OpenTelemetry & Distributed Spans', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 30 },
        { moduleId: 'm6', moduleName: 'Module 6: Capstone Integration', lectureTitle: 'Lecture 6: Multi-Region Failover Architecture', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 50 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_cs_01', title: 'Practical Lab: Raft Consensus Cluster Simulation in Node.js', submittedAt: '2026-08-14 11:10', status: 'graded', grade: 98, maxGrade: 100, feedback: 'Incredible benchmark performance and modular code architecture.' }
      ]
    },
    {
      id: 'lp_cs201_stu04',
      studentId: 'stu_04',
      studentName: 'Anesu Moyo',
      studentEmail: 'anesu.m@triple4c.edu',
      studentIdNumber: '444-STU-6310',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-12',
      overallProgressPercent: 75,
      completedLecturesCount: 4,
      totalLecturesCount: 6,
      averageQuizScore: 88,
      quizzesAttemptedCount: 4,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 2,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 86,
      attendanceRatePercent: 92,
      streakDays: 5,
      lastActive: 'Today, 10:20 AM',
      performanceBand: 'On Track',
      teacherNotes: 'Consistent steady progress. Active in discussion forum regarding message broker backpressure.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Resilient Architectures', lectureTitle: 'Lecture 1: Fault-Tolerant Consensus', completed: true, watchedPercent: 100, quizScore: 88, quizPassed: true, completedAt: '2026-08-13', timeSpentMinutes: 52 },
        { moduleId: 'm2', moduleName: 'Module 2: Streaming & Messaging', lectureTitle: 'Lecture 2: Event-Driven Microservices', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 48 },
        { moduleId: 'm3', moduleName: 'Module 3: Dynamic DRM Security', lectureTitle: 'Lecture 3: DRM Cryptographic Pipeline', completed: true, watchedPercent: 100, quizScore: 85, quizPassed: true, completedAt: '2026-08-17', timeSpentMinutes: 44 },
        { moduleId: 'm4', moduleName: 'Module 4: Cluster Rebalancing', lectureTitle: 'Lecture 4: Consistent Hashing Algorithms', completed: true, watchedPercent: 100, quizScore: 89, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 39 },
        { moduleId: 'm5', moduleName: 'Module 5: Observability & Tracing', lectureTitle: 'Lecture 5: OpenTelemetry & Distributed Spans', completed: false, watchedPercent: 50, timeSpentMinutes: 20 },
        { moduleId: 'm6', moduleName: 'Module 6: Capstone Integration', lectureTitle: 'Lecture 6: Multi-Region Failover Architecture', completed: false, watchedPercent: 0, timeSpentMinutes: 0 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_cs_01', title: 'Practical Lab: Raft Consensus Cluster Simulation in Node.js', submittedAt: '2026-08-15 17:00', status: 'graded', grade: 86, maxGrade: 100, feedback: 'Good implementation. Remember to handle network timeout edge cases.' }
      ]
    },
    {
      id: 'lp_cs201_stu02',
      studentId: 'stu_02',
      studentName: 'Liam Naidoo',
      studentEmail: 'liam.n@triple4c.edu',
      studentIdNumber: '444-STU-9042',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-15',
      overallProgressPercent: 60,
      completedLecturesCount: 3,
      totalLecturesCount: 6,
      averageQuizScore: 80,
      quizzesAttemptedCount: 3,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 78,
      attendanceRatePercent: 88,
      streakDays: 3,
      lastActive: 'Yesterday, 04:30 PM',
      performanceBand: 'Needs Attention',
      teacherNotes: 'Needs to complete Module 4 and 5 before the upcoming midterm exam. Encouraged to attend lab office hours.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Resilient Architectures', lectureTitle: 'Lecture 1: Fault-Tolerant Consensus', completed: true, watchedPercent: 100, quizScore: 80, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 55 },
        { moduleId: 'm2', moduleName: 'Module 2: Streaming & Messaging', lectureTitle: 'Lecture 2: Event-Driven Microservices', completed: true, watchedPercent: 100, quizScore: 82, quizPassed: true, completedAt: '2026-08-16', timeSpentMinutes: 45 },
        { moduleId: 'm3', moduleName: 'Module 3: Dynamic DRM Security', lectureTitle: 'Lecture 3: DRM Cryptographic Pipeline', completed: true, watchedPercent: 100, quizScore: 78, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 40 },
        { moduleId: 'm4', moduleName: 'Module 4: Cluster Rebalancing', lectureTitle: 'Lecture 4: Consistent Hashing Algorithms', completed: false, watchedPercent: 30, timeSpentMinutes: 12 },
        { moduleId: 'm5', moduleName: 'Module 5: Observability & Tracing', lectureTitle: 'Lecture 5: OpenTelemetry & Distributed Spans', completed: false, watchedPercent: 0, timeSpentMinutes: 0 },
        { moduleId: 'm6', moduleName: 'Module 6: Capstone Integration', lectureTitle: 'Lecture 6: Multi-Region Failover Architecture', completed: false, watchedPercent: 0, timeSpentMinutes: 0 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_cs_01', title: 'Practical Lab: Raft Consensus Cluster Simulation in Node.js', submittedAt: '2026-08-16 09:30', status: 'graded', grade: 78, maxGrade: 100, feedback: 'Functional cluster, but crashed during simulated partition test.' }
      ]
    },
    {
      id: 'lp_cs201_stu09',
      studentId: 'stu_09',
      studentName: 'Sipho Dube',
      studentEmail: 'sipho.d@triple4c.edu',
      studentIdNumber: '444-STU-3184',
      courseId: 'crs_cs201',
      courseCode: 'CSC-441',
      courseTitle: 'Distributed Systems & Adaptive Cloud Architectures',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-20',
      overallProgressPercent: 34,
      completedLecturesCount: 2,
      totalLecturesCount: 6,
      averageQuizScore: 58,
      quizzesAttemptedCount: 2,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 0,
      assignmentsTotalCount: 2,
      attendanceRatePercent: 64,
      streakDays: 0,
      lastActive: '6 days ago',
      performanceBand: 'At Risk',
      teacherNotes: 'Urgent academic intervention needed. Missed 2 consecutive assignments and attendance dropped below SA-SAMS 75% threshold.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Resilient Architectures', lectureTitle: 'Lecture 1: Fault-Tolerant Consensus', completed: true, watchedPercent: 100, quizScore: 60, quizPassed: true, completedAt: '2026-08-10', timeSpentMinutes: 60 },
        { moduleId: 'm2', moduleName: 'Module 2: Streaming & Messaging', lectureTitle: 'Lecture 2: Event-Driven Microservices', completed: true, watchedPercent: 100, quizScore: 56, quizPassed: false, completedAt: '2026-08-13', timeSpentMinutes: 40 },
        { moduleId: 'm3', moduleName: 'Module 3: Dynamic DRM Security', lectureTitle: 'Lecture 3: DRM Cryptographic Pipeline', completed: false, watchedPercent: 20, timeSpentMinutes: 10 },
        { moduleId: 'm4', moduleName: 'Module 4: Cluster Rebalancing', lectureTitle: 'Lecture 4: Consistent Hashing Algorithms', completed: false, watchedPercent: 0, timeSpentMinutes: 0 },
        { moduleId: 'm5', moduleName: 'Module 5: Observability & Tracing', lectureTitle: 'Lecture 5: OpenTelemetry & Distributed Spans', completed: false, watchedPercent: 0, timeSpentMinutes: 0 },
        { moduleId: 'm6', moduleName: 'Module 6: Capstone Integration', lectureTitle: 'Lecture 6: Multi-Region Failover Architecture', completed: false, watchedPercent: 0, timeSpentMinutes: 0 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_cs_01', title: 'Practical Lab: Raft Consensus Cluster Simulation in Node.js', submittedAt: '', status: 'missing', maxGrade: 100 }
      ]
    },

    // CSC-442 - Dr. Arthur Vance
    {
      id: 'lp_ai302_stu07',
      studentId: 'stu_07',
      studentName: 'Ethan Botha',
      studentEmail: 'ethan.b@triple4c.edu',
      studentIdNumber: '444-STU-4921',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-10',
      overallProgressPercent: 88,
      completedLecturesCount: 7,
      totalLecturesCount: 8,
      averageQuizScore: 95,
      quizzesAttemptedCount: 7,
      quizzesTotalCount: 8,
      assignmentsSubmittedCount: 2,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 96,
      attendanceRatePercent: 100,
      streakDays: 11,
      lastActive: 'Today, 09:15 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Implemented efficient FlashAttention matrix kernel in CUDA.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Attention Mechanisms', lectureTitle: 'Lecture 1: Scaled Dot-Product Math', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-11', timeSpentMinutes: 45 },
        { moduleId: 'm2', moduleName: 'Module 2: Positional Embeddings', lectureTitle: 'Lecture 2: RoPE & ALiBi Encodings', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-13', timeSpentMinutes: 50 },
        { moduleId: 'm3', moduleName: 'Module 3: Quantization & LoRA', lectureTitle: 'Lecture 3: Low-Rank Adapter Fine-Tuning', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 42 },
        { moduleId: 'm4', moduleName: 'Module 4: RLHF Alignment', lectureTitle: 'Lecture 4: DPO & PPO Policy Optimization', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-17', timeSpentMinutes: 48 },
        { moduleId: 'm5', moduleName: 'Module 5: Multimodal Embeddings', lectureTitle: 'Lecture 5: CLIP Contrastive Pre-training', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 40 },
        { moduleId: 'm6', moduleName: 'Module 6: Agentic Tool Use', lectureTitle: 'Lecture 6: Function Calling & Reasoning Chains', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 44 },
        { moduleId: 'm7', moduleName: 'Module 7: Speculative Decoding', lectureTitle: 'Lecture 7: Latency Optimization in Serving', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 38 },
        { moduleId: 'm8', moduleName: 'Module 8: Ethical AI Safety', lectureTitle: 'Lecture 8: Red Teaming & Jailbreak Defense', completed: false, watchedPercent: 20, timeSpentMinutes: 10 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_ai_01', title: 'LoRA Adapter Fine-Tuning on Custom Academic Dataset', submittedAt: '2026-08-16 12:00', status: 'graded', grade: 96, maxGrade: 100, feedback: 'Superb loss curve and clean test evaluation.' }
      ]
    },
    {
      id: 'lp_ai302_stu01',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      studentEmail: 'sarah.k@triple4c.edu',
      studentIdNumber: '444-STU-8821',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-10',
      overallProgressPercent: 62,
      completedLecturesCount: 5,
      totalLecturesCount: 8,
      averageQuizScore: 90,
      quizzesAttemptedCount: 5,
      quizzesTotalCount: 8,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 92,
      attendanceRatePercent: 96,
      streakDays: 6,
      lastActive: 'Today, 11:30 AM',
      performanceBand: 'On Track',
      teacherNotes: 'Great performance in fine-tuning assignments. Working on multimodal projection layers.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Attention Mechanisms', lectureTitle: 'Lecture 1: Scaled Dot-Product Math', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 46 },
        { moduleId: 'm2', moduleName: 'Module 2: Positional Embeddings', lectureTitle: 'Lecture 2: RoPE & ALiBi Encodings', completed: true, watchedPercent: 100, quizScore: 88, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 52 },
        { moduleId: 'm3', moduleName: 'Module 3: Quantization & LoRA', lectureTitle: 'Lecture 3: Low-Rank Adapter Fine-Tuning', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-16', timeSpentMinutes: 44 },
        { moduleId: 'm4', moduleName: 'Module 4: RLHF Alignment', lectureTitle: 'Lecture 4: DPO & PPO Policy Optimization', completed: true, watchedPercent: 100, quizScore: 86, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 45 },
        { moduleId: 'm5', moduleName: 'Module 5: Multimodal Embeddings', lectureTitle: 'Lecture 5: CLIP Contrastive Pre-training', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 38 },
        { moduleId: 'm6', moduleName: 'Module 6: Agentic Tool Use', lectureTitle: 'Lecture 6: Function Calling & Reasoning Chains', completed: false, watchedPercent: 30, timeSpentMinutes: 15 },
        { moduleId: 'm7', moduleName: 'Module 7: Speculative Decoding', lectureTitle: 'Lecture 7: Latency Optimization in Serving', completed: false, watchedPercent: 0, timeSpentMinutes: 0 },
        { moduleId: 'm8', moduleName: 'Module 8: Ethical AI Safety', lectureTitle: 'Lecture 8: Red Teaming & Jailbreak Defense', completed: false, watchedPercent: 0, timeSpentMinutes: 0 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_ai_01', title: 'LoRA Adapter Fine-Tuning on Custom Academic Dataset', submittedAt: '2026-08-17 15:30', status: 'graded', grade: 92, maxGrade: 100, feedback: 'Strong hyperparameter analysis.' }
      ]
    },
    {
      id: 'lp_ai302_stu08',
      studentId: 'stu_08',
      studentName: 'Fatima Al-Mansoor',
      studentEmail: 'fatima.m@triple4c.edu',
      studentIdNumber: '444-STU-9382',
      courseId: 'crs_ai302',
      courseCode: 'CSC-442',
      courseTitle: 'Neural Networks, LLMs & Cognitive Systems',
      teacherId: 'lec_01',
      teacherName: 'Dr. Arthur Vance',
      enrolledDate: '2026-02-15',
      overallProgressPercent: 80,
      completedLecturesCount: 6,
      totalLecturesCount: 8,
      averageQuizScore: 92,
      quizzesAttemptedCount: 6,
      quizzesTotalCount: 8,
      assignmentsSubmittedCount: 2,
      assignmentsTotalCount: 2,
      latestAssignmentGrade: 94,
      attendanceRatePercent: 95,
      streakDays: 7,
      lastActive: 'Today, 08:45 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Special interest in biomedical transformer applications.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Attention Mechanisms', lectureTitle: 'Lecture 1: Scaled Dot-Product Math', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 42 },
        { moduleId: 'm2', moduleName: 'Module 2: Positional Embeddings', lectureTitle: 'Lecture 2: RoPE & ALiBi Encodings', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 48 },
        { moduleId: 'm3', moduleName: 'Module 3: Quantization & LoRA', lectureTitle: 'Lecture 3: Low-Rank Adapter Fine-Tuning', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-16', timeSpentMinutes: 40 },
        { moduleId: 'm4', moduleName: 'Module 4: RLHF Alignment', lectureTitle: 'Lecture 4: DPO & PPO Policy Optimization', completed: true, watchedPercent: 100, quizScore: 88, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 46 },
        { moduleId: 'm5', moduleName: 'Module 5: Multimodal Embeddings', lectureTitle: 'Lecture 5: CLIP Contrastive Pre-training', completed: true, watchedPercent: 100, quizScore: 93, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 38 },
        { moduleId: 'm6', moduleName: 'Module 6: Agentic Tool Use', lectureTitle: 'Lecture 6: Function Calling & Reasoning Chains', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 45 },
        { moduleId: 'm7', moduleName: 'Module 7: Speculative Decoding', lectureTitle: 'Lecture 7: Latency Optimization in Serving', completed: false, watchedPercent: 30, timeSpentMinutes: 12 },
        { moduleId: 'm8', moduleName: 'Module 8: Ethical AI Safety', lectureTitle: 'Lecture 8: Red Teaming & Jailbreak Defense', completed: false, watchedPercent: 0, timeSpentMinutes: 0 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_ai_01', title: 'LoRA Adapter Fine-Tuning on Custom Academic Dataset', submittedAt: '2026-08-16 18:20', status: 'graded', grade: 94, maxGrade: 100 }
      ]
    },

    // ENG-441 - Prof. Nomvula Dlamini
    {
      id: 'lp_eng101_stu02',
      studentId: 'stu_02',
      studentName: 'Liam Naidoo',
      studentEmail: 'liam.n@triple4c.edu',
      studentIdNumber: '444-STU-9042',
      courseId: 'crs_eng101',
      courseCode: 'ENG-441',
      courseTitle: 'Autonomous Robotics & Sensor Fusion',
      teacherId: 'lec_02',
      teacherName: 'Prof. Nomvula Dlamini',
      enrolledDate: '2026-02-15',
      overallProgressPercent: 82,
      completedLecturesCount: 4,
      totalLecturesCount: 5,
      averageQuizScore: 90,
      quizzesAttemptedCount: 4,
      quizzesTotalCount: 5,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 92,
      attendanceRatePercent: 96,
      streakDays: 3,
      lastActive: 'Yesterday, 04:30 PM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Demonstrated superior sensor calibration in Gazebo physics simulation.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Kalman Filters', lectureTitle: 'Lecture 1: State Estimation & Gaussian Noise', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 50 },
        { moduleId: 'm2', moduleName: 'Module 2: ROS2 Nodes', lectureTitle: 'Lecture 2: Pub/Sub Telemetry Pipelines', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 45 },
        { moduleId: 'm3', moduleName: 'Module 3: Lidar SLAM', lectureTitle: 'Lecture 3: 2D/3D Occupancy Grid Mapping', completed: true, watchedPercent: 100, quizScore: 88, quizPassed: true, completedAt: '2026-08-17', timeSpentMinutes: 55 },
        { moduleId: 'm4', moduleName: 'Module 4: PID Motor Loops', lectureTitle: 'Lecture 4: Closed-Loop Dynamic Actuation', completed: true, watchedPercent: 100, quizScore: 88, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 40 },
        { moduleId: 'm5', moduleName: 'Module 5: Autonomous Pathing', lectureTitle: 'Lecture 5: A* & Dynamic Window Obstacle Avoidance', completed: false, watchedPercent: 40, timeSpentMinutes: 20 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_eng_01', title: 'ROS2 Extended Kalman Filter Node Implementation', submittedAt: '2026-08-18 10:15', status: 'graded', grade: 92, maxGrade: 100, feedback: 'Precise covariance matrix tuning.' }
      ]
    },
    {
      id: 'lp_eng101_stu05',
      studentId: 'stu_05',
      studentName: 'Keagan Peters',
      studentEmail: 'keagan.p@triple4c.edu',
      studentIdNumber: '444-STU-5128',
      courseId: 'crs_eng101',
      courseCode: 'ENG-441',
      courseTitle: 'Autonomous Robotics & Sensor Fusion',
      teacherId: 'lec_02',
      teacherName: 'Prof. Nomvula Dlamini',
      enrolledDate: '2026-02-20',
      overallProgressPercent: 42,
      completedLecturesCount: 2,
      totalLecturesCount: 5,
      averageQuizScore: 64,
      quizzesAttemptedCount: 2,
      quizzesTotalCount: 5,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 68,
      attendanceRatePercent: 78,
      streakDays: 1,
      lastActive: '4 days ago',
      performanceBand: 'Needs Attention',
      teacherNotes: 'Struggling with ROS2 C++ build environments. Directed to tutor group.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Kalman Filters', lectureTitle: 'Lecture 1: State Estimation & Gaussian Noise', completed: true, watchedPercent: 100, quizScore: 65, quizPassed: true, completedAt: '2026-08-11', timeSpentMinutes: 60 },
        { moduleId: 'm2', moduleName: 'Module 2: ROS2 Nodes', lectureTitle: 'Lecture 2: Pub/Sub Telemetry Pipelines', completed: true, watchedPercent: 100, quizScore: 63, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 50 },
        { moduleId: 'm3', moduleName: 'Module 3: Lidar SLAM', lectureTitle: 'Lecture 3: 2D/3D Occupancy Grid Mapping', completed: false, watchedPercent: 20, timeSpentMinutes: 10 },
        { moduleId: 'm4', moduleName: 'Module 4: PID Motor Loops', lectureTitle: 'Lecture 4: Closed-Loop Dynamic Actuation', completed: false, watchedPercent: 0, timeSpentMinutes: 0 },
        { moduleId: 'm5', moduleName: 'Module 5: Autonomous Pathing', lectureTitle: 'Lecture 5: A* & Dynamic Window Obstacle Avoidance', completed: false, watchedPercent: 0, timeSpentMinutes: 0 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_eng_01', title: 'ROS2 Extended Kalman Filter Node Implementation', submittedAt: '2026-08-18 23:50', status: 'graded', grade: 68, maxGrade: 100 }
      ]
    },

    // BIZ-441 - Dr. Johan van der Merwe
    {
      id: 'lp_biz204_stu06',
      studentId: 'stu_06',
      studentName: 'Thandiwe Sithole',
      studentEmail: 'thandiwe.s@triple4c.edu',
      studentIdNumber: '444-STU-8193',
      courseId: 'crs_biz204',
      courseCode: 'BIZ-441',
      courseTitle: 'FinTech Rails, Payment Gateways & Cryptoeconomics',
      teacherId: 'lec_03',
      teacherName: 'Dr. Johan van der Merwe',
      enrolledDate: '2026-02-10',
      overallProgressPercent: 95,
      completedLecturesCount: 4,
      totalLecturesCount: 4,
      averageQuizScore: 98,
      quizzesAttemptedCount: 4,
      quizzesTotalCount: 4,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 100,
      attendanceRatePercent: 100,
      streakDays: 8,
      lastActive: 'Today, 01:20 PM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Outstanding analysis of SARB National Payment System directives and instant EFT settlement.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Payment Gateways', lectureTitle: 'Lecture 1: Webhook Idempotency & HMAC Security', completed: true, watchedPercent: 100, quizScore: 100, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 40 },
        { moduleId: 'm2', moduleName: 'Module 2: Bank Settlement', lectureTitle: 'Lecture 2: SAMOS & Real-Time Clearing Rails', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 45 },
        { moduleId: 'm3', moduleName: 'Module 3: Tokenization', lectureTitle: 'Lecture 3: PCI-DSS v4 Vaulting Architecture', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-16', timeSpentMinutes: 38 },
        { moduleId: 'm4', moduleName: 'Module 4: Smart Contracts', lectureTitle: 'Lecture 4: Algorithmic Stablecoins & Liquidity', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 42 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_biz_01', title: 'FinTech Payment Orchestrator & Multi-Provider Fallback Routing', submittedAt: '2026-08-18 14:00', status: 'graded', grade: 100, maxGrade: 100, feedback: 'Industry-grade implementation of payment idempotency and reconciliation.' }
      ]
    },
    {
      id: 'lp_biz204_stu03',
      studentId: 'stu_03',
      studentName: 'Tebogo Molefe',
      studentEmail: 'tebogo.m@triple4c.edu',
      studentIdNumber: '444-STU-7419',
      courseId: 'crs_biz204',
      courseCode: 'BIZ-441',
      courseTitle: 'FinTech Rails, Payment Gateways & Cryptoeconomics',
      teacherId: 'lec_03',
      teacherName: 'Dr. Johan van der Merwe',
      enrolledDate: '2026-02-12',
      overallProgressPercent: 85,
      completedLecturesCount: 3,
      totalLecturesCount: 4,
      averageQuizScore: 90,
      quizzesAttemptedCount: 3,
      quizzesTotalCount: 4,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 88,
      attendanceRatePercent: 94,
      streakDays: 4,
      lastActive: 'Today, 10:00 AM',
      performanceBand: 'On Track',
      teacherNotes: 'Solid understanding of automated clearing house (ACH) batch reconciliations.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Payment Gateways', lectureTitle: 'Lecture 1: Webhook Idempotency & HMAC Security', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-13', timeSpentMinutes: 45 },
        { moduleId: 'm2', moduleName: 'Module 2: Bank Settlement', lectureTitle: 'Lecture 2: SAMOS & Real-Time Clearing Rails', completed: true, watchedPercent: 100, quizScore: 88, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 48 },
        { moduleId: 'm3', moduleName: 'Module 3: Tokenization', lectureTitle: 'Lecture 3: PCI-DSS v4 Vaulting Architecture', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 40 },
        { moduleId: 'm4', moduleName: 'Module 4: Smart Contracts', lectureTitle: 'Lecture 4: Algorithmic Stablecoins & Liquidity', completed: false, watchedPercent: 40, timeSpentMinutes: 18 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_biz_01', title: 'FinTech Payment Orchestrator & Multi-Provider Fallback Routing', submittedAt: '2026-08-18 19:30', status: 'graded', grade: 88, maxGrade: 100 }
      ]
    },

    // MED-441 - Dr. Priya Patel
    {
      id: 'lp_med101_stu08',
      studentId: 'stu_08',
      studentName: 'Fatima Al-Mansoor',
      studentEmail: 'fatima.m@triple4c.edu',
      studentIdNumber: '444-STU-9382',
      courseId: 'crs_med101',
      courseCode: 'MED-441',
      courseTitle: 'Biomedical Informatics & Clinical Telemetry',
      teacherId: 'lec_04',
      teacherName: 'Dr. Priya Patel',
      enrolledDate: '2026-02-10',
      overallProgressPercent: 94,
      completedLecturesCount: 5,
      totalLecturesCount: 6,
      averageQuizScore: 96,
      quizzesAttemptedCount: 5,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 98,
      attendanceRatePercent: 98,
      streakDays: 7,
      lastActive: 'Today, 08:45 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Excellent implementation of FHIR R5 JSON schema validation and HIPAA/POPIA anonymizer.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: FHIR & HL7 Standards', lectureTitle: 'Lecture 1: Clinical Observation Data Models', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 44 },
        { moduleId: 'm2', moduleName: 'Module 2: Telemetry Ingestion', lectureTitle: 'Lecture 2: MQTT ECG Signal Streaming', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 50 },
        { moduleId: 'm3', moduleName: 'Module 3: Medical Imaging', lectureTitle: 'Lecture 3: DICOM Parsing & PACS Servers', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-16', timeSpentMinutes: 42 },
        { moduleId: 'm4', moduleName: 'Module 4: Epidemiology Analytics', lectureTitle: 'Lecture 4: Compartmental SIR Infection Modeling', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 45 },
        { moduleId: 'm5', moduleName: 'Module 5: Clinical Decision AI', lectureTitle: 'Lecture 5: Diagnostic Classification & Explainability', completed: true, watchedPercent: 100, quizScore: 97, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 40 },
        { moduleId: 'm6', moduleName: 'Module 6: Privacy Governance', lectureTitle: 'Lecture 6: POPIA Health Data Security Directives', completed: false, watchedPercent: 50, timeSpentMinutes: 20 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_med_01', title: 'FHIR Patient Resource Anonymization & Clinical Stream Ingestion', submittedAt: '2026-08-17 11:30', status: 'graded', grade: 98, maxGrade: 100 }
      ]
    },
    {
      id: 'lp_med101_stu10',
      studentId: 'stu_10',
      studentName: 'Chloe Van Zyl',
      studentEmail: 'chloe.v@triple4c.edu',
      studentIdNumber: '444-STU-7751',
      courseId: 'crs_med101',
      courseCode: 'MED-441',
      courseTitle: 'Biomedical Informatics & Clinical Telemetry',
      teacherId: 'lec_04',
      teacherName: 'Dr. Priya Patel',
      enrolledDate: '2026-02-15',
      overallProgressPercent: 88,
      completedLecturesCount: 5,
      totalLecturesCount: 6,
      averageQuizScore: 92,
      quizzesAttemptedCount: 5,
      quizzesTotalCount: 6,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 90,
      attendanceRatePercent: 95,
      streakDays: 4,
      lastActive: 'Yesterday, 02:15 PM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Great contribution during the epidemiology SIR modeling tutorial.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: FHIR & HL7 Standards', lectureTitle: 'Lecture 1: Clinical Observation Data Models', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 45 },
        { moduleId: 'm2', moduleName: 'Module 2: Telemetry Ingestion', lectureTitle: 'Lecture 2: MQTT ECG Signal Streaming', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-14', timeSpentMinutes: 48 },
        { moduleId: 'm3', moduleName: 'Module 3: Medical Imaging', lectureTitle: 'Lecture 3: DICOM Parsing & PACS Servers', completed: true, watchedPercent: 100, quizScore: 94, quizPassed: true, completedAt: '2026-08-17', timeSpentMinutes: 40 },
        { moduleId: 'm4', moduleName: 'Module 4: Epidemiology Analytics', lectureTitle: 'Lecture 4: Compartmental SIR Infection Modeling', completed: true, watchedPercent: 100, quizScore: 92, quizPassed: true, completedAt: '2026-08-19', timeSpentMinutes: 42 },
        { moduleId: 'm5', moduleName: 'Module 5: Clinical Decision AI', lectureTitle: 'Lecture 5: Diagnostic Classification & Explainability', completed: true, watchedPercent: 100, quizScore: 90, quizPassed: true, completedAt: '2026-08-20', timeSpentMinutes: 38 },
        { moduleId: 'm6', moduleName: 'Module 6: Privacy Governance', lectureTitle: 'Lecture 6: POPIA Health Data Security Directives', completed: false, watchedPercent: 20, timeSpentMinutes: 10 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_med_01', title: 'FHIR Patient Resource Anonymization & Clinical Stream Ingestion', submittedAt: '2026-08-18 16:45', status: 'graded', grade: 90, maxGrade: 100 }
      ]
    },

    // COR-441 - Dean Margaret Edwards
    {
      id: 'lp_core101_stu01',
      studentId: 'stu_01',
      studentName: 'Sarah Khumalo',
      studentEmail: 'sarah.k@triple4c.edu',
      studentIdNumber: '444-STU-8821',
      courseId: 'crs_core101',
      courseCode: 'COR-441',
      courseTitle: '444 Curriculum: Critical Thinking & Data Ethics',
      teacherId: 'adm_01',
      teacherName: 'Dean Margaret Edwards',
      enrolledDate: '2026-01-10',
      overallProgressPercent: 95,
      completedLecturesCount: 4,
      totalLecturesCount: 4,
      averageQuizScore: 96,
      quizzesAttemptedCount: 4,
      quizzesTotalCount: 4,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 98,
      attendanceRatePercent: 100,
      streakDays: 6,
      lastActive: 'Today, 11:30 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Demonstrated exceptional ethical leadership in the algorithmic bias case study.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Ethical AI Frameworks', lectureTitle: 'Lecture 1: Dignity, Consent & Fairness', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-10', timeSpentMinutes: 35 },
        { moduleId: 'm2', moduleName: 'Module 2: POPIA Law', lectureTitle: 'Lecture 2: Statutory Data Protection Safeguards', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 40 },
        { moduleId: 'm3', moduleName: 'Module 3: Cognitive Biases', lectureTitle: 'Lecture 3: Epistemology & Scientific Rigor', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 38 },
        { moduleId: 'm4', moduleName: 'Module 4: Triple 4C Philosophy', lectureTitle: 'Lecture 4: Character & Creativity in Tech', completed: true, watchedPercent: 100, quizScore: 95, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 45 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_core_01', title: 'Ethical AI Auditing Framework & POPIA Impact Assessment', submittedAt: '2026-08-17 13:00', status: 'graded', grade: 98, maxGrade: 100 }
      ]
    },
    {
      id: 'lp_core101_stu07',
      studentId: 'stu_07',
      studentName: 'Ethan Botha',
      studentEmail: 'ethan.b@triple4c.edu',
      studentIdNumber: '444-STU-4921',
      courseId: 'crs_core101',
      courseCode: 'COR-441',
      courseTitle: '444 Curriculum: Critical Thinking & Data Ethics',
      teacherId: 'adm_01',
      teacherName: 'Dean Margaret Edwards',
      enrolledDate: '2026-01-10',
      overallProgressPercent: 96,
      completedLecturesCount: 4,
      totalLecturesCount: 4,
      averageQuizScore: 98,
      quizzesAttemptedCount: 4,
      quizzesTotalCount: 4,
      assignmentsSubmittedCount: 1,
      assignmentsTotalCount: 1,
      latestAssignmentGrade: 96,
      attendanceRatePercent: 100,
      streakDays: 11,
      lastActive: 'Today, 09:15 AM',
      performanceBand: 'High Distinction',
      teacherNotes: 'Insightful essay on open source governance and intellectual property ethics.',
      moduleDetails: [
        { moduleId: 'm1', moduleName: 'Module 1: Ethical AI Frameworks', lectureTitle: 'Lecture 1: Dignity, Consent & Fairness', completed: true, watchedPercent: 100, quizScore: 100, quizPassed: true, completedAt: '2026-08-10', timeSpentMinutes: 30 },
        { moduleId: 'm2', moduleName: 'Module 2: POPIA Law', lectureTitle: 'Lecture 2: Statutory Data Protection Safeguards', completed: true, watchedPercent: 100, quizScore: 96, quizPassed: true, completedAt: '2026-08-12', timeSpentMinutes: 35 },
        { moduleId: 'm3', moduleName: 'Module 3: Cognitive Biases', lectureTitle: 'Lecture 3: Epistemology & Scientific Rigor', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-15', timeSpentMinutes: 32 },
        { moduleId: 'm4', moduleName: 'Module 4: Triple 4C Philosophy', lectureTitle: 'Lecture 4: Character & Creativity in Tech', completed: true, watchedPercent: 100, quizScore: 98, quizPassed: true, completedAt: '2026-08-18', timeSpentMinutes: 40 }
      ],
      submittedAssignments: [
        { assignmentId: 'asg_core_01', title: 'Ethical AI Auditing Framework & POPIA Impact Assessment', submittedAt: '2026-08-17 10:20', status: 'graded', grade: 96, maxGrade: 100 }
      ]
    }
  ];

  // Helper method to add audit log
  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19)
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }
}

export const db = new DatabaseStore();

