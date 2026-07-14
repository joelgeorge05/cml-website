/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OfficeBearer {
  id: string;
  name: string;
  designation: string;
  photoUrl: string;
  contact: string;
  email: string;
  servicePeriod: string;
  orderIndex: number;
  houseName?: string;
  unit?: string;
}

export interface ParishUnit {
  id: string;
  name: string;
  patronSaint: string;
  contactNumber: string;
  bgPhoto: string;
  stats: {
    members: number;
    families: number;
    directorsCount: number;
  };
  description: string;
  orderIndex: number;
  directorName?: string;
  directorPhone?: string;
  jointDirectorName?: string;
  jointDirectorPhone?: string;
  presidentName?: string;
  presidentPhone?: string;
}

export interface CMLEvent {
  id: string;
  title: string;
  type: 'upcoming' | 'past';
  date: string;
  time: string;
  venue: string;
  description: string;
  imageUrl?: string;
  summary?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImageUrl: string;
}

export interface GalleryImage {
  id: string;
  albumId: string;
  title: string;
  imageUrl: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  text: string;
  type: 'urgent' | 'regular';
  date: string;
  isSticky: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  category: string;
  imageUrl?: string;
  date: string;
  isFeatured: boolean;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: 'circular' | 'form' | 'report';
  fileSize: string;
  downloadUrl: string;
  uploadDate: string;
  description?: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  blood_group: string;
  phone: string;
  parish: string;
  last_donated_date: string | null;
  is_available: boolean;
  house_name?: string;
  alt_phone?: string;
  permanent_address?: string;
  dob?: string;
  employment_status?: string;
  employment_address?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  captionTitle: string; // Dynamic Title tag
  captionSub?: string;  // Dynamic Subtitle tag
  captionVenue?: string; // Dynamic Venue/Location tag
  isActive: boolean;
}

export interface PortalSettings {
  id?: string;
  supportDesk: string;
  email: string;
  mottoPrimary: string;
  mottoSecondary: string;
  heroIntro: string;
  parishUnitsCount: number;
  showKalolsavam?: boolean;
  showSahithyamalsaram?: boolean;
  showChosen?: boolean;
  showOverallLeaderboard?: boolean;
  heroSlides?: HeroSlide[];
  heroInterval?: number; // In seconds, e.g. 5
}

export interface UserRole {
  email: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor' | 'Blood Donor Admin';
  lastActive?: string;
  password?: string;
}

export interface ParticipantResult {
  id: string;
  competitorName: string;
  unitId: string;
  unitName: string;
  competition: 'Kalolsavam' | 'Sahithyamalsaram';
  eventName: string;
  grade: 'A' | 'B' | 'C' | 'None';
  position: '1st' | '2nd' | '3rd' | 'None';
  totalPoints: number;
  isPublished: boolean;
  createdAt: string;
}

export interface ChosenRegistration {
  id: string;
  participantName: string;
  fatherName: string;
  position: string;
  shakha: string;
  contactNumber: string;
  parentsContactNumber: string;
  createdAt: string;
  className?: string;
  gender?: string;
  houseName?: string;
}

export const getShakhaNameByCode = (code: string, dbUnits?: any[]): string => {
  if (!code) return '';
  const clean = code.toUpperCase().trim();
  const mappings: Record<string, string> = {
    'KYR01': 'Kaliyar',
    'KYR02': 'Kadavoor',
    'KYR03': 'Kodikulam',
    'KYR04': 'Koduvely',
    'KYR05': 'Mullaringad',
    'KYR06': 'Mundanmudy',
    'KYR07': 'Njarakkad',
    'KYR08': 'Paingottoor',
    'KYR09': 'Punnamattam',
    'KYR10': 'Rajagiri',
    'KYR11': 'Thennathoor',
    'KYR12': 'Thommankuthu',
    'KYR13': 'Vannappuram'
  };
  if (mappings[clean]) {
    return mappings[clean];
  }
  // Fallback if we match a full name
  const matchedKey = Object.keys(mappings).find(key => 
    clean.includes(key) || mappings[key].toLowerCase().includes(clean.toLowerCase())
  );
  if (matchedKey) {
    return mappings[matchedKey];
  }
  if (dbUnits) {
    const found = dbUnits.find(u => u.id === code || u.id === clean || u.name?.toLowerCase().includes(clean.toLowerCase()));
    if (found) {
      // Return short name if we can match it
      const matchedShort = Object.values(mappings).find(val => found.name?.toLowerCase().includes(val.toLowerCase()));
      if (matchedShort) return matchedShort;
      return found.name;
    }
  }
  return code;
};

