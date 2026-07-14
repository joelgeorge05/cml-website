/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ayoqlfospgjcklucurig.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://ayoqlfospgjcklucurig.supabase.co",
        "https://images.unsplash.com",
        "https://*.supabase.co",
        "https://*.unsplash.com",
      ],
      connectSrc: [
        "'self'",
        "https://ayoqlfospgjcklucurig.supabase.co",
        "https://*.supabase.co",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "wss://ayoqlfospgjcklucurig.supabase.co",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' }
});

const saveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, error: 'Too many requests. Please slow down.' }
});

const JWT_SECRET = process.env.JWT_SECRET || 'cml-mekhala-super-secret-key-2026';

// Users & roles
const defaultUsers = [
  { email: 'joelveliyath05@gmail.com', name: 'Joel Veliyath', role: 'Super Admin', password: bcrypt.hashSync('pan9710@ZER', 10) },
  { email: 'admin@cmlkaliyar.org', name: 'Mekhala Office Bearer', role: 'Admin', password: bcrypt.hashSync('pan9710@ZER', 10) }
];

// Initial Seed Data
const initialDB = {
  settings: {
    supportDesk: '+91 94007 93505',
    email: 'cmlkaliyarmekhala@gmail.com',
    mottoPrimary: 'സ്നേഹം • ത്യാഗം',
    mottoSecondary: 'സേവനം • സഹനം',
    heroIntro: 'Live updates from the Cherupushpa Mission League Kothamangalam Diocese — competitions, announcements, and galleries.',
    parishUnitsCount: 115
  },
  announcements: [
    {
      id: 'ann-1',
      text: 'Mekhala Kalolsavam 2026 is scheduled to be held at Karimannoor on July 4-5. Online registration portal has started!',
      type: 'urgent',
      date: '2026-05-28',
      isSticky: true
    },
    {
      id: 'ann-2',
      text: 'CML Kaliyar Mekhala Golden Jubilee Year celebration guidelines have been distributed to all parish directors.',
      type: 'regular',
      date: '2026-05-25',
      isSticky: false
    },
    {
      id: 'ann-3',
      text: 'Unit Secretaries should submit the mid-term membership reports before June 5, 2026.',
      type: 'urgent',
      date: '2025-05-29',
      isSticky: true
    }
  ],
  news: [
    {
      id: 'news-1',
      title: 'Mekhala Leaders Workshop Concluded at St. Marys Hall Kaliyar',
      body: 'The annual leadership seminar and training workshop for parish unit bearers of Cherupushpa Mission League Kaliyar Mekhala was held successfully. Over 80 student leaders and animator sisters from 11 parish units participated. Rev. Fr. Mathew Elanjimattom inaugurated the session, urging youngsters to embrace the missionary spirit in their daily routines, embodying the CML ideals of Love, Sacrifice, Service, and Suffering.',
      category: 'Workshop',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400',
      date: '2026-05-24',
      isFeatured: true
    },
    {
      id: 'news-2',
      title: 'Golden Jubilee Celebration Preparations Commences',
      body: 'CML Kaliyar Mekhala has officially formed the executive committee for planning the upcoming Golden Jubilee celebrations. Various spiritual, social service, and literary events will be hosted throughout the academic year. Bishop of Kothamangalam Diocese will join the central opening ceremony.',
      category: 'Celebration',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400',
      date: '2026-05-20',
      isFeatured: false
    }
  ],
  officeBearers: [
    {
      id: 'ob-1',
      name: 'Rev. Fr. Mathew Elanjimattom',
      designation: 'Mekhala Director',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      contact: '+91 94460 21345',
      email: 'mathew.fr@cmlkaliyar.org',
      servicePeriod: '2024 - Present',
      orderIndex: 0,
      houseName: 'Elanjimattom Presbytery',
      unit: 'Kaliyar Unit'
    },
    {
      id: 'ob-2',
      name: 'Rev. Sr. Treesa SIC',
      designation: 'Mekhala Joint Director',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      contact: '+91 85930 11223',
      email: 'treesa.sr@cmlkaliyar.org',
      servicePeriod: '2025 - Present',
      orderIndex: 1,
      houseName: 'Sacred Heart Convent',
      unit: 'Vannappuram Unit'
    },
    {
      id: 'ob-3',
      name: 'Mr. Joel Veliyath',
      designation: 'Mekhala Organizer',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      contact: '+91 98450 67890',
      email: 'joelveliyath05@gmail.com',
      servicePeriod: '2024 - Present',
      orderIndex: 2,
      houseName: 'Veliyath House',
      unit: 'Karimannoor Unit'
    },
    {
      id: 'ob-4',
      name: 'Miss Sharon Saji',
      designation: 'Mekhala President',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      contact: '+91 75924 12345',
      email: 'sharon.president@cmlkaliyar.org',
      servicePeriod: '2025 - 2026',
      orderIndex: 3,
      houseName: 'Thachapuzha House',
      unit: 'Kaliyar Unit'
    },
    {
      id: 'ob-5',
      name: 'Mr. George Kutty',
      designation: 'Mekhala General Secretary',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      contact: '+91 95421 98765',
      email: 'george.secretary@cmlkaliyar.org',
      servicePeriod: '2025 - 2026',
      orderIndex: 4,
      houseName: 'Nedumpallil House',
      unit: 'Kodikulam Unit'
    }
  ],
  units: [
    { id: 'KYR01', name: 'Kaliyar', patronSaint: 'Holy Mary', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Kaliyar Unit', orderIndex: 0, directorName: 'Fr. Thomas Pothanamuzhi', directorPhone: '94478 22014', jointDirectorName: 'Sr. Rosmy SABS', jointDirectorPhone: '80756 54816', presidentName: 'Christo Joby', presidentPhone: '85908 96705' },
    { id: 'KYR02', name: 'Kadavoor', patronSaint: 'St. George', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Kadavoor Unit', orderIndex: 1, directorName: 'Fr Mathew Edattu', directorPhone: '8113032243', jointDirectorName: 'Jilsha George', jointDirectorPhone: '9605085935', presidentName: 'George Baby', presidentPhone: '9562381251' },
    { id: 'KYR03', name: 'Kodikulam', patronSaint: 'St. George', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Kodikulam Unit', orderIndex: 2, directorName: 'Fr Johnson Pazhayapeedikayil', directorPhone: '83049 62687', jointDirectorName: 'Mrs Mini Babu', jointDirectorPhone: '94956 84460', presidentName: 'Jose Juby', presidentPhone: '9447823623' },
    { id: 'KYR04', name: 'Koduvely', patronSaint: 'St. Mary', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Koduvely Unit', orderIndex: 3, directorName: 'Fr Babu Mattathil CMI', directorPhone: '9847433009', jointDirectorName: 'Sr Amal Mariya SABS', jointDirectorPhone: '8157830360', presidentName: 'Luswin jaison', presidentPhone: '8078811268' },
    { id: 'KYR05', name: 'Mullaringad', patronSaint: 'St. Joseph', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Mullaringad Unit', orderIndex: 4, directorName: 'Fr Jacob vattapililll', directorPhone: '9961014934', jointDirectorName: 'Sr anupama SD', jointDirectorPhone: '6282537483', presidentName: 'Amal joshy', presidentPhone: '7510209472' },
    { id: 'KYR06', name: 'Mundanmudy', patronSaint: 'St. Thomas', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Mundanmudy Unit', orderIndex: 5, directorName: 'Fr joseph kochuputhanpurackal', directorPhone: '9539881850', jointDirectorName: 'Sr:sherin SABS', jointDirectorPhone: '8281619541', presidentName: 'jeswin jinson', presidentPhone: '9447876965' },
    { id: 'KYR07', name: 'Njarakkad', patronSaint: 'St. Sebastian', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Njarakkad Unit', orderIndex: 6, directorName: 'Fr Antony Ovelil', directorPhone: '7909246103', jointDirectorName: 'Sr Nirmal SH', jointDirectorPhone: '8943898014', presidentName: 'Savio Jojo', presidentPhone: '8590383939' },
    { id: 'KYR08', name: 'Paingottoor', patronSaint: 'St. Antony', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Paingottoor Unit', orderIndex: 7, directorName: 'Fr. Kuriakose kodakkallil', directorPhone: '9447523068', jointDirectorName: 'Sr. Soumya Fcc', jointDirectorPhone: '7306518880', presidentName: 'Alen emmanuel boby', presidentPhone: '7994080020' },
    { id: 'KYR09', name: 'Punnamattam', patronSaint: 'St. Mary', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Punnamattam Unit', orderIndex: 8, directorName: 'Fr. John Kadavan', directorPhone: '94468 01191', jointDirectorName: 'Gisha Shaji', jointDirectorPhone: '9207330608', presidentName: 'Alwin Vincent', presidentPhone: '9061370062' },
    { id: 'KYR10', name: 'Rajagiri', patronSaint: 'St. Joseph', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Rajagiri Unit', orderIndex: 9, directorName: 'Fr.Sebastian Konthenppillil', directorPhone: '9747499241', jointDirectorName: 'Sr.Jeena Paul CMC', jointDirectorPhone: '7907816095', presidentName: 'Antony J Chacko', presidentPhone: '9747499241' },
    { id: 'KYR11', name: 'Thennathoor', patronSaint: 'St. Jude', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Thennathoor Unit', orderIndex: 10, directorName: 'Fr Sebastian Thumbamattathil', directorPhone: '82811 36402', jointDirectorName: 'Sr.Elsa Grace FCC', jointDirectorPhone: '7034477042', presidentName: 'Georgin Jinish', presidentPhone: '8606279172' },
    { id: 'KYR12', name: 'Thommankuthu', patronSaint: 'St. Thomas', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Thommankuthu Unit', orderIndex: 11, directorName: 'Fr. James Aikkaramattam', directorPhone: '9446131957', jointDirectorName: 'Sr. Mable FCC', jointDirectorPhone: '8078262169', presidentName: 'Alex Jojo', presidentPhone: '9656405484' },
    { id: 'KYR13', name: 'Vannappuram', patronSaint: 'St. Sebastian', contactNumber: '+91', bgPhoto: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400', stats: { members: 0, families: 0, directorsCount: 0 }, description: 'Vannappuram Unit', orderIndex: 12, directorName: 'Fr.Jacob Rathapillil', directorPhone: '9947511494', jointDirectorName: 'Sr.Daisa SD', jointDirectorPhone: '7560854415', presidentName: 'Jeevan K J', presidentPhone: '9496089092' },
  ],
  events: [
    {
      id: 'ev-1',
      title: 'Mekhala Kalolsavam 2026',
      type: 'upcoming',
      date: '2026-07-04',
      time: '09:00 AM - 05:00 PM',
      venue: 'St. Augustine Higher Secondary School, Karimannoor',
      description: 'The grand annual cultural fiesta of Kaliyar Mekhala where hundreds of children showcase their Talents in group song, Margam Kali, Elocution, Painting, and Bible Skits. Registrations are open through unit secretaries.',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400'
    },
    {
      id: 'ev-2',
      title: 'Feast of St. Therese (Patroness Feast Day)',
      type: 'upcoming',
      date: '2026-10-01',
      time: '04:30 PM - 07:30 PM',
      venue: 'St. Mary’s Forane Church HQ, Kaliyar',
      description: 'Solemn Holy Mass, Novena, Candlelight procession, and distribution of rose petals. Followed by annual missionary award announcement.',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400'
    },
    {
      id: 'ev-3',
      title: 'Mekhala Sahithyamalsaram 2025',
      type: 'past',
      date: '2025-11-20',
      time: '10:00 AM',
      venue: 'St. George Parish, Kodikulam',
      description: 'Literary competition focusing on Malayalam Essay Writing, Bible Verse recitation, Storytelling, and Mission Poetry. Vannappuram Unit emerged Overall Champions.',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400',
      summary: 'Vannappuram parish unit scored 112 points to win the rolling trophy. Kodikulam secured second place with 84 points. Bishop of Kothamangalam presented the trophies.'
    }
  ],
  galleryAlbums: [
    {
      id: 'alb-1',
      title: 'CML Mekhala Kalolsavam Highlights',
      category: 'Arts & Culture',
      description: 'Spectacular visual memories of theatrical plays, religious songs, and cultural quiz stages.',
      coverImageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400'
    },
    {
      id: 'alb-2',
      title: 'Mekhala Leaders Training Camp',
      category: 'Seminars',
      description: 'Nurturing future church leaders with high spiritual morals, team building, and social values.',
      coverImageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400'
    }
  ],
  galleryImages: [
    {
      id: 'img-1',
      albumId: 'alb-1',
      title: 'Margam Kali Performance Win',
      imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600',
      createdAt: '2025-11-20'
    },
    {
      id: 'img-2',
      albumId: 'alb-1',
      title: 'Overall Trophy presentation',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
      createdAt: '2025-11-20'
    },
    {
      id: 'img-3',
      albumId: 'alb-2',
      title: 'Inspirations lecture under roses painting',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400',
      createdAt: '2026-05-24'
    }
  ],
  downloads: [
    {
      id: 'dl-1',
      title: 'CML Kalolsavam 2026 Registration Sheet',
      category: 'form',
      fileSize: '420 KB',
      downloadUrl: '#',
      uploadDate: '2026-05-28',
      description: 'Authorized spreadsheet template for unit secretaries to compile parish entry submissions.'
    },
    {
      id: 'dl-2',
      title: 'CML Kaliyar Mekhala Calendar & Activities Planner 2026',
      category: 'circular',
      fileSize: '1.4 MB',
      downloadUrl: '#',
      uploadDate: '2026-01-10',
      description: 'The complete agenda, circular directives, exam dates, and prayer guidelines for the whole year.'
    },
    {
      id: 'dl-3',
      title: 'Midterm Report Template (June 2026)',
      category: 'report',
      fileSize: '210 KB',
      downloadUrl: '#',
      uploadDate: '2026-05-29',
      description: 'Prescribed report form to document member collections, missionary box stats, and unit activities.'
    }
  ],
  registrations: [],
  competitionStatuses: {},
  logs: [
    {
      id: 'log-1',
      userEmail: 'joelveliyath05@gmail.com',
      action: 'INITIAL_SEED',
      target: 'Database Initialized',
      timestamp: '2026-05-29T16:30:40Z'
    }
  ],
  results: [
    {
      id: 'res-1',
      competitorName: 'Albin Kurian',
      unitId: 'unit-2',
      unitName: 'St. Sebastian Church, Vannappuram',
      competition: 'Kalolsavam',
      eventName: 'Margamkali (മാർഗംകളി)',
      grade: 'A',
      position: '1st',
      totalPoints: 10,
      isPublished: true,
      createdAt: '2026-05-29T17:00:00Z'
    },
    {
      id: 'res-2',
      competitorName: 'Maria Augustine',
      unitId: 'unit-4',
      unitName: 'St. Augustine Church, Karimannoor',
      competition: 'Kalolsavam',
      eventName: 'Margamkali (മാർഗംകളി)',
      grade: 'A',
      position: '2nd',
      totalPoints: 8,
      isPublished: true,
      createdAt: '2026-05-29T17:05:00Z'
    },
    {
      id: 'res-3',
      competitorName: 'Robin Joseph',
      unitId: 'unit-1',
      unitName: 'St. Marys Church, Kaliyar',
      competition: 'Kalolsavam',
      eventName: 'Bible Story Recitation (കഥാപ്രസംഗം)',
      grade: 'A',
      position: '1st',
      totalPoints: 10,
      isPublished: true,
      createdAt: '2026-05-29T17:10:00Z'
    },
    {
      id: 'res-4',
      competitorName: 'Tessa Saji',
      unitId: 'unit-3',
      unitName: 'St. George Church, Kodikulam',
      competition: 'Kalolsavam',
      eventName: 'Bible Story Recitation (കഥാപ്രസംഗം)',
      grade: 'B',
      position: '2nd',
      totalPoints: 6,
      isPublished: true,
      createdAt: '2026-05-29T17:15:00Z'
    },
    {
      id: 'res-5',
      competitorName: 'Sharon Saji',
      unitId: 'unit-1',
      unitName: 'St. Marys Church, Kaliyar',
      competition: 'Sahithyamalsaram',
      eventName: 'Bible Essay Writing (ഉപന്യാസ രചന)',
      grade: 'A',
      position: '1st',
      totalPoints: 10,
      isPublished: true,
      createdAt: '2026-05-29T17:20:00Z'
    },
    {
      id: 'res-6',
      competitorName: 'George Kutty',
      unitId: 'unit-3',
      unitName: 'St. George Church, Kodikulam',
      competition: 'Sahithyamalsaram',
      eventName: 'Poetry Composition (കവിതാ രചന)',
      grade: 'A',
      position: '2nd',
      totalPoints: 8,
      isPublished: true,
      createdAt: '2026-05-29T17:25:00Z'
    },
    {
      id: 'res-7',
      competitorName: 'Sandra Manoj',
      unitId: 'unit-2',
      unitName: 'St. Sebastian Church, Vannappuram',
      competition: 'Sahithyamalsaram',
      eventName: 'Poetry Composition (കവിതാ രചന)',
      grade: 'B',
      position: '3rd',
      totalPoints: 4,
      isPublished: true,
      createdAt: '2026-05-29T17:30:00Z'
    }
  ]
};

// Initialize DB file
function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.results) parsed.results = [];
    if (!parsed.registrations) parsed.registrations = [];
    if (!parsed.competitionStatuses) parsed.competitionStatuses = {};
    if (!parsed.users) parsed.users = [];
    if (!parsed.results) {
      parsed.results = initialDB.results;
    }

    // Automatic self-repair for registrations that got imported with blank event/competitor name
    let wasModified = false;
    
    // Auto-hash plaintext passwords for existing users
    if (parsed.users && Array.isArray(parsed.users)) {
      parsed.users = parsed.users.map((u: any) => {
        if (u.password && !u.password.startsWith('$2')) {
          u.password = bcrypt.hashSync(u.password, 10);
          wasModified = true;
        }
        return u;
      });
    }
    if (parsed.registrations && Array.isArray(parsed.registrations)) {
      parsed.registrations = parsed.registrations.map((reg: any) => {
        if ((reg.competitorName === 'Group Shakha' || !reg.eventName) && reg.houseName) {
          const text = reg.houseName.trim();
          const sections = ['Sub Junior', 'Super Senior', 'Junior', 'Senior', 'Group Items'];
          let matchedSection = '';
          
          for (const sec of sections) {
            const idx = text.toLowerCase().indexOf(sec.toLowerCase());
            if (idx !== -1) {
              matchedSection = sec;
              break;
            }
          }
          
          if (!matchedSection) {
            if (text.toUpperCase().includes('SUB JUNIOR')) matchedSection = 'Sub Junior';
            else if (text.toUpperCase().includes('SUPER SENIOR')) matchedSection = 'Super Senior';
            else if (text.toUpperCase().includes('JUNIOR')) matchedSection = 'Junior';
            else if (text.toUpperCase().includes('SENIOR')) matchedSection = 'Senior';
          }

          if (matchedSection) {
            const secIdx = text.toLowerCase().indexOf(matchedSection.toLowerCase());
            let eventPart = text.substring(0, secIdx).trim();
            
            // Normalize event name representations
            if (eventPart.toLowerCase().includes('reading')) {
              eventPart = 'Bible Reading';
            } else if (eventPart.toLowerCase().includes('quiz')) {
              eventPart = 'Mission Quiz';
            } else if (eventPart.toLowerCase().includes('solo')) {
              eventPart = 'Solo';
            } else if (eventPart.toLowerCase().includes('speech')) {
              eventPart = 'Speech';
            } else if (eventPart.toLowerCase().includes('debate')) {
              eventPart = 'Debate';
            } else if (!eventPart) {
              eventPart = 'Solo';
            } else {
              eventPart = eventPart.replace(/\b\w/g, l => l.toUpperCase());
            }
            
            const afterSec = text.substring(secIdx + matchedSection.length).trim();
            let competitorPart = '';
            let housePart = '';
            
            const commaIdx = afterSec.indexOf(',');
            if (commaIdx !== -1) {
              competitorPart = afterSec.substring(0, commaIdx).trim();
              housePart = afterSec.substring(commaIdx + 1).trim();
            } else {
              competitorPart = afterSec;
              housePart = '';
            }
            
            if (competitorPart) {
              reg.section = matchedSection;
              reg.eventName = eventPart;
              reg.competitorName = competitorPart;
              reg.houseName = housePart;
              wasModified = true;
            }
          }
        }
        return reg;
      });
    }

    if (wasModified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (e) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }
}

function saveDatabase(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Router API
app.get('/api/data', (req, res) => {
  const data = loadDatabase();
  // Filter out password fields from dynamic users to prevent security leaks
  const safeData = { ...data };
  if (safeData.users && Array.isArray(safeData.users)) {
    safeData.users = safeData.users.map(({ password, ...u }: any) => u);
  }
  res.json(safeData);
});

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ success: false, error: 'Forbidden: Invalid token' });
    req.user = user;
    next();
  });
}

// Authentications
app.post('/api/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const db = loadDatabase();
  const dynamicUsers = db.users || [];
  const allUsers = [...defaultUsers, ...dynamicUsers];

  const cleanEmail = email.trim().toLowerCase();
  let user = allUsers.find(
    u => u.email.trim().toLowerCase() === cleanEmail
  );

  let isValid = false;
  if (user && bcrypt.compareSync(password, user.password)) {
    isValid = true;
  } else if (!user && cleanEmail.endsWith('@shakha.cml')) {
    // Fallback for auto-generated Shakha accounts
    const shakhaId = cleanEmail.split('@')[0].toUpperCase();
    const unit = db.units?.find((u: any) => u.id.toUpperCase() === shakhaId);
    if (unit) {
      if (unit.password && unit.password.startsWith('$2')) {
        if (bcrypt.compareSync(password, unit.password)) {
          user = { email: cleanEmail, name: `${unit.name} Shakha`, role: 'shakha' };
          isValid = true;
        }
      } else if (password === `CML${shakhaId}`) {
        user = { email: cleanEmail, name: `${unit.name} Shakha`, role: 'shakha' };
        isValid = true;
      }
    }
  }

  if (isValid && user) {
    const accessToken = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      success: true,
      token: accessToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
});

// Logs helper
function appendLog(userEmail: string, action: string, target: string) {
  const timestamp = new Date().toISOString();
  const id = `log-${Date.now()}`;
  const user_email = userEmail || 'Anonymous';

  if (supabase) {
    supabase.from('activity_logs').insert([{
      id,
      user_email,
      action,
      target,
      timestamp
    }]).then(({ error }) => {
      if (error) console.error('Failed to log to supabase:', error);
    });
  }

  // Also write locally as a fallback
  const data = loadDatabase();
  const newLog = {
    id,
    userEmail: user_email,
    action,
    target,
    timestamp
  };
  data.logs = [newLog, ...(data.logs || [])].slice(0, 100);
  saveDatabase(data);
}

// Global generic save endpoint to support all dashboard operations
app.post('/api/save-database', saveLimiter, authenticateToken, (req, res) => {
  const { updatedData, userEmail, action, target } = req.body;
  if (!updatedData) {
    return res.status(400).json({ error: 'Missing updatedData' });
  }
  
  // Preserve existing usernames' passwords since passwords are stripped in GET /api/data response
  const db = loadDatabase();
  if (updatedData.users && Array.isArray(updatedData.users)) {
    updatedData.users = updatedData.users.map((updatedUser: any) => {
      const existingUser = db.users?.find((u: any) => u.email.trim().toLowerCase() === updatedUser.email.trim().toLowerCase());
      
      let finalPassword = existingUser ? existingUser.password : bcrypt.hashSync('CML', 10);
      if (updatedUser.password && !updatedUser.password.startsWith('$2')) {
        finalPassword = bcrypt.hashSync(updatedUser.password, 10);
      } else if (updatedUser.password && updatedUser.password.startsWith('$2')) {
        finalPassword = updatedUser.password;
      }
      
      return {
        ...updatedUser,
        password: finalPassword
      };
    });
  } else if (!updatedData.users && db.users) {
    // Keep users from the db if not present in the payload
    updatedData.users = db.users;
  }

  // Preserve and hash shakha passwords
  if (updatedData.units && Array.isArray(updatedData.units)) {
    updatedData.units = updatedData.units.map((updatedUnit: any) => {
      const existingUnit = db.units?.find((u: any) => u.id === updatedUnit.id);
      
      let finalPassword = existingUnit ? existingUnit.password : undefined;
      if (updatedUnit.password && !updatedUnit.password.startsWith('$2')) {
        finalPassword = bcrypt.hashSync(updatedUnit.password, 10);
      } else if (updatedUnit.password && updatedUnit.password.startsWith('$2')) {
        finalPassword = updatedUnit.password;
      }
      
      return {
        ...updatedUnit,
        password: finalPassword
      };
    });
  } else if (!updatedData.units && db.units) {
    updatedData.units = db.units;
  }

  saveDatabase(updatedData);
  if (action && target) {
    appendLog(userEmail, action, target);
  }
  res.json({ success: true, message: 'Database persistent save success' });
});

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseParticipantsFromText(text: string, competition: string = 'Kalolsavam') {
  const knownUnits = [
    'Kaliyar', 'Kadavoor', 'Kodikulam', 'Koduvely', 'Mullaringad', 'Mundanmudy',
    'Njarakkad', 'Paingottoor', 'Punnamattam', 'Rajagiri', 'Thennathoor',
    'Thommankuthu', 'Vannappuram'
  ];

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  const participants: any[] = [];
  let currentEvent = '';

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (/ - KALIYAR REGION$/i.test(line) || /^(BIBLE READING|MISSION QUIZ|SOLO|SPEECH|DEBATE)/i.test(line)) {
      currentEvent = line;
      continue;
    }

    if (/^#\s*Name/i.test(line)) {
      continue;
    }

    const rowMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (!rowMatch) {
      continue;
    }

    const entryLines = [rowMatch[2]];
    let nextIndex = index + 1;
    while (
      nextIndex < lines.length &&
      !/^(\d+)\./.test(lines[nextIndex]) &&
      !/ - KALIYAR REGION$/i.test(lines[nextIndex]) &&
      !/^#\s*Name/i.test(lines[nextIndex])
    ) {
      entryLines.push(lines[nextIndex]);
      nextIndex += 1;
    }
    index = nextIndex - 1;

    const detailLine = entryLines[entryLines.length - 1];
    const cmlIdMatch = detailLine.match(/\bKYR\d+\b/i);
    const dobMatch = detailLine.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (!cmlIdMatch || !dobMatch) {
      continue;
    }

    const cmlId = cmlIdMatch[0].toUpperCase();
    const dob = dobMatch[0];
    const unitMatch = knownUnits.find((unit) => new RegExp('\\b' + escapeRegex(unit) + '\\b', 'i').test(detailLine));
    const unit = unitMatch || '';

    const prefixLines = entryLines.slice(0, -1);
    let nameLines = prefixLines;
    let houseLines: string[] = [];
    const commaLineIndex = prefixLines.findIndex((l) => /,\s*$/.test(l));

    if (commaLineIndex >= 0) {
      nameLines = prefixLines.slice(0, commaLineIndex + 1);
      houseLines = prefixLines.slice(commaLineIndex + 1);
    } else if (prefixLines.length > 1) {
      nameLines = [prefixLines[0]];
      houseLines = prefixLines.slice(1);
    }

    let competitorName = nameLines.join(' ').replace(/\s+/g, ' ').replace(/,\s*$/g, '').trim();
    let houseName = houseLines.join(' ').replace(/\s+/g, ' ').trim();

    if (!houseName) {
      houseName = detailLine
        .replace(cmlId, '')
        .replace(dob, '')
        .replace(unit, '')
        .replace(/\b\d+\b/g, '')
        .trim();
    }

    let section = '';
    const sectionMatch = currentEvent.match(/\b(SUB JUNIOR|SUPER SENIOR|JUNIOR|SENIOR)\b\s*(BOYS|GIRLS)?/i);
    if (sectionMatch) {
      section = sectionMatch[0].trim();
    } else {
      section = 'Group Items';
    }

    // Direct User Intent: For group items, only register the name of the shakha / unit
    if (section === 'Group Items' || /GROUP|CHORUS|DRAMA|SKIT|DUET/i.test(currentEvent)) {
      competitorName = unit ? `${unit} Unit` : 'Group Shakha';
    }

    participants.push({
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      competition,
      eventName: currentEvent,
      section,
      competitorName,
      houseName,
      dob,
      cmlId,
      shakhaId: cmlId.substring(0, 5)
    });
  }

  return participants;
}

// PDF Parsing Endpoint
app.post('/api/parse-pdf', authenticateToken, upload.single('file'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
  }
  try {
    const pdf = new PDFParse(new Uint8Array(req.file.buffer));
    const data = await pdf.getText();
    const text = typeof data === 'string' ? data : (data && data.text) || '';

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'PDF file is empty or contains no readable text' });
    }
    
    const competition = req.query.competition || 'Kalolsavam';
    const participants = parseParticipantsFromText(text, competition);

    if (participants.length === 0) {
      return res.status(400).json({ success: false, error: 'No participants found in PDF. Please ensure the PDF has the correct format.' });
    }

    const db = loadDatabase();
    let newCount = 0;
    for (const p of participants) {
       // Avoid duplicates based on cmlId, eventName, and competition
       const existing = db.registrations.find((r: any) => r.cmlId === p.cmlId && r.eventName === p.eventName && r.competition === p.competition);
       if (!existing) {
           db.registrations.push(p);
           newCount++;
       }
    }
    saveDatabase(db);

    res.json({ success: true, participants: participants, count: newCount, totalExtracted: participants.length });
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ success: false, error: 'Failed to parse PDF: ' + (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Ensure assets are served under /src/assets in prod for hardcoded DB paths
    app.use('/src/assets', express.static(path.join(process.cwd(), 'src/assets')));
    
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CML Portal Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
