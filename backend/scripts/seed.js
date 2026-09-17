const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('../config/database');
const {
  sequelize,
  User,
  Teacher,
  Class,
  Student,
  Subject,
  Attendance,
  Exam,
  Result,
  Fee,
} = require('../models');

const seedData = async () => {
  try {
    console.log('--- Starting Comprehensive School Management Seeding ---');
    console.log('Requirement: At least 10 students per class across all 14 classes + comprehensive subject-wise results');

    // 1. Initialize database (create DB if not exists)
    await initializeDatabase();

    // 2. Synchronize models (clean recreate)
    await sequelize.sync({ force: true });
    console.log('✓ Database tables created/synchronized successfully');

    // 3. Create Faculty Members / Teachers (9 Teachers)
    const teachersData = [
      {
        name: 'Dr. Ramesh Verma',
        qualification: 'Ph.D. in Mathematics, B.Ed.',
        phone: '+91 98765 43210',
        email: 'ramesh@school.com',
      },
      {
        name: 'Mrs. Sunita Rao',
        qualification: 'M.Sc. in Physics, B.Ed.',
        phone: '+91 98765 43211',
        email: 'sunita@school.com',
      },
      {
        name: 'Mr. Amit Kulkarni',
        qualification: 'M.A. in English Literature',
        phone: '+91 98765 43212',
        email: 'amit@school.com',
      },
      {
        name: 'Mrs. Meenakshi Sundaram',
        qualification: 'M.A., Montessori & Early Childhood Edu',
        phone: '+91 98765 43213',
        email: 'meenakshi@school.com',
      },
      {
        name: 'Mrs. Kavita Deshmukh',
        qualification: 'M.Sc. in Chemistry, B.Ed.',
        phone: '+91 98765 43214',
        email: 'kavita@school.com',
      },
      {
        name: 'Mr. Rajesh Nair',
        qualification: 'M.C.A., B.Ed. in Computer Applications',
        phone: '+91 98765 43215',
        email: 'rajesh@school.com',
      },
      {
        name: 'Mrs. Pooja Agarwal',
        qualification: 'M.A. in Hindi & Sanskrit, B.Ed.',
        phone: '+91 98765 43216',
        email: 'pooja@school.com',
      },
      {
        name: 'Mr. Vikram Singh',
        qualification: 'M.P.Ed., Physical Education & Sports',
        phone: '+91 98765 43217',
        email: 'vikram@school.com',
      },
      {
        name: 'Mrs. Anjali Mukherjee',
        qualification: 'M.A. in Social Science & History',
        phone: '+91 98765 43218',
        email: 'anjali@school.com',
      },
    ];

    const teachers = await Teacher.bulkCreate(teachersData);
    console.log(`✓ Created ${teachers.length} Faculty Members`);

    // 4. Create 14 Classes (Playgroup to Class 10)
    const classesData = [
      { class_name: 'Playgroup', section: 'A', room_no: 'PG-01', teacher_id: teachers[3].teacher_id },
      { class_name: 'Nursery', section: 'A', room_no: 'NUR-01', teacher_id: teachers[3].teacher_id },
      { class_name: 'LKG', section: 'A', room_no: 'KG-01', teacher_id: teachers[3].teacher_id },
      { class_name: 'UKG', section: 'A', room_no: 'KG-02', teacher_id: teachers[3].teacher_id },
      { class_name: 'Class 1', section: 'A', room_no: 'Room 101', teacher_id: teachers[2].teacher_id },
      { class_name: 'Class 2', section: 'A', room_no: 'Room 102', teacher_id: teachers[6].teacher_id },
      { class_name: 'Class 3', section: 'A', room_no: 'Room 103', teacher_id: teachers[8].teacher_id },
      { class_name: 'Class 4', section: 'A', room_no: 'Room 104', teacher_id: teachers[2].teacher_id },
      { class_name: 'Class 5', section: 'A', room_no: 'Room 105', teacher_id: teachers[0].teacher_id },
      { class_name: 'Class 6', section: 'A', room_no: 'Room 201', teacher_id: teachers[1].teacher_id },
      { class_name: 'Class 7', section: 'A', room_no: 'Room 202', teacher_id: teachers[4].teacher_id },
      { class_name: 'Class 8', section: 'A', room_no: 'Room 203', teacher_id: teachers[8].teacher_id },
      { class_name: 'Class 9', section: 'A', room_no: 'Room 301', teacher_id: teachers[5].teacher_id },
      { class_name: 'Class 10', section: 'A', room_no: 'Room 302', teacher_id: teachers[0].teacher_id },
    ];

    const classes = await Class.bulkCreate(classesData);
    console.log(`✓ Created ${classes.length} Classes (Playgroup to Class 10)`);

    // 5. Create Curriculum Subjects across ALL 14 classes
    const subjectsMap = {
      Playgroup: ['Rhymes & Phonics', 'Creative Colors & Art', 'Motor Skills & Play'],
      Nursery: ['English Alphabet & Phonics', 'Number Work 1-20', 'Picture Reading & EVS', 'Creative Drawing'],
      LKG: ['English Writing & Reading', 'Basic Mathematics', 'Hindi Varnamala', 'General Awareness'],
      UKG: ['English Sentences', 'Elementary Mathematics', 'Environmental Studies (EVS)', 'Hindi Shabad Gyaan'],
      'Class 1': ['English Communicative', 'Mathematics', 'Hindi', 'Environmental Studies (EVS)', 'Computer Basics'],
      'Class 2': ['English Communicative', 'Mathematics', 'Hindi', 'Environmental Studies (EVS)', 'Computer Basics'],
      'Class 3': ['English Communicative', 'Mathematics', 'General Science', 'Social Studies', 'Hindi', 'Computer Science'],
      'Class 4': ['English Communicative', 'Mathematics', 'General Science', 'Social Studies', 'Hindi', 'Computer Science'],
      'Class 5': ['English Grammar & Comp', 'Mathematics', 'General Science', 'Social Studies', 'Hindi', 'Computer Applications'],
      'Class 6': ['English Literature', 'Mathematics', 'Science (Physics/Chem/Bio)', 'Social Science', 'Hindi', 'Computer Science'],
      'Class 7': ['English Literature', 'Mathematics', 'Science (Physics/Chem/Bio)', 'Social Science', 'Hindi', 'Computer Science'],
      'Class 8': ['English Literature', 'Mathematics', 'Science (Physics/Chem/Bio)', 'Social Science', 'Hindi Course A', 'Computer Science'],
      'Class 9': ['English Communicative', 'Mathematics', 'Science (Physics/Chemistry/Bio)', 'Social Science', 'Hindi Course A', 'Information Technology'],
      'Class 10': ['English Communicative', 'Mathematics', 'Science (Physics & Chemistry)', 'Social Science', 'Hindi Course A', 'Information Technology'],
    };

    const subjectsData = [];
    classes.forEach((c) => {
      const list = subjectsMap[c.class_name] || ['General Studies', 'Mathematics', 'Language'];
      list.forEach((subName) => {
        subjectsData.push({
          subject_name: subName,
          class_id: c.class_id,
        });
      });
    });

    const subjects = await Subject.bulkCreate(subjectsData);
    console.log(`✓ Created ${subjects.length} Subjects across all 14 classes`);

    // 6. Create 10 Students for EVERY Class (14 Classes * 10 Students = 140 Students)
    const rawClassStudents = {
      Playgroup: [
        { name: 'Aayush Mehta', gender: 'Male', dob: '2023-04-12', email: 'aayush.m@school.com', phone: '+91 98111 20001', address: '12 Mayur Vihar, New Delhi' },
        { name: 'Anvi Sen', gender: 'Female', dob: '2023-06-18', email: 'anvi.s@school.com', phone: '+91 98111 20002', address: '45 Salt Lake City, Kolkata' },
        { name: 'Kabir Choudhury', gender: 'Male', dob: '2023-02-25', email: 'kabir.c@school.com', phone: '+91 98111 20003', address: '88 Indira Nagar, Bengaluru' },
        { name: 'Myra Jain', gender: 'Female', dob: '2023-08-14', email: 'myra.j@school.com', phone: '+91 98111 20004', address: '23 Malabar Hill, Mumbai' },
        { name: 'Reyansh Bhatt', gender: 'Male', dob: '2023-01-09', email: 'reyansh.b@school.com', phone: '+91 98111 20005', address: '19 Civil Lines, Jaipur' },
        { name: 'Prisha Kapoor', gender: 'Female', dob: '2023-09-30', email: 'prisha.k@school.com', phone: '+91 98111 20006', address: '77 Gomti Nagar, Lucknow' },
        { name: 'Advik Mishra', gender: 'Male', dob: '2023-05-22', email: 'advik.m@school.com', phone: '+91 98111 20007', address: '56 Kothrud, Pune' },
        { name: 'Pari Tiwari', gender: 'Female', dob: '2023-07-11', email: 'pari.t@school.com', phone: '+91 98111 20008', address: '34 Jubilee Hills, Hyderabad' },
        { name: 'Shaurya Yadav', gender: 'Male', dob: '2023-03-19', email: 'shaurya.y@school.com', phone: '+91 98111 20009', address: '90 Navrangpura, Ahmedabad' },
        { name: 'Kiara Saxena', gender: 'Female', dob: '2023-10-05', email: 'kiara.s@school.com', phone: '+91 98111 20010', address: '15 Anna Nagar, Chennai' },
      ],
      Nursery: [
        { name: 'Vihaan Deshmukh', gender: 'Male', dob: '2022-03-15', email: 'vihaan.d@school.com', phone: '+91 98111 20011', address: '22 Bandra West, Mumbai' },
        { name: 'Saanvi Rao', gender: 'Female', dob: '2022-07-22', email: 'saanvi.r@school.com', phone: '+91 98111 20012', address: '31 Jayanagar, Bengaluru' },
        { name: 'Atharv Kulkarni', gender: 'Male', dob: '2022-01-18', email: 'atharv.k@school.com', phone: '+91 98111 20013', address: '14 Shivaji Nagar, Pune' },
        { name: 'Ananya Das', gender: 'Female', dob: '2022-05-30', email: 'ananya.d@school.com', phone: '+91 98111 20014', address: '67 Ballygunge, Kolkata' },
        { name: 'Dhruv Sen', gender: 'Male', dob: '2022-09-12', email: 'dhruv.s@school.com', phone: '+91 98111 20015', address: '89 Saket, New Delhi' },
        { name: 'Riddhi Sharma', gender: 'Female', dob: '2022-11-04', email: 'riddhi.s@school.com', phone: '+91 98111 20016', address: '50 Mansarovar, Jaipur' },
        { name: 'Samar Verma', gender: 'Male', dob: '2022-04-20', email: 'samar.v@school.com', phone: '+91 98111 20017', address: '42 Aliganj, Lucknow' },
        { name: 'Tara Nair', gender: 'Female', dob: '2022-08-16', email: 'tara.n@school.com', phone: '+91 98111 20018', address: '29 Banjara Hills, Hyderabad' },
        { name: 'Yuvan Patel', gender: 'Male', dob: '2022-02-28', email: 'yuvan.p@school.com', phone: '+91 98111 20019', address: '18 Bodakdev, Ahmedabad' },
        { name: 'Ira Ghosh', gender: 'Female', dob: '2022-10-10', email: 'ira.g@school.com', phone: '+91 98111 20020', address: '62 Adyar, Chennai' },
      ],
      LKG: [
        { name: 'Ishaan Gupta', gender: 'Male', dob: '2021-05-10', email: 'ishaan.g@school.com', phone: '+91 98111 20021', address: '11 Vasant Vihar, New Delhi' },
        { name: 'Diya Mukherjee', gender: 'Female', dob: '2021-08-19', email: 'diya.m@school.com', phone: '+91 98111 20022', address: '55 Park Street, Kolkata' },
        { name: 'Vivaan Chauhan', gender: 'Male', dob: '2021-02-14', email: 'vivaan.c@school.com', phone: '+91 98111 20023', address: '73 Koregaon Park, Pune' },
        { name: 'Avani Reddy', gender: 'Female', dob: '2021-06-25', email: 'avani.r@school.com', phone: '+91 98111 20024', address: '38 Gachibowli, Hyderabad' },
        { name: 'Aarush Pillai', gender: 'Male', dob: '2021-09-08', email: 'aarush.p@school.com', phone: '+91 98111 20025', address: '49 Whitefield, Bengaluru' },
        { name: 'Meera Bhatia', gender: 'Female', dob: '2021-12-01', email: 'meera.b@school.com', phone: '+91 98111 20026', address: '81 Andheri East, Mumbai' },
        { name: 'Krishav Dubey', gender: 'Male', dob: '2021-03-29', email: 'krishav.d@school.com', phone: '+91 98111 20027', address: '24 Hazratganj, Lucknow' },
        { name: 'Navya Iyer', gender: 'Female', dob: '2021-07-15', email: 'navya.i@school.com', phone: '+91 98111 20028', address: '60 Mylapore, Chennai' },
        { name: 'Rudra Joshi', gender: 'Male', dob: '2021-01-22', email: 'rudra.j@school.com', phone: '+91 98111 20029', address: '16 C-Scheme, Jaipur' },
        { name: 'Siya Agarwal', gender: 'Female', dob: '2021-10-18', email: 'siya.a@school.com', phone: '+91 98111 20030', address: '93 Satellite, Ahmedabad' },
      ],
      UKG: [
        { name: 'Sai Joshi', gender: 'Male', dob: '2020-04-18', email: 'sai.j@school.com', phone: '+91 98111 20031', address: '44 Aundh, Pune' },
        { name: 'Riya Malhotra', gender: 'Female', dob: '2020-09-12', email: 'riya.m@school.com', phone: '+91 98111 20032', address: '68 Greater Kailash, New Delhi' },
        { name: 'Arjun Nambiar', gender: 'Male', dob: '2020-01-27', email: 'arjun.n@school.com', phone: '+91 98111 20033', address: '25 Koramangala, Bengaluru' },
        { name: 'Tanvi Sethi', gender: 'Female', dob: '2020-06-05', email: 'tanvi.s@school.com', phone: '+91 98111 20034', address: '19 Juhu, Mumbai' },
        { name: 'Siddharth Bose', gender: 'Male', dob: '2020-08-23', email: 'siddharth.b@school.com', phone: '+91 98111 20035', address: '72 New Alipore, Kolkata' },
        { name: 'Sara Mathur', gender: 'Female', dob: '2020-11-14', email: 'sara.m@school.com', phone: '+91 98111 20036', address: '36 Malviya Nagar, Jaipur' },
        { name: 'Devansh Singhal', gender: 'Male', dob: '2020-03-08', email: 'devansh.s@school.com', phone: '+91 98111 20037', address: '85 Gomti Nagar Ext, Lucknow' },
        { name: 'Ahana Chawla', gender: 'Female', dob: '2020-07-19', email: 'ahana.c@school.com', phone: '+91 98111 20038', address: '51 Madhapur, Hyderabad' },
        { name: 'Neil Pandita', gender: 'Male', dob: '2020-02-11', email: 'neil.p@school.com', phone: '+91 98111 20039', address: '28 Vastrapur, Ahmedabad' },
        { name: 'Kaira Grover', gender: 'Female', dob: '2020-10-29', email: 'kaira.g@school.com', phone: '+91 98111 20040', address: '17 T Nagar, Chennai' },
      ],
      'Class 1': [
        { name: 'Aditya Kulkarni', gender: 'Male', dob: '2019-03-12', email: 'aditya.k@school.com', phone: '+91 98111 20041', address: '10 Model Colony, Pune' },
        { name: 'Sneha Sen', gender: 'Female', dob: '2019-07-24', email: 'sneha.s@school.com', phone: '+91 98111 20042', address: '39 Sector 14, Gurugram' },
        { name: 'Pranav Dixit', gender: 'Male', dob: '2019-01-19', email: 'pranav.d@school.com', phone: '+91 98111 20043', address: '84 HSR Layout, Bengaluru' },
        { name: 'Ishita Roy', gender: 'Female', dob: '2019-05-15', email: 'ishita.r@school.com', phone: '+91 98111 20044', address: '57 Howrah, Kolkata' },
        { name: 'Tanmay Kaushik', gender: 'Male', dob: '2019-08-30', email: 'tanmay.k@school.com', phone: '+91 98111 20045', address: '21 Powai, Mumbai' },
        { name: 'Anika Soni', gender: 'Female', dob: '2019-11-09', email: 'anika.s@school.com', phone: '+91 98111 20046', address: '66 Vaishali Nagar, Jaipur' },
        { name: 'Aryan Tripathi', gender: 'Male', dob: '2019-04-03', email: 'aryan.t@school.com', phone: '+91 98111 20047', address: '48 Mahanagar, Lucknow' },
        { name: 'Dipti Varma', gender: 'Female', dob: '2019-09-21', email: 'dipti.v@school.com', phone: '+91 98111 20048', address: '79 Somajiguda, Hyderabad' },
        { name: 'Varun Hegde', gender: 'Male', dob: '2019-02-17', email: 'varun.h@school.com', phone: '+91 98111 20049', address: '30 Paldi, Ahmedabad' },
        { name: 'Vidhi Khatri', gender: 'Female', dob: '2019-10-12', email: 'vidhi.k@school.com', phone: '+91 98111 20050', address: '13 Velachery, Chennai' },
      ],
      'Class 2': [
        { name: 'Kunal Bansal', gender: 'Male', dob: '2018-05-14', email: 'kunal.b@school.com', phone: '+91 98111 20051', address: '26 Punjabi Bagh, New Delhi' },
        { name: 'Tanya Rastogi', gender: 'Female', dob: '2018-08-20', email: 'tanya.r@school.com', phone: '+91 98111 20052', address: '53 Kalyani Nagar, Pune' },
        { name: 'Harshit Shukla', gender: 'Male', dob: '2018-02-09', email: 'harshit.s@school.com', phone: '+91 98111 20053', address: '70 Indiranagar, Bengaluru' },
        { name: 'Pooja Trivedi', gender: 'Female', dob: '2018-06-17', email: 'pooja.t@school.com', phone: '+91 98111 20054', address: '41 Dum Dum, Kolkata' },
        { name: 'Naman Goel', gender: 'Male', dob: '2018-09-25', email: 'naman.g@school.com', phone: '+91 98111 20055', address: '88 Chembur, Mumbai' },
        { name: 'Ritu Aggarwal', gender: 'Female', dob: '2018-12-03', email: 'ritu.a@school.com', phone: '+91 98111 20056', address: '15 Raja Park, Jaipur' },
        { name: 'Ayush Saini', gender: 'Male', dob: '2018-03-28', email: 'ayush.s@school.com', phone: '+91 98111 20057', address: '62 Jankipuram, Lucknow' },
        { name: 'Mansi Rawat', gender: 'Female', dob: '2018-07-11', email: 'mansi.r@school.com', phone: '+91 98111 20058', address: '34 Kukatpally, Hyderabad' },
        { name: 'Chirag Bhatt', gender: 'Male', dob: '2018-01-15', email: 'chirag.b@school.com', phone: '+91 98111 20059', address: '97 Maninagar, Ahmedabad' },
        { name: 'Bhavya Mittal', gender: 'Female', dob: '2018-10-22', email: 'bhavya.m@school.com', phone: '+91 98111 20060', address: '22 Besant Nagar, Chennai' },
      ],
      'Class 3': [
        { name: 'Mayank Mahajan', gender: 'Male', dob: '2017-04-16', email: 'mayank.m@school.com', phone: '+91 98111 20061', address: '18 Pitampura, New Delhi' },
        { name: 'Swati Pandey', gender: 'Female', dob: '2017-07-19', email: 'swati.p@school.com', phone: '+91 98111 20062', address: '64 Viman Nagar, Pune' },
        { name: 'Raghav Somani', gender: 'Male', dob: '2017-01-25', email: 'raghav.s@school.com', phone: '+91 98111 20063', address: '81 Malleshwaram, Bengaluru' },
        { name: 'Neha Ganguly', gender: 'Female', dob: '2017-05-12', email: 'neha.g@school.com', phone: '+91 98111 20064', address: '35 Gariahat, Kolkata' },
        { name: 'Tushar Saxena', gender: 'Male', dob: '2017-09-02', email: 'tushar.s@school.com', phone: '+91 98111 20065', address: '49 Kandivali West, Mumbai' },
        { name: 'Kriti Lamba', gender: 'Female', dob: '2017-11-28', email: 'kriti.l@school.com', phone: '+91 98111 20066', address: '73 Tonk Road, Jaipur' },
        { name: 'Rishabh Kashyap', gender: 'Male', dob: '2017-03-07', email: 'rishabh.k@school.com', phone: '+91 98111 20067', address: '27 Vikas Nagar, Lucknow' },
        { name: 'Garima Dewan', gender: 'Female', dob: '2017-08-14', email: 'garima.d@school.com', phone: '+91 98111 20068', address: '90 Begumpet, Hyderabad' },
        { name: 'Parth Suri', gender: 'Male', dob: '2017-02-18', email: 'parth.s@school.com', phone: '+91 98111 20069', address: '58 Chandkheda, Ahmedabad' },
        { name: 'Simran Gill', gender: 'Female', dob: '2017-10-09', email: 'simran.g@school.com', phone: '+91 98111 20070', address: '12 Nungambakkam, Chennai' },
      ],
      'Class 4': [
        { name: 'Utkarsh Bhardwaj', gender: 'Male', dob: '2016-03-21', email: 'utkarsh.b@school.com', phone: '+91 98111 20071', address: '76 Rohini Sector 9, New Delhi' },
        { name: 'Shruti Maheshwari', gender: 'Female', dob: '2016-06-18', email: 'shruti.m@school.com', phone: '+91 98111 20072', address: '43 Baner, Pune' },
        { name: 'Abhinav Thakur', gender: 'Male', dob: '2016-01-11', email: 'abhinav.t@school.com', phone: '+91 98111 20073', address: '95 BTM Layout, Bengaluru' },
        { name: 'Divya Chhabra', gender: 'Female', dob: '2016-08-29', email: 'divya.c@school.com', phone: '+91 98111 20074', address: '28 Behala, Kolkata' },
        { name: 'Anmol Talwar', gender: 'Male', dob: '2016-09-15', email: 'anmol.t@school.com', phone: '+91 98111 20075', address: '61 Ghatkopar, Mumbai' },
        { name: 'Palak Oberoi', gender: 'Female', dob: '2016-12-05', email: 'palak.o@school.com', phone: '+91 98111 20076', address: '87 Ajmer Road, Jaipur' },
        { name: 'Kartikeya Rana', gender: 'Male', dob: '2016-04-09', email: 'kartikeya.r@school.com', phone: '+91 98111 20077', address: '32 Indira Nagar, Lucknow' },
        { name: 'Lavanya Ahluwalia', gender: 'Female', dob: '2016-07-22', email: 'lavanya.a@school.com', phone: '+91 98111 20078', address: '19 Kondapur, Hyderabad' },
        { name: 'Yash Vardhan', gender: 'Male', dob: '2016-02-14', email: 'yash.v@school.com', phone: '+91 98111 20079', address: '54 Thaltej, Ahmedabad' },
        { name: 'Nandini Seth', gender: 'Female', dob: '2016-10-31', email: 'nandini.s@school.com', phone: '+91 98111 20080', address: '40 Kilpauk, Chennai' },
      ],
      'Class 5': [
        { name: 'Nikhil Choudhary', gender: 'Male', dob: '2015-05-18', email: 'nikhil.c@school.com', phone: '+91 98111 20081', address: '33 Janakpuri, New Delhi' },
        { name: 'Shreya Nair', gender: 'Female', dob: '2015-08-14', email: 'shreya.n@school.com', phone: '+91 98111 20082', address: '59 Wakad, Pune' },
        { name: 'Keshav Murthy', gender: 'Male', dob: '2015-02-27', email: 'keshav.m@school.com', phone: '+91 98111 20083', address: '82 Basavanagudi, Bengaluru' },
        { name: 'Priyanka Balan', gender: 'Female', dob: '2015-06-09', email: 'priyanka.b@school.com', phone: '+91 98111 20084', address: '16 Alipore, Kolkata' },
        { name: 'Vedant Swaminathan', gender: 'Male', dob: '2015-09-22', email: 'vedant.s@school.com', phone: '+91 98111 20085', address: '71 Borivali West, Mumbai' },
        { name: 'Deepika Raman', gender: 'Female', dob: '2015-11-17', email: 'deepika.r@school.com', phone: '+91 98111 20086', address: '45 Vidhyadhar Nagar, Jaipur' },
        { name: 'Sameer Venkatesh', gender: 'Male', dob: '2015-03-05', email: 'sameer.v@school.com', phone: '+91 98111 20087', address: '98 Gomti Nagar, Lucknow' },
        { name: 'Archana Krishnan', gender: 'Female', dob: '2015-07-30', email: 'archana.k@school.com', phone: '+91 98111 20088', address: '23 Hitec City, Hyderabad' },
        { name: 'Tejas Alagappan', gender: 'Male', dob: '2015-01-20', email: 'tejas.a@school.com', phone: '+91 98111 20089', address: '67 Bopal, Ahmedabad' },
        { name: 'Malini Sundar', gender: 'Female', dob: '2015-10-15', email: 'malini.s@school.com', phone: '+91 98111 20090', address: '89 Mylapore, Chennai' },
      ],
      'Class 6': [
        { name: 'Gaurav Pande', gender: 'Male', dob: '2014-04-11', email: 'gaurav.p@school.com', phone: '+91 98111 20091', address: '14 Dwarka Sector 10, New Delhi' },
        { name: 'Mehak Narang', gender: 'Female', dob: '2014-07-23', email: 'mehak.n@school.com', phone: '+91 98111 20092', address: '78 Hadapsar, Pune' },
        { name: 'Alok Bajpai', gender: 'Male', dob: '2014-01-19', email: 'alok.b@school.com', phone: '+91 98111 20093', address: '47 Rajajinagar, Bengaluru' },
        { name: 'Sanya Sood', gender: 'Female', dob: '2014-05-16', email: 'sanya.s@school.com', phone: '+91 98111 20094', address: '20 Shyambazar, Kolkata' },
        { name: 'Jatin Anand', gender: 'Male', dob: '2014-08-28', email: 'jatin.a@school.com', phone: '+91 98111 20095', address: '85 Thane West, Mumbai' },
        { name: 'Trisha Sehgal', gender: 'Female', dob: '2014-11-12', email: 'trisha.s@school.com', phone: '+91 98111 20096', address: '36 Jagatpura, Jaipur' },
        { name: 'Rohit Bhasin', gender: 'Male', dob: '2014-03-02', email: 'rohit.b@school.com', phone: '+91 98111 20097', address: '63 Telibagh, Lucknow' },
        { name: 'Muskan Sabharwal', gender: 'Female', dob: '2014-09-07', email: 'muskan.s@school.com', phone: '+91 98111 20098', address: '91 Madhapur, Hyderabad' },
        { name: 'Chetan Duggal', gender: 'Male', dob: '2014-02-24', email: 'chetan.d@school.com', phone: '+91 98111 20099', address: '52 Sabarmati, Ahmedabad' },
        { name: 'Radhika Wahi', gender: 'Female', dob: '2014-10-18', email: 'radhika.w@school.com', phone: '+91 98111 20100', address: '27 Royapettah, Chennai' },
      ],
      'Class 7': [
        { name: 'Saurabh Upadhyay', gender: 'Male', dob: '2013-03-14', email: 'saurabh.u@school.com', phone: '+91 98111 20101', address: '55 Paschim Vihar, New Delhi' },
        { name: 'Payal Chaubey', gender: 'Female', dob: '2013-06-29', email: 'payal.c@school.com', phone: '+91 98111 20102', address: '32 Magarpatta, Pune' },
        { name: 'Vaibhav Pathak', gender: 'Male', dob: '2013-01-08', email: 'vaibhav.p@school.com', phone: '+91 98111 20103', address: '69 Marathahalli, Bengaluru' },
        { name: 'Preeti Goswami', gender: 'Female', dob: '2013-08-17', email: 'preeti.g@school.com', phone: '+91 98111 20104', address: '84 Tollygunge, Kolkata' },
        { name: 'Deepak Awasthi', gender: 'Male', dob: '2013-09-24', email: 'deepak.a@school.com', phone: '+91 98111 20105', address: '17 Dadar East, Mumbai' },
        { name: 'Shalini Pandey', gender: 'Female', dob: '2013-11-03', email: 'shalini.p@school.com', phone: '+91 98111 20106', address: '48 Pratap Nagar, Jaipur' },
        { name: 'Ashutosh Tripathi', gender: 'Male', dob: '2013-04-19', email: 'ashutosh.t@school.com', phone: '+91 98111 20107', address: '93 Chowk, Lucknow' },
        { name: 'Juhi Vajpayee', gender: 'Female', dob: '2013-07-12', email: 'juhi.v@school.com', phone: '+91 98111 20108', address: '38 Mehdipatnam, Hyderabad' },
        { name: 'Vivek Dwivedi', gender: 'Male', dob: '2013-02-15', email: 'vivek.d@school.com', phone: '+91 98111 20109', address: '74 Memnagar, Ahmedabad' },
        { name: 'Rashmi Chaturvedi', gender: 'Female', dob: '2013-10-25', email: 'rashmi.c@school.com', phone: '+91 98111 20110', address: '61 Egmore, Chennai' },
      ],
      'Class 8': [
        { name: 'Tanvi Deshpande', gender: 'Female', dob: '2012-04-16', email: 'tanvi@school.com', phone: '+91 98111 20111', address: '12 Erandwane, Pune' },
        { name: 'Sumit Kadam', gender: 'Male', dob: '2012-07-20', email: 'sumit.k@school.com', phone: '+91 98111 20112', address: '49 Laxmi Nagar, New Delhi' },
        { name: 'Prachi Sawant', gender: 'Female', dob: '2012-01-22', email: 'prachi.s@school.com', phone: '+91 98111 20113', address: '77 Electronic City, Bengaluru' },
        { name: 'Omkar Jadhav', gender: 'Male', dob: '2012-05-11', email: 'omkar.j@school.com', phone: '+91 98111 20114', address: '25 Salt Lake Sec 5, Kolkata' },
        { name: 'Shweta More', gender: 'Female', dob: '2012-09-19', email: 'shweta.m@school.com', phone: '+91 98111 20115', address: '90 Vile Parle West, Mumbai' },
        { name: 'Akshay Chavan', gender: 'Male', dob: '2012-11-26', email: 'akshay.c@school.com', phone: '+91 98111 20116', address: '33 Durgapura, Jaipur' },
        { name: 'Rutuja Salunkhe', gender: 'Female', dob: '2012-03-08', email: 'rutuja.s@school.com', phone: '+91 98111 20117', address: '66 Charbagh, Lucknow' },
        { name: 'Nilesh Gaikwad', gender: 'Male', dob: '2012-08-14', email: 'nilesh.g@school.com', phone: '+91 98111 20118', address: '42 Secunderabad, Hyderabad' },
        { name: 'Pallavi Shinde', gender: 'Female', dob: '2012-02-18', email: 'pallavi.s@school.com', phone: '+91 98111 20119', address: '18 Gota, Ahmedabad' },
        { name: 'Sagar Mohite', gender: 'Male', dob: '2012-10-30', email: 'sagar.m@school.com', phone: '+91 98111 20120', address: '85 Guindy, Chennai' },
      ],
      'Class 9': [
        { name: 'Chirag Singhal', gender: 'Male', dob: '2011-03-18', email: 'chirag.s@school.com', phone: '+91 98111 20121', address: '29 Defence Colony, New Delhi' },
        { name: 'Rituja Barman', gender: 'Female', dob: '2011-06-25', email: 'rituja.b@school.com', phone: '+91 98111 20122', address: '63 Sinhagad Road, Pune' },
        { name: 'Aniket Roy', gender: 'Male', dob: '2011-01-14', email: 'aniket.r@school.com', phone: '+91 98111 20123', address: '88 Sarjapur Road, Bengaluru' },
        { name: 'Monali Datta', gender: 'Female', dob: '2011-08-11', email: 'monali.d@school.com', phone: '+91 98111 20124', address: '14 Lake Gardens, Kolkata' },
        { name: 'Sourav Bose', gender: 'Male', dob: '2011-09-30', email: 'sourav.b@school.com', phone: '+91 98111 20125', address: '52 Mulund West, Mumbai' },
        { name: 'Sayani Sengupta', gender: 'Female', dob: '2011-11-15', email: 'sayani.s@school.com', phone: '+91 98111 20126', address: '79 Nirman Nagar, Jaipur' },
        { name: 'Subhajit Paul', gender: 'Male', dob: '2011-04-05', email: 'subhajit.p@school.com', phone: '+91 98111 20127', address: '36 Rajajipuram, Lucknow' },
        { name: 'Oindrila Majumdar', gender: 'Female', dob: '2011-07-28', email: 'oindrila.m@school.com', phone: '+91 98111 20128', address: '97 Uppal, Hyderabad' },
        { name: 'Debanjan Biswas', gender: 'Male', dob: '2011-02-20', email: 'debanjan.b@school.com', phone: '+91 98111 20129', address: '41 Science City, Ahmedabad' },
        { name: 'Debolina Ghosh', gender: 'Female', dob: '2011-10-12', email: 'debolina.g@school.com', phone: '+91 98111 20130', address: '23 Porur, Chennai' },
      ],
      'Class 10': [
        { name: 'Aarav Sharma', gender: 'Male', dob: '2010-05-14', email: 'aarav@school.com', phone: '+91 98111 20131', address: '45 Green Park, New Delhi' },
        { name: 'Ananya Iyer', gender: 'Female', dob: '2010-08-21', email: 'ananya.i@school.com', phone: '+91 98111 20132', address: '18 Frazer Town, Bengaluru' },
        { name: 'Rohan Patel', gender: 'Male', dob: '2010-02-10', email: 'rohan.p@school.com', phone: '+91 98111 20133', address: '89 Worli Seaface, Mumbai' },
        { name: 'Ishaan Kapoor', gender: 'Male', dob: '2010-06-19', email: 'ishaan.k@school.com', phone: '+91 98111 20134', address: '34 Civil Lines, Jaipur' },
        { name: 'Diya Varma', gender: 'Female', dob: '2010-09-14', email: 'diya.v@school.com', phone: '+91 98111 20135', address: '62 Gomti Nagar, Lucknow' },
        { name: 'Vivaan Reddy', gender: 'Male', dob: '2010-11-08', email: 'vivaan.r@school.com', phone: '+91 98111 20136', address: '77 Jubilee Hills, Hyderabad' },
        { name: 'Saanvi Joshi', gender: 'Female', dob: '2010-03-25', email: 'saanvi.j@school.com', phone: '+91 98111 20137', address: '21 FC Road, Pune' },
        { name: 'Aditya Sengupta', gender: 'Male', dob: '2010-07-16', email: 'aditya.s@school.com', phone: '+91 98111 20138', address: '50 Ballygunge Circular Rd, Kolkata' },
        { name: 'Meera Nair', gender: 'Female', dob: '2010-01-30', email: 'meera.n@school.com', phone: '+91 98111 20139', address: '93 Nungambakkam High Rd, Chennai' },
        { name: 'Kabir Mehta', gender: 'Male', dob: '2010-10-22', email: 'kabir.m@school.com', phone: '+91 98111 20140', address: '15 SG Highway, Ahmedabad' },
      ],
    };

    const studentsData = [];
    classes.forEach((c) => {
      const classList = rawClassStudents[c.class_name] || [];
      classList.forEach((st) => {
        studentsData.push({
          ...st,
          class_id: c.class_id,
        });
      });
    });

    const students = await Student.bulkCreate(studentsData);
    console.log(`✓ Created ${students.length} Enrolled Students across all 14 classes (10 per class)`);

    // 7. Create User Authentication Accounts for Admin, Teachers, and All 140 Students
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    const hashedTeacherPassword = await bcrypt.hash('teacher123', salt);
    const hashedStudentPassword = await bcrypt.hash('student123', salt);

    const usersData = [
      // Administrator
      {
        username: 'admin',
        email: 'admin@school.com',
        password: hashedAdminPassword,
        role: 'admin',
      },
      // 9 Faculty Members
      ...teachersData.map((t) => ({
        username: t.email.split('@')[0],
        email: t.email,
        password: hashedTeacherPassword,
        role: 'teacher',
      })),
      // All 140 Students
      ...students.map((s) => ({
        username: s.email.split('@')[0],
        email: s.email,
        password: hashedStudentPassword,
        role: 'student',
      })),
    ];

    await User.bulkCreate(usersData);
    console.log(`✓ Created ${usersData.length} User Auth Accounts with Pre-hashed Passwords`);

    // 8. Create Attendance Records for all 140 students
    const attendanceRecords = [];
    const dates = ['2026-09-15', '2026-09-16', '2026-09-17'];
    students.forEach((st, idx) => {
      dates.forEach((d, dIdx) => {
        let status = 'Present';
        if ((idx + dIdx) % 9 === 0) status = 'Absent';
        else if ((idx + dIdx) % 6 === 0) status = 'Late';

        attendanceRecords.push({
          student_id: st.student_id,
          date: d,
          status,
        });
      });
    });
    await Attendance.bulkCreate(attendanceRecords);
    console.log(`✓ Created ${attendanceRecords.length} Attendance Records`);

    // 9. Create Examination Terms
    const examsData = [
      { exam_name: 'Periodic Assessment - 1', exam_date: '2026-07-25' },
      { exam_name: 'Half Yearly Examination 2026', exam_date: '2026-09-20' },
      { exam_name: 'Annual Board Assessment 2026', exam_date: '2026-12-15' },
    ];
    const exams = await Exam.bulkCreate(examsData);
    console.log(`✓ Created ${exams.length} Examination terms`);

    // 10. Create Comprehensive Subject-wise Examination Results for EVERY CLASS & EVERY STUDENT
    const resultsData = [];
    const halfYearlyExam = exams[1]; // Half Yearly Examination 2026
    const periodicExam = exams[0];   // Periodic Assessment - 1

    classes.forEach((c) => {
      // Find all students in this class (10 students)
      const classStudents = students.filter((s) => s.class_id === c.class_id);
      // Find all subjects for this class
      const classSubjects = subjects.filter((sub) => sub.class_id === c.class_id);

      classStudents.forEach((st, stIdx) => {
        classSubjects.forEach((sub, subIdx) => {
          // Calculate realistic marks (65 - 99%)
          const baseOffset = (stIdx * 3 + subIdx * 5) % 25;
          let marks = 75 + baseOffset;
          if (st.name === 'Aarav Sharma') marks = 92 + (subIdx % 7);
          else if (st.name === 'Ananya Iyer') marks = 90 + (subIdx % 8);
          else if (st.name === 'Rohan Patel') marks = 78 + (subIdx % 10);

          if (marks > 100) marks = 98;
          if (marks < 40) marks = 55;

          let grade = 'B';
          if (marks >= 90) grade = 'A+';
          else if (marks >= 80) grade = 'A';
          else if (marks >= 70) grade = 'B';
          else if (marks >= 60) grade = 'C';
          else if (marks >= 50) grade = 'D';
          else grade = 'F';

          // Half Yearly Result
          resultsData.push({
            student_id: st.student_id,
            exam_id: halfYearlyExam.exam_id,
            subject_id: sub.subject_id,
            marks,
            grade,
          });

          // Also record Periodic Assessment for first 3 subjects of higher classes (Class 6 - 10)
          if (c.class_name.startsWith('Class') && parseInt(c.class_name.replace('Class ', ''), 10) >= 6 && subIdx < 3) {
            let paMarks = Math.max(50, Math.min(99, marks - 4 + (subIdx * 2)));
            let paGrade = paMarks >= 90 ? 'A+' : paMarks >= 80 ? 'A' : paMarks >= 70 ? 'B' : 'C';
            resultsData.push({
              student_id: st.student_id,
              exam_id: periodicExam.exam_id,
              subject_id: sub.subject_id,
              marks: paMarks,
              grade: paGrade,
            });
          }
        });
      });
    });

    await Result.bulkCreate(resultsData);
    console.log(`✓ Created ${resultsData.length} Subject-wise Results across ALL 14 Classes`);

    // 11. Create Fee Invoices in Indian Rupees (₹) for all 140 students
    const feesData = students.map((st, idx) => {
      // Find class name
      const studentClass = classes.find((c) => c.class_id === st.class_id);
      const cName = studentClass ? studentClass.class_name : '';

      let amount = 22000;
      if (['Playgroup', 'Nursery', 'LKG', 'UKG'].includes(cName)) {
        amount = 18000;
      } else if (['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(cName)) {
        amount = 22000;
      } else if (['Class 6', 'Class 7', 'Class 8'].includes(cName)) {
        amount = 25000;
      } else {
        amount = 28000; // Class 9 & Class 10
      }

      let status = 'Paid';
      let payment_date = '2026-08-10';
      let paid_amount = amount;

      if (idx % 4 === 1) {
        status = 'Pending';
        payment_date = null;
        paid_amount = idx % 2 === 0 ? 10000 : 0; // Some students have partial payment
      } else if (idx % 6 === 0) {
        status = 'Overdue';
        payment_date = null;
        paid_amount = 0;
      }

      return {
        student_id: st.student_id,
        amount,
        paid_amount,
        payment_date,
        status,
      };
    });

    await Fee.bulkCreate(feesData);
    console.log(`✓ Created ${feesData.length} Fee Invoices in Indian Rupees (₹) across all classes`);

    console.log('\n======================================================================');
    console.log('🎉 COMPREHENSIVE SEEDING COMPLETED!');
    console.log(`  Classes:        ${classes.length} (Playgroup, Nursery, LKG, UKG, Class 1-10)`);
    console.log(`  Students:       ${students.length} (Exactly 10 students per class)`);
    console.log(`  Teachers:       ${teachers.length} Faculty Members`);
    console.log(`  Subjects:       ${subjects.length} Across all grades`);
    console.log(`  Results:        ${resultsData.length} Subject-wise marks with Percentage (%)`);
    console.log(`  Fees:           ${feesData.length} Invoices in ₹ (INR)`);
    console.log(`  User Accounts:  ${usersData.length} Auth Logins`);
    console.log('======================================================================');
    console.log('Default Credentials:');
    console.log('  Admin:   admin@school.com   / admin123');
    console.log('  Teacher: ramesh@school.com  / teacher123 (Dr. Ramesh Verma)');
    console.log('  Student: aarav@school.com   / student123 (Aarav Sharma - Class 10)');
    console.log('======================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
