/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import ImageCropperModal from './ImageCropperModal';
import MarksGradeManager from './MarksGradeManager';
import ParticipantsManager from './ParticipantsManager';
import AdminBloodDonors from './AdminBloodDonors';
import {
  ShieldAlert,
  Settings,
  Users,
  MapPin,
  Calendar,
  Newspaper,
  Image,
  FileText,
  Activity,
  Plus,
  Trash,
  Edit,
  Save,
  CheckCircle,
  Database,
  Lock,
  Sparkles,
  Award,
  Trophy,
  TrendingUp,
  X,
  LogOut,
  Globe,
  Download,
  Upload,
  Eye,
  EyeOff,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  OfficeBearer,
  ParishUnit,
  CMLEvent,
  Announcement,
  NewsItem,
  GalleryAlbum,
  GalleryImage,
  DownloadItem,
  PortalSettings,
  ActivityLog,
  UserRole,
  ParticipantResult,
  HeroSlide
} from '../types';
import { extractTextFromPdf, parseParticipantsFromText } from '../lib/pdfParser';

interface AdminDashboardProps {
  dbData: {
    settings: PortalSettings;
    announcements: Announcement[];
    news: NewsItem[];
    officeBearers: OfficeBearer[];
    units: ParishUnit[];
    events: CMLEvent[];
    galleryAlbums: GalleryAlbum[];
    galleryImages: GalleryImage[];
    downloads: DownloadItem[];
    logs: ActivityLog[];
    results: ParticipantResult[];
    chosenRegistrations?: any[];
    registrations?: any[];
    users?: UserRole[];
  };
  currentUser: { email: string; name: string; role: 'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor' | 'Blood Donor Admin' | 'Shakha Admin' };
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
  onLogout: () => void;
  onGoToTab?: (tab: string) => void;
}

export default function AdminDashboard({ dbData, currentUser, onSaveDatabase, onLogout, onGoToTab }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'Kalolsavam Editor' ? 'kalolsavam-marks' : 
    currentUser.role === 'Blood Donor Admin' ? 'blood-donors' : 'overview'
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Image Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<'bearer' | 'unit' | null>(null);
  const [cropAspect, setCropAspect] = useState(1);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadToStorage = async (blob: Blob, folder: string) => {
    try {
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpeg`;
      const { data, error } = await supabase.storage.from('images').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      return publicUrl;
    } catch (e: any) {
      console.error('Upload failed:', e);
      triggerToast('Failed to upload image: ' + e.message);
      return null;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const target = e.target.getAttribute('data-target') as 'bearer' | 'unit';
      if (target) {
        setCropTarget(target);
        setCropAspect(target === 'bearer' ? 1 : 16/9);
      }
      setCropFile(e.target.files[0]);
      setIsCropperOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    setIsCropperOpen(false);
    triggerToast('Uploading image securely to Supabase Storage...');
    const url = await uploadToStorage(blob, cropTarget === 'bearer' ? 'bearers' : 'units');
    if (url) {
      if (cropTarget === 'bearer') {
        setBearerForm({ ...bearerForm, photoUrl: url });
      } else if (cropTarget === 'unit') {
        setUnitForm({ ...unitForm, bgPhoto: url });
      }
      triggerToast('Image uploaded successfully! Remember to Save.');
    }
    setCropFile(null);
    setCropTarget(null);
  };

  // States for CRUD / Form templates
  const [settingsForm, setSettingsForm] = useState<PortalSettings>(() => {
    const s = { ...dbData.settings };
    if (!s.heroSlides) {
      s.heroSlides = [];
    }
    if (s.heroInterval === undefined) {
      s.heroInterval = 5;
    }
    return s;
  });

  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (activeTab === 'logs') {
      setLoadingLogs(true);
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)
        .then(({ data, error }) => {
          if (!error && data) {
            setActivityLogs(data);
          }
          setLoadingLogs(false);
        });
    }
  }, [activeTab]);

  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState<Partial<HeroSlide>>({
    imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
    captionTitle: '',
    captionSub: '',
    captionVenue: '',
    isActive: true
  });

  // Office bearer crud
  const [editingBearerId, setEditingBearerId] = useState<string | null>(null);
  const [bearerForm, setBearerForm] = useState<Partial<OfficeBearer>>({
    name: '', designation: '', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', contact: '', email: '', servicePeriod: '2025 - Present', houseName: '', unit: '', orderIndex: 0
  });

  // Unit crud
  const unitsFormRef = React.useRef<HTMLDivElement>(null);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitForm, setUnitForm] = useState<Partial<ParishUnit>>({
    name: '', patronSaint: '', contactNumber: '', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 100, families: 50, directorsCount: 2 }, description: '', orderIndex: 0, directorName: '', directorPhone: '', presidentName: '', presidentPhone: ''
  });

  // Event crud
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<CMLEvent>>({
    title: '', type: 'upcoming', date: '2026-07-04', time: '10:00 AM', venue: '', description: '', imageUrl: '/src/assets/images/st_therese.png', summary: ''
  });

  // News crud
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    title: '', body: '', category: 'General', imageUrl: '/src/assets/images/st_therese.png', date: '2026-05-29', isFeatured: false
  });

  // Announcement crud
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<Partial<Announcement>>({
    text: '', type: 'regular', date: '2026-05-29', isSticky: false
  });

  // Gallery album crud
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState<Partial<GalleryAlbum>>({
    title: '', category: 'Activities', description: '', coverImageUrl: '/src/assets/images/st_therese.png'
  });

  // Gallery image crud
  const [imageForm, setImageForm] = useState<Partial<GalleryImage>>({
    albumId: dbData.galleryAlbums[0]?.id || '', title: '', imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600', createdAt: '2026-05-29'
  });

  // Download crud
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [downloadForm, setDownloadForm] = useState<Partial<DownloadItem>>({
    title: '', category: 'circular', fileSize: '1.2 MB', downloadUrl: '#', uploadDate: '2026-05-29', description: ''
  });

  // Results crud
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState<Partial<ParticipantResult>>({
    competitorName: '', unitId: '', unitName: '', competition: 'Kalolsavam', eventName: '', grade: 'None', position: 'None', totalPoints: 0, isPublished: true
  });

  // Chosen delegation admin filter
  const [chosenGenderFilter, setChosenGenderFilter] = useState<'all' | 'boys' | 'girls'>('all');
  const [chosenShakhaFilter, setChosenShakhaFilter] = useState<string>('all');
  const [isChosenPdfGenerating, setIsChosenPdfGenerating] = useState(false);
  const [deletingChosenId, setDeletingChosenId] = useState<string | null>(null);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);

  // Summit manual delegate registration states
  const [isSummitAddOpen, setIsSummitAddOpen] = useState(false);
  const [summitForm, setSummitForm] = useState({
    participantName: '',
    className: 'Class 10',
    gender: 'Boy',
    houseName: '',
    fatherName: '',
    contactNumber: '',
    parentsContactNumber: '',
    position: 'Member',
    shakha: 'Vannappuram'
  });

  const handleAddSummitDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPermission()) return;
    if (!summitForm.participantName.trim()) {
      triggerToast('Please specify a Participant Name');
      return;
    }
    const newDelegate = {
      id: `chosen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      participantName: summitForm.participantName.trim().toUpperCase(),
      className: summitForm.className,
      gender: summitForm.gender,
      houseName: summitForm.houseName.trim().toUpperCase(),
      fatherName: summitForm.fatherName.trim().toUpperCase(),
      contactNumber: summitForm.contactNumber.trim(),
      parentsContactNumber: summitForm.parentsContactNumber.trim(),
      position: summitForm.position,
      shakha: summitForm.shakha,
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...dbData,
      chosenRegistrations: [newDelegate, ...(dbData.chosenRegistrations || [])]
    };
    const success = await saveState(updated, 'ADD_CHOSEN_REGISTRATION', newDelegate.participantName);
    if (success) {
      setIsSummitAddOpen(false);
      setSummitForm({
        participantName: '',
        className: 'Class 10',
        gender: 'Boy',
        houseName: '',
        fatherName: '',
        contactNumber: '',
        parentsContactNumber: '',
        position: 'Member',
        shakha: 'Vannappuram'
      });
    }
  };

  const handleDownloadAllChosenPDF = async () => {
    const list = dbData.chosenRegistrations || [];
    if (list.length === 0) {
      triggerToast('No chosen registrations found to download.');
      return;
    }

    setIsChosenPdfGenerating(true);
    try {
      // Preload image if possible, otherwise fallback
      let imgElement: HTMLImageElement | null = null;
      try {
        const preloadedImg = new window.Image();
        preloadedImg.src = '/src/assets/images/st_therese.png';
        await new Promise((resolve, reject) => {
          preloadedImg.onload = resolve;
          preloadedImg.onerror = reject;
        });
        imgElement = preloadedImg;
      } catch (e) {
        console.warn("Logo preloading failed", e);
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // We'll calculate total pages
      const itemsPerPage = 22;
      const totalPages = Math.ceil(list.length / itemsPerPage) || 1;

      const drawHeaderAndFooter = (pageDoc: typeof doc, pageNum: number, totalPagesCount: number) => {
        // Red Top Border Accent
        pageDoc.setFillColor(159, 18, 57); // rose-800
        pageDoc.rect(15, 10, 180, 1.5, 'F');

        // Draw Logo Image or fallback
        if (imgElement) {
          try {
            pageDoc.addImage(imgElement, 'JPEG', 15, 14, 18, 18);
          } catch (logoErr) {
            console.warn("Logo image drawing failed", logoErr);
          }
        } else {
          pageDoc.setFillColor(251, 113, 133); // cyan-400
          pageDoc.circle(24, 23, 9, 'F');
          pageDoc.setTextColor(255, 255, 255);
          pageDoc.setFont('helvetica', 'bold');
          pageDoc.setFontSize(8);
          pageDoc.text('CML', 24, 23.5, { align: 'center' });
        }

        // Title text
        pageDoc.setTextColor(15, 23, 42); // slate-900
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.setFontSize(11);
        pageDoc.text('CHERUPUSHPA MISSION LEAGUE KALIYAR MEKHALA', 36, 20);

        pageDoc.setFont('helvetica', 'bold');
        pageDoc.setTextColor(159, 18, 57); // rose-700
        pageDoc.setFontSize(8.5);
        pageDoc.text('Chosen Registration', 36, 26);

        // Beautiful divider line
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.setLineWidth(0.3);
        pageDoc.line(15, 36, 195, 36);

        // Header info box
        pageDoc.setFillColor(248, 250, 252); // slate-50
        pageDoc.roundedRect(15, 41, 180, 14, 2, 2, 'F');
        pageDoc.setDrawColor(241, 245, 249); // slate-100
        pageDoc.roundedRect(15, 41, 180, 14, 2, 2, 'D');

        pageDoc.setFontSize(7.5);
        pageDoc.setTextColor(148, 163, 184); // slate-400
        pageDoc.setFont('helvetica', 'normal');
        pageDoc.text('REGISTRY REPORT DESCENT', 19, 46);

        pageDoc.setFontSize(8.5);
        pageDoc.setTextColor(15, 23, 42); // slate-900
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.text('ALL ACTIVE SHAKHA UNION DELEGATES REGISTERED', 19, 51);

        pageDoc.setFontSize(7.5);
        pageDoc.setTextColor(148, 163, 184); // slate-400
        pageDoc.setFont('helvetica', 'normal');
        pageDoc.text('TOTAL DELEGATION ENROLMENT', 135, 46);

        pageDoc.setFontSize(9);
        pageDoc.setTextColor(159, 18, 57); // rose-700
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.text(`${list.length} ACTIVE REGISTRATIONS`, 135, 51);

        // Page info at bottom
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.setLineWidth(0.3);
        pageDoc.line(15, 275, 195, 275);

        pageDoc.setFont('helvetica', 'normal');
        pageDoc.setFontSize(7.5);
        pageDoc.setTextColor(148, 163, 184); // slate-400
        const dateStr = new Date().toLocaleDateString('en-GB');
        pageDoc.text(`Generated on ${dateStr} • CML Kaliyar Mekhala Official Records`, 15, 281);
        pageDoc.text(`Page ${pageNum} of ${totalPagesCount}`, 195, 281, { align: 'right' });
      };

      const drawTableHeaders = (pageDoc: typeof doc, startY: number) => {
        pageDoc.setFillColor(241, 245, 249); // slate-100
        pageDoc.rect(15, startY, 180, 8, 'F');
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.line(15, startY, 195, startY);
        pageDoc.line(15, startY + 8, 195, startY + 8);

        pageDoc.setFontSize(7.5);
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.setTextColor(71, 85, 105); // slate-600

        pageDoc.text('S.NO', 17, startY + 5.5);
        pageDoc.text('DELEGATE NAME', 28, startY + 5.5);
        pageDoc.text('SHAKHA/PARISH', 72, startY + 5.5);
        pageDoc.text('GENDER', 110, startY + 5.5);
        pageDoc.text('CLASS & ROLE', 125, startY + 5.5);
        pageDoc.text('HOUSE NAME', 152, startY + 5.5);
        pageDoc.text('CONTACT NO.', 175, startY + 5.5);
      };

      // Sort list alphabetically by parish/shakha and participant name
      const sortedList = [...list].sort((a: any, b: any) => {
        const bComp = (a.shakha || '').localeCompare(b.shakha || '');
        if (bComp !== 0) return bComp;
        return (a.participantName || '').localeCompare(b.participantName || '');
      });

      for (let pNum = 1; pNum <= totalPages; pNum++) {
        if (pNum > 1) {
          doc.addPage();
        }

        drawHeaderAndFooter(doc, pNum, totalPages);

        let y = 59;
        drawTableHeaders(doc, y);
        y += 8;

        const startIndex = (pNum - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, sortedList.length);
        const pageItems = sortedList.slice(startIndex, endIndex);

        pageItems.forEach((p: any, index: number) => {
          const globalIdx = startIndex + index;
          if (globalIdx % 2 === 1) {
            doc.setFillColor(248, 250, 252); // slate-50
            doc.rect(15, y, 180, 8, 'F');
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85); // slate-700

          // S.No
          doc.text(String(globalIdx + 1), 17, y + 5.5);

          // Delegate Name
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text((p.participantName || '').substring(0, 22).toUpperCase(), 28, y + 5.5);

          // Shakha
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(159, 18, 57); // rose-700
          doc.text((p.shakha || '').substring(0, 18).toUpperCase(), 72, y + 5.5);

          // Gender
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text((p.gender || '').toUpperCase(), 110, y + 5.5);

          // Class/Position
          const roleText = `${p.className || ''} (${p.position || 'Member'})`;
          doc.text(roleText.substring(0, 16), 125, y + 5.5);

          // House Name
          doc.text((p.houseName || '').substring(0, 12).toUpperCase(), 152, y + 5.5);

          // Contact No
          doc.text((p.contactNumber || p.parentsContactNumber || '-').substring(0, 11), 175, y + 5.5);

          y += 8;
        });
      }

      doc.save(`Chosen_Summit_2026_Participants_All.pdf`);
      triggerToast('✓ Successfully exported all Chosen delegates to PDF!');
    } catch (err: any) {
      console.error(err);
      triggerToast(`✗ Failed to generate PDF: ${err.message || err}`);
    } finally {
      setIsChosenPdfGenerating(false);
    }
  };

  // Dynamic admin accounts management state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    role: 'Admin' as 'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor' | 'Blood Donor Admin' | 'Shakha Admin',
    password: ''
  });

  const [editingAdminEmail, setEditingAdminEmail] = useState<string | null>(null);
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editAdminRole, setEditAdminRole] = useState<'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor' | 'Blood Donor Admin' | 'Shakha Admin'>('Admin');
  const [editAdminName, setEditAdminName] = useState('');

  const handleUpdateAdminUser = async (email: string) => {
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') {
      triggerToast('Permission Denied: Only Super Admins or Admins can modify accounts!');
      return;
    }

    if (!editAdminName.trim()) {
      triggerToast('Name cannot be empty.');
      return;
    }

    const updatedUsers = (dbData.users || []).map((u: any) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const updatedUser: any = {
          ...u,
          name: editAdminName.trim(),
          role: editAdminRole
        };
        // Only override if a new password is set
        if (editAdminPassword.trim()) {
          updatedUser.password = editAdminPassword.trim();
        }
        return updatedUser;
      }
      return u;
    });

    const updated = {
      ...dbData,
      users: updatedUsers
    };

    const success = await saveState(updated, 'UPDATE_ADMIN_ACCOUNT', `${email} (New Role: ${editAdminRole}, Pass updated: ${!!editAdminPassword.trim()})`);
    if (success) {
      setEditingAdminEmail(null);
      setEditAdminPassword('');
      setEditAdminRole('Admin');
      setEditAdminName('');
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') {
      triggerToast('Permission Denied: Only Super Admins or Admins can create administrative accounts!');
      return;
    }
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      triggerToast('Please fill out all fields (Name, Email, Role, and Password) to proceed.');
      return;
    }

    const emailClean = adminForm.email.trim().toLowerCase();
    
    // Check if user already exists
    const existsDynamic = (dbData.users || []).some((u: any) => u.email.toLowerCase() === emailClean);
    const systemEmails = ['joelveliyath05@gmail.com', 'admin@cmlkaliyar.org'];
    const existsSystem = systemEmails.includes(emailClean);

    if (existsDynamic || existsSystem) {
      triggerToast('Error: This admin username/email is already in use!');
      return;
    }

    try {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { error: signUpError } = await tempClient.auth.signUp({
        email: emailClean,
        password: adminForm.password.trim(),
        options: {
          data: {
            name: adminForm.name.trim(),
            role: adminForm.role
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('rate limit')) {
          triggerToast(`Notice: Supabase email rate limit hit, but provisioning local access anyway.`);
        } else {
          triggerToast(`Supabase Auth Error: ${signUpError.message}. Proceeding locally.`);
        }
        // Do NOT return here. Continue to provision the user locally to bypass limitations.
      }
    } catch (err) {
      triggerToast('Network Error: Could not reach authentication server.');
      return;
    }

    const newAdmin = {
      name: adminForm.name.trim(),
      email: emailClean,
      role: adminForm.role,
      password: adminForm.password.trim()
    };

    const updated = {
      ...dbData,
      users: [...(dbData.users || []), newAdmin]
    };

    const success = await saveState(updated, 'CREATE_ADMIN_ACCOUNT', `${newAdmin.email} as ${newAdmin.role}`);
    if (success) {
      setAdminForm({
        name: '',
        email: '',
        role: 'Admin',
        password: ''
      });
    }
  };

  const handleDeleteAdminUser = async (emailToDelete: string) => {
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') {
      triggerToast('Permission Denied: Only Super Admins or Admins can remove accounts!');
      return;
    }
    
    if (emailToDelete.toLowerCase() === currentUser.email.toLowerCase()) {
      triggerToast('Security Error: You cannot delete your own currently logged-in account!');
      return;
    }

    if (!confirm(`Are you absolutely sure you want to revoke administrative access for ${emailToDelete}?`)) {
      return;
    }

    const updated = {
      ...dbData,
      users: (dbData.users || []).filter((u: any) => u.email.toLowerCase() !== emailToDelete.toLowerCase())
    };

    await saveState(updated, 'REVOKE_ADMIN_ACCOUNT', emailToDelete);
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const isEditorOnly = currentUser.role === 'Editor';

  const verifyPermission = () => {
    if (currentUser.role === 'Kalolsavam Editor' && activeTab !== 'kalolsavam-marks' && activeTab !== 'sahithyamalsaram-marks' && activeTab !== 'participants') {
      triggerToast('Permission Denied: Editor can only modify Kalolsavam/Sahithyamalsaram marks and Participants!');
      return false;
    }
    if (isEditorOnly && activeTab === 'settings') {
      triggerToast('Permission Denied: Editors cannot modify master portal settings!');
      return false;
    }
    return true;
  };
  
  // Overall points of all 13 official Shakhas (alphabetical tracking)
  const unitPointsList = React.useMemo(() => {
    const resultsList = dbData?.results || [];

    const officialShakhas = [
      { id: 'KYR01', name: 'Kaliyar' },
      { id: 'KYR02', name: 'Kadavoor' },
      { id: 'KYR03', name: 'Kodikulam' },
      { id: 'KYR04', name: 'Koduvely' },
      { id: 'KYR05', name: 'Mullaringad' },
      { id: 'KYR06', name: 'Mundanmudy' },
      { id: 'KYR07', name: 'Njarakkad' },
      { id: 'KYR08', name: 'Paingottoor' },
      { id: 'KYR09', name: 'Punnamattam' },
      { id: 'KYR10', name: 'Rajagiri' },
      { id: 'KYR11', name: 'Thennathoor' },
      { id: 'KYR12', name: 'Thommankuthu' },
      { id: 'KYR13', name: 'Vannappuram' }
    ];

    const getShakhaId = (unitId: string, unitName: string): string | null => {
      const uId = (unitId || '').toUpperCase().trim();
      const uName = (unitName || '').toLowerCase();

      // Check direct shakha ID match
      if (uId.startsWith('KYR')) {
        const numPart = uId.replace('KYR', '');
        const formattedId = 'KYR' + numPart.padStart(2, '0');
        const found = officialShakhas.find(s => s.id === formattedId);
        if (found) return found.id;
      }

      // Check database unit ID match
      if (uId === 'UNIT-1') return 'KYR01'; // Kaliyar
      if (uId === 'UNIT-2') return 'KYR13'; // Vannappuram
      if (uId === 'UNIT-3') return 'KYR03'; // Kodikulam
      if (uId === 'UNIT-5') return 'KYR12'; // Thommankuthu

      // Check name substring match
      for (const shakha of officialShakhas) {
        if (uName.includes(shakha.name.toLowerCase())) {
          return shakha.id;
        }
      }

      return null;
    };

    const list = officialShakhas.map((shakha) => {
      // Filter results that belong to this shakha
      const shakhaResults = resultsList.filter((r: any) => {
        if (!r.isPublished) return false;
        const matchedId = getShakhaId(r.unitId || '', r.unitName || '');
        return matchedId === shakha.id;
      });

      // Kalolsavam results for this shakha
      const kalolsavamResults = shakhaResults.filter((r: any) => r.competition === 'Kalolsavam');
      const kalolsavamPoints = kalolsavamResults.reduce((sum: number, r: any) => sum + (r.totalPoints || 0), 0);
      const kalolsavamAGradesCount = kalolsavamResults.filter((r: any) => r.grade === 'A').length;
      const kalolsavamParticipantsCount = kalolsavamResults.length;

      // Sahithyamalsaram results for this shakha
      const sahithyamResults = shakhaResults.filter((r: any) => r.competition === 'Sahithyamalsaram');
      const sahithyamPoints = sahithyamResults.reduce((sum: number, r: any) => sum + (r.totalPoints || 0), 0);
      const sahithyamAGradesCount = sahithyamResults.filter((r: any) => r.grade === 'A').length;
      const sahithyamParticipantsCount = sahithyamResults.length;

      return {
        unitId: shakha.id,
        unitName: shakha.name,
        kalolsavamPoints,
        kalolsavamAGradesCount,
        kalolsavamParticipantsCount,
        sahithyamPoints,
        sahithyamAGradesCount,
        sahithyamParticipantsCount
      };
    });

    return [...list].sort((a, b) => {
      const totalA = a.kalolsavamPoints + a.sahithyamPoints;
      const totalB = b.kalolsavamPoints + b.sahithyamPoints;
      if (totalB !== totalA) {
        return totalB - totalA;
      }
      return a.unitName.localeCompare(b.unitName);
    });
  }, [dbData?.results]);

  // Helper endpoint poster
  const saveState = async (updated: typeof dbData, action: string, target: string) => {
    const success = await onSaveDatabase(updated, action, target);
    if (success) {
      triggerToast(`Successfully persisted database change: ${action}!`);
    } else {
      triggerToast('Server Connection Timeout: Failed to persist to file db.');
    }
    return success;
  };

  // Slide CRUD Handlers
  const handleSaveSlide = () => {
    if (!verifyPermission()) return;
    if (!slideForm.imageUrl || !slideForm.captionTitle) {
      triggerToast('Please provide slide image URL and primary tag title!');
      return;
    }

    const currentSlides = [...(settingsForm.heroSlides || [])];
    if (editingSlideId) {
      // update existing
      const updatedSlides = currentSlides.map(s => s.id === editingSlideId ? {
        ...(slideForm as HeroSlide),
        id: editingSlideId
      } : s);
      setSettingsForm({ ...settingsForm, heroSlides: updatedSlides });
      triggerToast('Updated slide in working form buffer! Click "Save General Configs" to persist to database.');
    } else {
      // add new
      const newSlide: HeroSlide = {
        id: 'slide-' + Date.now(),
        imageUrl: slideForm.imageUrl || '',
        captionTitle: slideForm.captionTitle || '',
        captionSub: slideForm.captionSub || '',
        captionVenue: slideForm.captionVenue || '',
        isActive: slideForm.isActive !== false
      };
      setSettingsForm({ ...settingsForm, heroSlides: [...currentSlides, newSlide] });
      triggerToast('Added new slide to working form buffer! Click "Save General Configs" to persist to database.');
    }

    // Reset slide form
    setEditingSlideId(null);
    setSlideForm({
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
      captionTitle: '',
      captionSub: '',
      captionVenue: '',
      isActive: true
    });
  };

  const handleDeleteSlide = (id: string) => {
    if (!verifyPermission()) return;
    const currentSlides = [...(settingsForm.heroSlides || [])];
    const filtered = currentSlides.filter(s => s.id !== id);
    setSettingsForm({ ...settingsForm, heroSlides: filtered });
    triggerToast('Removed slide form buffer! Click "Save General Configs" to persist of database.');
    if (editingSlideId === id) {
      setEditingSlideId(null);
    }
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideForm({
      imageUrl: slide.imageUrl,
      captionTitle: slide.captionTitle,
      captionSub: slide.captionSub || '',
      captionVenue: slide.captionVenue || '',
      isActive: slide.isActive
    });
  };

  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const slides = [...(settingsForm.heroSlides || [])];
    if (direction === 'up' && idx > 0) {
      const temp = slides[idx];
      slides[idx] = slides[idx - 1];
      slides[idx - 1] = temp;
    } else if (direction === 'down' && idx < slides.length - 1) {
      const temp = slides[idx];
      slides[idx] = slides[idx + 1];
      slides[idx + 1] = temp;
    }
    setSettingsForm({ ...settingsForm, heroSlides: slides });
  };

  // 1. Settings Save
  const handleSaveSettings = async () => {
    if (!verifyPermission()) return;
    
    try {
      // First update Supabase DB
      const targetId = settingsForm.id || dbData.settings?.id || '8333e21d-084a-47e8-a316-9cf17220e79f';
      if (targetId) {
        const { error, data } = await supabase.from('settings').update({
          support_desk: settingsForm.supportDesk,
          email: settingsForm.email,
          motto_primary: settingsForm.mottoPrimary,
          motto_secondary: settingsForm.mottoSecondary,
          hero_intro: settingsForm.heroIntro,
          parish_units_count: settingsForm.parishUnitsCount,
          // Using standard naming convention based on how we map it in App.tsx
          show_kalolsavam: settingsForm.showKalolsavam !== false,
          show_sahithyamalsaram: settingsForm.showSahithyamalsaram !== false,
          show_chosen: settingsForm.showChosen !== false,
          hero_slides: settingsForm.heroSlides,
          hero_interval: settingsForm.heroInterval
        }).eq('id', targetId).select();
        
        if (error) {
          throw new Error(error.message || 'Database update failed');
        }
        if (!data || data.length === 0) {
          throw new Error('Supabase RLS Policy blocked the update. Check backend policies.');
        }
      }
      
      // Then update local state
      const updated = { ...dbData, settings: settingsForm };
      saveState(updated, 'UPDATE_SETTINGS', 'Portal Configurations');
    } catch (e: any) {
      console.error(e);
      triggerToast('Database Error: ' + e.message);
    }
  };

  // 2. Bearers CRUD
  const handleSaveBearer = async () => {
    if (!verifyPermission()) return;
    if (!bearerForm.name || !bearerForm.designation) {
      triggerToast('Please complete bearer name and designation!');
      return;
    }

    let updatedBearers = [...dbData.officeBearers];
    let action = '';
    let target = '';

    const newPhotoUrl = bearerForm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    let bToSave: OfficeBearer;

    if (editingBearerId) {
      updatedBearers = updatedBearers.map(b => b.id === editingBearerId ? { ...b, ...bearerForm, photoUrl: newPhotoUrl } as OfficeBearer : b);
      action = 'EDIT_BEARER';
      target = bearerForm.name!;
      bToSave = updatedBearers.find(b => b.id === editingBearerId)!;
    } else {
      const newBearer: OfficeBearer = {
        id: `ob-${Date.now()}`,
        name: bearerForm.name!,
        designation: bearerForm.designation!,
        photoUrl: newPhotoUrl,
        contact: bearerForm.contact || '',
        email: bearerForm.email || '',
        servicePeriod: bearerForm.servicePeriod || '2025 - Present',
        houseName: bearerForm.houseName || '',
        unit: bearerForm.unit || '',
        orderIndex: updatedBearers.length
      };
      updatedBearers.push(newBearer);
      action = 'ADD_BEARER';
      target = newBearer.name;
      bToSave = newBearer;
    }

    try {
      await supabase.from('office_bearers').upsert({
        id: bToSave.id,
        name: bToSave.name,
        designation: bToSave.designation,
        photo_url: bToSave.photoUrl,
        contact: bToSave.contact,
        email: bToSave.email,
        service_period: bToSave.servicePeriod,
        house_name: bToSave.houseName,
        unit: bToSave.unit,
        order_index: bToSave.orderIndex
      });
    } catch (e: any) {
      console.error(e);
      triggerToast('Database Error: ' + e.message);
      return;
    }

    const updated = { ...dbData, officeBearers: updatedBearers };
    saveState(updated, action, target);
    setEditingBearerId(null);
    setBearerForm({ name: '', designation: '', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', contact: '', email: '', servicePeriod: '2025 - Present', houseName: '', unit: '', orderIndex: 0 });
  };

  const handleDeleteBearer = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      officeBearers: dbData.officeBearers.filter(b => b.id !== id)
    };
    saveState(updated, 'DELETE_BEARER', name);
  };

  // 3. Units CRUD
  const handleSaveUnit = async () => {
    if (!verifyPermission()) return;
    if (!unitForm.name || !unitForm.patronSaint) {
      triggerToast('Please enter parish church name and patron saint!');
      return;
    }

    let updatedUnits = [...dbData.units];
    let action = '';
    let target = '';

    const newBgPhoto = unitForm.bgPhoto || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400';
    let uToSave: ParishUnit;

    if (editingUnitId) {
      updatedUnits = updatedUnits.map(u => u.id === editingUnitId ? { ...u, ...unitForm, bgPhoto: newBgPhoto } as ParishUnit : u);
      action = 'EDIT_PARISH_UNIT';
      target = unitForm.name!;
      uToSave = updatedUnits.find(u => u.id === editingUnitId)!;
    } else {
      const newUnit: ParishUnit = {
        id: `unit-${Date.now()}`,
        name: unitForm.name!,
        patronSaint: unitForm.patronSaint!,
        contactNumber: unitForm.contactNumber || '',
        bgPhoto: newBgPhoto,
        stats: unitForm.stats || { members: 100, families: 40, directorsCount: 2 },
        description: unitForm.description || '',
        orderIndex: updatedUnits.length,
        directorName: unitForm.directorName || '',
        directorPhone: unitForm.directorPhone || '',
        jointDirectorName: unitForm.jointDirectorName || '',
        jointDirectorPhone: unitForm.jointDirectorPhone || '',
        presidentName: unitForm.presidentName || '',
        presidentPhone: unitForm.presidentPhone || ''
      };
      updatedUnits.push(newUnit);
      action = 'ADD_PARISH_UNIT';
      target = newUnit.name;
      uToSave = newUnit;
    }

    try {
      await supabase.from('units').upsert({
        id: uToSave.id,
        name: uToSave.name,
        patron_saint: uToSave.patronSaint,
        contact_number: uToSave.contactNumber,
        bg_photo: uToSave.bgPhoto,
        stats_members: uToSave.stats.members,
        stats_families: uToSave.stats.families,
        stats_directors_count: uToSave.stats.directorsCount,
        description: uToSave.description,
        order_index: uToSave.orderIndex,
        director_name: uToSave.directorName,
        director_phone: uToSave.directorPhone,
        joint_director_name: uToSave.jointDirectorName,
        joint_director_phone: uToSave.jointDirectorPhone,
        president_name: uToSave.presidentName,
        president_phone: uToSave.presidentPhone
      });
    } catch (e: any) {
      console.error(e);
      triggerToast('Database Error: ' + e.message);
      return;
    }

    const updated = { ...dbData, units: updatedUnits };
    saveState(updated, action, target);
    setEditingUnitId(null);
    setUnitForm({ name: '', patronSaint: '', contactNumber: '', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 100, families: 50, directorsCount: 2 }, description: '', orderIndex: 0, directorName: '', directorPhone: '', presidentName: '', presidentPhone: '' });
  };

  const handleDeleteUnit = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      units: dbData.units.filter(u => u.id !== id)
    };
    saveState(updated, 'DELETE_PARISH_UNIT', name);
  };

  // 4. Events CRUD
  const handleSaveEvent = () => {
    if (!verifyPermission()) return;
    if (!eventForm.title || !eventForm.venue) {
      triggerToast('Please complete event title and hosting venue!');
      return;
    }

    let updatedEvents = [...dbData.events];
    let action = '';
    let target = '';

    if (editingEventId) {
      updatedEvents = updatedEvents.map(e => e.id === editingEventId ? { ...e, ...eventForm } as CMLEvent : e);
      action = 'EDIT_EVENT';
      target = eventForm.title;
    } else {
      const newEvent: CMLEvent = {
        id: `ev-${Date.now()}`,
        title: eventForm.title!,
        type: eventForm.type as any || 'upcoming',
        date: eventForm.date || '2026-07-04',
        time: eventForm.time || '10:00 AM',
        venue: eventForm.venue!,
        description: eventForm.description || '',
        imageUrl: eventForm.imageUrl || '/src/assets/images/st_therese.png',
        summary: eventForm.summary || ''
      };
      updatedEvents.push(newEvent);
      action = 'ADD_EVENT';
      target = newEvent.title;
    }

    const updated = { ...dbData, events: updatedEvents };
    saveState(updated, action, target);
    setEditingEventId(null);
    setEventForm({ title: '', type: 'upcoming', date: '2026-07-04', time: '10:00 AM', venue: '', description: '', imageUrl: '/src/assets/images/st_therese.png', summary: '' });
  };

  const handleDeleteEvent = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      events: dbData.events.filter(e => e.id !== id)
    };
    saveState(updated, 'DELETE_EVENT', name);
  };

  // 5. News CRUD
  const handleSaveNews = () => {
    if (!verifyPermission()) return;
    if (!newsForm.title || !newsForm.body) {
      triggerToast('Please complete story title and article content body!');
      return;
    }

    let updatedNews = [...dbData.news];
    let action = '';
    let target = '';

    if (editingNewsId) {
      updatedNews = updatedNews.map(n => n.id === editingNewsId ? { ...n, ...newsForm } as NewsItem : n);
      action = 'EDIT_NEWS';
      target = newsForm.title;
    } else {
      const newNews: NewsItem = {
        id: `news-${Date.now()}`,
        title: newsForm.title!,
        body: newsForm.body!,
        category: newsForm.category || 'General',
        imageUrl: newsForm.imageUrl || '/src/assets/images/st_therese.png',
        date: newsForm.date || '2026-05-29',
        isFeatured: newsForm.isFeatured || false
      };
      // For toggle unselect other features
      if (newNews.isFeatured) {
        updatedNews = updatedNews.map(n => ({ ...n, isFeatured: false }));
      }
      updatedNews.push(newNews);
      action = 'ADD_NEWS_POST';
      target = newNews.title;
    }

    const updated = { ...dbData, news: updatedNews };
    saveState(updated, action, target);
    setEditingNewsId(null);
    setNewsForm({ title: '', body: '', category: 'General', imageUrl: '/src/assets/images/st_therese.png', date: '2026-05-29', isFeatured: false });
  };

  const handleDeleteNews = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      news: dbData.news.filter(n => n.id !== id)
    };
    saveState(updated, 'DELETE_NEWS_POST', name);
  };

  // 6. Announcements CRUD
  const handleSaveAnn = () => {
    if (!verifyPermission()) return;
    if (!annForm.text) {
      triggerToast('Please type the announcement notification bulletin!');
      return;
    }

    let updatedAnn = [...dbData.announcements];
    let action = '';
    let target = '';

    if (editingAnnId) {
      updatedAnn = updatedAnn.map(a => a.id === editingAnnId ? { ...a, ...annForm } as Announcement : a);
      action = 'EDIT_ANNOUNCEMENT';
      target = annForm.text.substring(0, 30);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        text: annForm.text!,
        type: annForm.type as any || 'regular',
        date: annForm.date || '2026-05-29',
        isSticky: annForm.isSticky || false
      };
      updatedAnn.push(newAnn);
      action = 'ADD_ANNOUNCEMENT';
      target = newAnn.text.substring(0, 30);
    }

    const updated = { ...dbData, announcements: updatedAnn };
    saveState(updated, action, target);
    setEditingAnnId(null);
    setAnnForm({ text: '', type: 'regular', date: '2026-05-29', isSticky: false });
  };

  const handleDeleteAnn = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      announcements: dbData.announcements.filter(a => a.id !== id)
    };
    saveState(updated, 'DELETE_ANNOUNCEMENT', name.substring(0, 30));
  };

  // 7. Gallery CRUD
  const handleAddAlbum = () => {
    if (!verifyPermission()) return;
    if (!albumForm.title) {
      triggerToast('Please submit an album title!');
      return;
    }
    const newAlbum: GalleryAlbum = {
      id: `alb-${Date.now()}`,
      title: albumForm.title!,
      category: albumForm.category || 'Activities',
      description: albumForm.description || '',
      coverImageUrl: albumForm.coverImageUrl || '/src/assets/images/st_therese.png'
    };
    const updated = { ...dbData, galleryAlbums: [...dbData.galleryAlbums, newAlbum] };
    saveState(updated, 'CREATE_GALLERY_ALBUM', newAlbum.title);
    setAlbumForm({ title: '', category: 'Activities', description: '', coverImageUrl: '/src/assets/images/st_therese.png' });
  };

  const handleAddImage = () => {
    if (!verifyPermission()) return;
    if (!imageForm.title || !imageForm.albumId) {
      triggerToast('Please enter cover title and select target album category!');
      return;
    }
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      albumId: imageForm.albumId!,
      title: imageForm.title!,
      imageUrl: imageForm.imageUrl || 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600',
      createdAt: imageForm.createdAt || '2026-05-29'
    };
    const updated = { ...dbData, galleryImages: [...dbData.galleryImages, newImage] };
    saveState(updated, 'UPLOAD_GALLERY_PHOTO', newImage.title);
    setImageForm({ albumId: dbData.galleryAlbums[0]?.id || '', title: '', imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600', createdAt: '2026-05-29' });
  };

  // 8. Downloads CRUD
  const handleSaveDownload = () => {
    if (!verifyPermission()) return;
    if (!downloadForm.title) {
      triggerToast('Please enter download document title!');
      return;
    }

    let updatedDownloads = [...dbData.downloads];
    let action = '';
    let target = '';

    if (editingDownloadId) {
      updatedDownloads = updatedDownloads.map(d => d.id === editingDownloadId ? { ...d, ...downloadForm } as DownloadItem : d);
      action = 'EDIT_DOWNLOAD_ITEM';
      target = downloadForm.title;
    } else {
      const newDl: DownloadItem = {
        id: `dl-${Date.now()}`,
        title: downloadForm.title!,
        category: downloadForm.category as any || 'circular',
        fileSize: downloadForm.fileSize || '1.1 MB',
        downloadUrl: '#',
        uploadDate: downloadForm.uploadDate || '2026-05-29',
        description: downloadForm.description || ''
      };
      updatedDownloads.push(newDl);
      action = 'ADD_DOWNLOAD_RESOURCES';
      target = newDl.title;
    }

    const updated = { ...dbData, downloads: updatedDownloads };
    saveState(updated, action, target);
    setEditingDownloadId(null);
    setDownloadForm({ title: '', category: 'circular', fileSize: '1.2 MB', downloadUrl: '#', uploadDate: '2026-05-29', description: '' });
  };

  const handleDeleteDownload = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      downloads: dbData.downloads.filter(d => d.id !== id)
    };
    saveState(updated, 'DELETE_DOWNLOAD_RESOURCE', name);
  };

  // 9. Results CRUD
  const handleSaveResult = () => {
    if (!resultForm.competitorName || !resultForm.eventName || !resultForm.unitId) {
      triggerToast('Please complete competitor name, event and unit!');
      return;
    }

    let updatedResults = [...dbData.results];
    let action = '';
    let target = '';

    const selectedUnit = dbData.units.find(u => u.id === resultForm.unitId);
    const unitName = selectedUnit ? selectedUnit.name : '';

    if (editingResultId) {
      updatedResults = updatedResults.map(r => r.id === editingResultId ? { ...r, ...resultForm, unitName } as ParticipantResult : r);
      action = 'EDIT_RESULT';
      target = resultForm.competitorName!;
    } else {
      const newRes: ParticipantResult = {
        id: `res-${Date.now()}`,
        competitorName: resultForm.competitorName!,
        unitId: resultForm.unitId!,
        unitName: unitName,
        competition: resultForm.competition as any || 'Kalolsavam',
        eventName: resultForm.eventName!,
        grade: resultForm.grade as any || 'None',
        position: resultForm.position as any || 'None',
        totalPoints: resultForm.totalPoints || 0,
        isPublished: resultForm.isPublished ?? true,
        createdAt: new Date().toISOString()
      };
      updatedResults.push(newRes);
      action = 'ADD_RESULT';
      target = newRes.competitorName;
    }

    const updated = { ...dbData, results: updatedResults };
    saveState(updated, action, target);
    setEditingResultId(null);
    setResultForm({ competitorName: '', unitId: '', unitName: '', competition: 'Kalolsavam', eventName: '', grade: 'None', position: 'None', totalPoints: 0, isPublished: true });
  };

  const handleDeleteResult = (id: string, name: string) => {
    const updated = {
      ...dbData,
      results: dbData.results.filter(r => r.id !== id)
    };
    saveState(updated, 'DELETE_RESULT', name);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Database className="w-4 h-4" />, section: 'MAIN MENU' },
    { id: 'settings', label: 'Master Settings', icon: <Settings className="w-4 h-4" />, section: 'MAIN MENU' },
    { id: 'bearers', label: 'Office Bearers', icon: <Users className="w-4 h-4" />, section: 'ORGANIZATION' },
    { id: 'units', label: 'Parish Units', icon: <MapPin className="w-4 h-4" />, section: 'ORGANIZATION' },
    { id: 'chosen', label: 'Chosen Delegates', icon: <Sparkles className="w-4 h-4" />, section: 'ORGANIZATION' },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" />, section: 'CONTENT' },
    { id: 'news', label: 'News Posts', icon: <Newspaper className="w-4 h-4" />, section: 'CONTENT' },
    { id: 'announcements', label: 'Announcements', icon: <ShieldAlert className="w-4 h-4" />, section: 'CONTENT' },
    { id: 'gallery', label: 'Gallery Media', icon: <Image className="w-4 h-4" />, section: 'CONTENT' },
    { id: 'downloads', label: 'Downloads', icon: <FileText className="w-4 h-4" />, section: 'CONTENT' },
    { id: 'blood-donors', label: 'Blood Donors', icon: <Heart className="w-4 h-4" />, section: 'CONTENT' },
    { id: 'participants', label: 'Participants Registry', icon: <Users className="w-4 h-4" />, section: 'COMPETITIONS' },
    { id: 'kalolsavam-marks', label: 'Kalolsavam Marks', icon: <Award className="w-4 h-4" />, section: 'COMPETITIONS' },
    { id: 'sahithyamalsaram-marks', label: 'Sahithyamalsaram Marks', icon: <Award className="w-4 h-4" />, section: 'COMPETITIONS' },
    { id: 'admins', label: 'Admin Accounts', icon: <Lock className="w-4 h-4" />, section: 'SYSTEM' },
    { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-4 h-4" />, section: 'SYSTEM' }
  ].filter(item => {
    if (currentUser.role === 'Kalolsavam Editor') {
      return item.id === 'kalolsavam-marks' || item.id === 'sahithyamalsaram-marks' || item.id === 'participants';
    }
    if (currentUser.role === 'Blood Donor Admin') {
      return item.id === 'blood-donors' || item.id === 'logs';
    }
    if (item.id === 'admins') {
      return currentUser.role === 'Super Admin' || currentUser.role === 'Admin';
    }
    if (item.id === 'blood-donors') {
      return currentUser.role === 'Super Admin' || currentUser.role === 'Admin' || currentUser.role === 'Blood Donor Admin';
    }
    return true;
  });




// PDF Upload & Bulk Editing State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<ParticipantResult[]>([]);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setIsUploading(true);
    triggerToast('Analyzing PDF layout...');
    
    try {
      const text = await extractTextFromPdf(file);
      if (!text || text.trim().length === 0) {
        triggerToast('✗ PDF file is empty or contains no readable text.');
        setIsUploading(false);
        return;
      }

      const competitionType = activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram';
      const parsed = parseParticipantsFromText(text, competitionType);
      
      if (parsed.length > 0) {
        const newEntries = parsed.map((p: any) => ({
          id: p.id,
          competitorName: p.competitorName,
          unitId: '', // Requires manual mapping or matching
          unitName: 'Unknown Unit', // Will be updated if user selects unit manually
          competition: competitionType,
          eventName: p.eventName + ' ' + p.section,
          grade: 'None',
          position: 'None',
          totalPoints: 0,
          isPublished: true
        }));
        setBulkEntries(newEntries);
        triggerToast(`Extracted ${newEntries.length} participants from PDF!`);
      } else {
        triggerToast('✗ No valid entries found in PDF. Check formats.');
      }
    } catch (err: any) {
      console.error('PDF Upload Error:', err);
      triggerToast('✗ PDF Parse Error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const addManualEntry = () => {
    const competitionType = activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram';
    setBulkEntries([...bulkEntries, {
      id: 'manual_' + Date.now(),
      competitorName: '',
      unitId: '',
      unitName: '',
      competition: competitionType,
      eventName: '',
      grade: 'None',
      position: 'None',
      totalPoints: 0,
      isPublished: true
    }]);
  };

  const removeBulkEntry = (id: string) => {
    setBulkEntries(bulkEntries.filter(b => b.id !== id));
  };

  const updateBulkEntry = (id: string, field: string, value: any) => {
    setBulkEntries(bulkEntries.map(b => {
      if (b.id !== id) return b;
      const updated = { ...b, [field]: value };
      
      // Auto-assign unit name if unitId changes
      if (field === 'unitId') {
        const u = dbData.units.find(unit => unit.id === value);
        if (u) updated.unitName = u.name;
      }
      return updated as ParticipantResult;
    }));
  };

  const handleSaveBulkMarks = () => {
    if (!verifyPermission()) return;
    const competitionType = activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram';
    
    // Remove all existing records for this competition type IF the user wants, or we just append/overwrite
    // Let's just append or update existing
    let updatedResults = [...(dbData.results || [])];
    
    bulkEntries.forEach(entry => {
      const existingIdx = updatedResults.findIndex(r => r.id === entry.id || (r.competitorName === entry.competitorName && r.eventName === entry.eventName && r.competition === entry.competition));
      if (existingIdx >= 0) {
        updatedResults[existingIdx] = entry;
      } else {
        updatedResults.push(entry);
      }
    });

    const updated = { ...dbData, results: updatedResults };
    saveState(updated, 'BULK_UPDATE_MARKS', competitionType);
    setBulkEntries([]);
    setPdfFile(null);
  };

  return (

    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row shadow-inner relative overflow-hidden">
      {/* Background Ambience Removed */}
      
      {/* Toast persistent notification overlay */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-white backdrop-blur-md/80 backdrop-blur-md border border-emerald-500/50 text-emerald-400 p-4 rounded-xl shadow-2xl z-50 animate-slide-left font-bold text-xs">
          ✅ {successMsg}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-72 lg:w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shrink-0 border-r border-slate-700/50 flex flex-col justify-between text-left z-50 shadow-[4px_0_32px_rgba(0,0,0,0.4)]`}>
        
        {/* Top profile section */}
        <div className="flex flex-col">
          {/* Branding header */}
          <div className="px-5 pt-6 pb-4 border-b border-slate-700/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Avatar with initials */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <span className="text-white font-black text-sm font-cinzel uppercase">
                  {currentUser.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">Mekhala Console</span>
                <span className="text-sm font-bold text-white truncate max-w-[130px]" title={currentUser.name}>{currentUser.name}</span>
              </div>
            </div>
            {/* Mobile close button */}
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu items list */}
          <div className="px-3 pt-4 pb-2 h-[calc(100vh-140px)] overflow-y-auto cml-scrollbar">
            {Object.entries(
              navItems.reduce((acc, item) => {
                if (!acc[item.section]) acc[item.section] = [];
                acc[item.section].push(item);
                return acc;
              }, {} as Record<string, typeof navItems>)
            ).map(([sectionName, items]) => (
              <div key={sectionName} className="mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 mb-2">{sectionName}</p>
                <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
                  {items.map((item) => {
                    const isActive = activeTab === item.id;
                    
                    let badgeCount: number | null = null;
                    if (item.id === 'participants' && dbData.registrations) badgeCount = dbData.registrations.length;
                    if (item.id === 'bearers' && dbData.officeBearers) badgeCount = dbData.officeBearers.length;
                    if (item.id === 'units' && dbData.units) badgeCount = dbData.units.length;
                    if (item.id === 'events' && dbData.events) badgeCount = dbData.events.length;
                    if (item.id === 'news' && dbData.news) badgeCount = dbData.news.length;
                    if (item.id === 'announcements' && dbData.announcements) badgeCount = dbData.announcements.length;
                    if (item.id === 'downloads' && dbData.downloads) badgeCount = dbData.downloads.length;
                    
                    if (item.id === 'chosen' && dbData.chosenRegistrations) badgeCount = dbData.chosenRegistrations.length;
                    if (item.id === 'admins') badgeCount = (dbData.users?.length || 0) + 2;
                    
                    return (
                      <li key={item.id} className="relative p-0 m-0">
                        {isActive && (
                          <motion.div 
                            layoutId="sidebar-active"
                            className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/10 rounded-xl border border-violet-500/30"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <button
                          onClick={() => {
                            setActiveTab(item.id as any);
                            if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
                          }}
                          className={`relative z-10 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 select-none text-left focus:outline-none ${
                            isActive
                              ? 'text-violet-300 font-bold'
                              : 'text-slate-400 font-medium hover:bg-slate-800/60 hover:text-slate-200'
                          }`}
                        >
                          <span className={`shrink-0 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500'}`}>
                            {item.icon}
                          </span>
                          
                          <span className="flex-1 text-left leading-normal font-sans text-[12px]">
                            {item.label}
                          </span>

                          {badgeCount !== null && badgeCount > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono leading-none font-bold shrink-0 transition-all ${
                              isActive 
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {badgeCount}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom actions */}
        <div className="px-3 pb-5 pt-3 border-t border-slate-700/50 flex flex-col gap-1">
          {onGoToTab && (
            <button
              onClick={() => onGoToTab('home')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 select-none text-left focus:outline-none text-slate-400 hover:bg-amber-500/10 hover:text-amber-300 font-medium border border-transparent hover:border-amber-500/20 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="flex-1 font-sans text-[12px]">Website Home</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 select-none text-left focus:outline-none text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 font-medium border border-transparent hover:border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="flex-1 font-sans text-[12px]">Logout Session</span>
          </button>
        </div>


      </div>

      {/* Main Workspace Frame */}
      <div className="relative z-10 flex-1 p-6 md:p-10 text-left bg-transparent overflow-y-auto cml-scrollbar shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Mobile Header Menu Button */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-black text-xs font-cinzel uppercase">
                {currentUser.name?.charAt(0) || 'A'}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-100 truncate">Mekhala Admin</span>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg shadow-lg border border-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {/* VIEW 1: OVERVIEW COMPONENT */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">WORKSPACE</span>
              <h3 className="font-sans font-black text-2xl text-slate-900">Console Overview</h3>
              <p className="text-slate-600 text-xs">A comprehensive telemetry summary of our digital compositions stored inside CML Mekhala folder.</p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="p-4 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col hover:border-violet-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900 relative z-10">{dbData.officeBearers.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Leaders</span>
              </div>

              <div className="p-4 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900 relative z-10">{dbData.units.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Parishes</span>
              </div>

              <div className="p-4 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900 relative z-10">{dbData.events.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Events</span>
              </div>

              <div className="p-4 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900 relative z-10">{dbData.chosenRegistrations?.length || 0}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Delegates</span>
              </div>
              
              <div className="p-4 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col hover:border-amber-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900 relative z-10">{dbData.registrations?.length || 0}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Participants</span>
              </div>
              
              <div className="p-4 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col hover:border-rose-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <Newspaper className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900 relative z-10">{dbData.news.length + dbData.announcements.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Posts</span>
              </div>
            </div>

            {/* Overall Shakha Points Table & Championship Standings */}
            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30 border border-orange-400/50">
                    <Trophy className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                  <div>
                    <h4 className="font-sans font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 tracking-tight uppercase">
                      Shakha Championship Points Standings
                    </h4>
                    <p className="text-xs text-slate-500 font-sans mt-0.5 font-medium">
                      Real-time aggregated festival (Arts) and literary competition point tallies across all parish units.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const newVisibility = !(dbData.settings?.showOverallLeaderboard);
                      const updated = { ...dbData, settings: { ...dbData.settings, showOverallLeaderboard: newVisibility } };
                      saveState(updated, 'TOGGLE_LEADERBOARD_VISIBILITY', newVisibility ? 'Published' : 'Hidden');
                      
                      // Actually persist to Supabase
                      const targetId = dbData.settings?.id || '8333e21d-084a-47e8-a316-9cf17220e79f';
                      await supabase.from('settings').update({ show_overall_leaderboard: newVisibility }).eq('id', targetId);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition self-start sm:self-center shadow-sm flex items-center gap-2 border ${dbData.settings?.showOverallLeaderboard ? 'bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 border-emerald-200' : 'bg-amber-50 text-amber-600 hover:text-amber-700 hover:bg-amber-100 border-amber-200'}`}
                    title="Toggle public visibility of the overall Shakha leaderboard"
                  >
                    {dbData.settings?.showOverallLeaderboard ? (
                      <><Eye className="w-3.5 h-3.5" /> Publicly Visible</>
                    ) : (
                      <><EyeOff className="w-3.5 h-3.5" /> Hidden from Public</>
                    )}
                  </button>

                  {dbData.results && dbData.results.length > 0 && (
                    <button
                      onClick={() => {
                        if (!confirm('Are you sure you want to delete ALL graded results and reset all championship point tallies to 0? This action cannot be undone!')) return;
                        const updated = { ...dbData, results: [], competitionStatuses: {} };
                        saveState(updated, 'CLEAR_RESULTS_ALL', 'Championship Point Tally Reset');
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition self-start sm:self-center shadow-sm"
                      id="clear-all-points-btn"
                    >
                      Clear All Points / Results
                    </button>
                  )}
                </div>
              </div>

              {/* Parish Units Points Directory Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/30">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/80 text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
                      <th className="py-4 px-5 w-16 text-center">Rank</th>
                      <th className="py-4 px-4">Parish Unit (Shakha)</th>
                      <th className="py-4 px-4 text-center">Total Points</th>
                      <th className="py-4 px-4 text-right">Kalolsavam (Arts)</th>
                      <th className="py-4 px-4 text-right">Sahithyamalsaram (Literary)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {unitPointsList.map((unit, index) => {
                      const totalPts = unit.kalolsavamPoints + unit.sahithyamPoints;
                      
                      let rankBadge = (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-black text-sm">
                          {index + 1}
                        </span>
                      );
                      
                      if (index === 0) {
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-600 font-black text-base shadow-sm ring-4 ring-amber-50">
                            1
                          </span>
                        );
                      } else if (index === 1) {
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-600 font-black text-sm shadow-sm ring-4 ring-slate-50">
                            2
                          </span>
                        );
                      } else if (index === 2) {
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 border-2 border-orange-300 text-orange-700 font-black text-sm shadow-sm ring-4 ring-orange-50/50">
                            3
                          </span>
                        );
                      }

                      return (
                        <tr 
                          key={unit.unitId} 
                          className="hover:bg-white transition-colors duration-200 group bg-transparent"
                        >
                          <td className="py-4 px-5 text-center align-middle">
                            {rankBadge}
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <span className="font-sans font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                              {unit.unitName}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5 font-semibold">
                              CODE: {unit.unitId}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle text-center bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
                            <span className={`font-mono font-black text-lg md:text-xl ${index === 0 ? 'text-amber-500' : 'text-slate-800'}`}>
                              {totalPts} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Pts</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle text-right">
                            <span className="font-mono font-bold text-slate-700 text-sm">
                              {unit.kalolsavamPoints} <span className="text-[10px] text-slate-400 font-medium">pts</span>
                            </span>
                            <span className="block text-[9px] text-slate-400 font-medium font-sans mt-1">
                              {unit.kalolsavamAGradesCount} A-Grades | {unit.kalolsavamParticipantsCount} entries
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle text-right">
                            <span className="font-mono font-bold text-slate-700 text-sm">
                              {unit.sahithyamPoints} <span className="text-[10px] text-slate-400 font-medium">pts</span>
                            </span>
                            <span className="block text-[9px] text-slate-400 font-medium font-sans mt-1">
                              {unit.sahithyamAGradesCount} A-Grades | {unit.sahithyamParticipantsCount} entries
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live user badge details */}
            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs flex flex-col gap-3">
              <h4 className="font-bold text-slate-700">Identity Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
                <div>🧑‍💻 Logged user: <strong>{currentUser.name}</strong></div>
                <div>👤 Security Role: <strong>{currentUser.role}</strong></div>
                <div>✉️ Primary Email: <strong>{currentUser.email}</strong></div>
              </div>
              {isEditorOnly && (
                <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-500 text-[11px] font-semibold leading-normal">
                  ⚠️ Note: You log in under an Editor level profile. You are permitted to execute normal CRUD operations on lists, but master portal settings config is strictly locked for Super Admin!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: MASTER SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Configure Homepage Metadata</h3>
              <p className="text-slate-500 text-xs text-left">Update support emails, hotlines, Malayalam slogans and unit stats badges instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">🚨 Support Desk Phone</label>
                <input
                  type="text"
                  value={settingsForm.supportDesk}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportDesk: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">✉️ General Hotline Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">🌟 Motto Primary (Malayalam script)</label>
                <input
                  type="text"
                  value={settingsForm.mottoPrimary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mottoPrimary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">🔥 Motto Secondary (Malayalam script)</label>
                <input
                  type="text"
                  value={settingsForm.mottoSecondary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mottoSecondary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-600">🎨 Hero Intro Text Block (Malayalam Description)</label>
                <textarea
                  rows={3}
                  value={settingsForm.heroIntro}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroIntro: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">⛪ Parish Units Badge Count</label>
                <input
                  type="number"
                  value={settingsForm.parishUnitsCount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, parishUnitsCount: parseInt(e.target.value) || 11 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 animate-fade-in"
                />
              </div>

              <div className="flex flex-col gap-3 text-left md:col-span-2 pt-5 border-t border-slate-900">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Premium Feature Tab Visibility</span>
                <p className="text-slate-500 text-[11px] -mt-1.5 mb-1 text-left">Toggle whether these high-fidelity sections appear in the main navigation menu for visitors.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Kalolsavam Toggle */}
                  <label className="flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-xl cursor-pointer select-none transition">
                    <input
                      type="checkbox"
                      checked={settingsForm.showKalolsavam !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showKalolsavam: e.target.checked })}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">Kalolsavam 2026–27</span>
                      <span className="text-[10px] text-slate-500">Show result desk panel</span>
                    </div>
                  </label>

                  {/* Sahithyamalsaram Toggle */}
                  <label className="flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-xl cursor-pointer select-none transition">
                    <input
                      type="checkbox"
                      checked={settingsForm.showSahithyamalsaram !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showSahithyamalsaram: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-xs leading-none">Sahithyamalsaram 2026–27</span>
                      <span className="text-[10px] text-slate-500 mt-1">Show literary contest</span>
                    </div>
                  </label>

                  {/* Chosen Toggle */}
                  <label className="flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-xl cursor-pointer select-none transition">
                    <input
                      type="checkbox"
                      checked={settingsForm.showChosen !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showChosen: e.target.checked })}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">Chosen Summit 2026</span>
                      <span className="text-[10px] text-slate-500">Show delegation desk</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 pt-3 border-t border-slate-900 leading-none flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1"
                >
                  <Save className="w-4 h-4" /> Save General Configs
                </button>
              </div>
            </div>

            {/* Rotating Hero Slideshow Manager (Added) */}
            <div className="flex flex-col gap-4 bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs text-left">
              <div className="flex flex-col gap-1 border-b border-slate-900 pb-3">
                <h4 className="font-sans font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>🎬 Hero Banner Rotating Slideshow</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 font-normal px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Premium Carousel Setup
                  </span>
                </h4>
                <p className="text-slate-500 text-[11.5px]">Manage multiple homepage showcase photos, tags, subtitles, locations, and transition intervals.</p>
              </div>

              {/* 1. Interval configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pb-4 border-b border-slate-900">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">⏱️ Slide Rotation Period (Time Interval in seconds)</label>
                  <p className="text-slate-500 text-[10px] -mt-1">Define how many seconds each slide remains on screen before automatically rotating.</p>
                  <input
                    type="number"
                    min={2}
                    max={120}
                    value={settingsForm.heroInterval || 5}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroInterval: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="text-[11px] text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100 md:mt-0">
                  ⚡ Each active slide will fade/scale dynamically using modern hardware-accelerated animations based on this configured interval. Keep at 5s for optimum readability.
                </div>
              </div>

              {/* 2. Slide Create / Edit Form */}
              <div className="p-5 bg-slate-50/40 rounded-xl border border-slate-900 flex flex-col gap-4 mt-2">
                <h5 className="font-bold text-slate-700 text-[12px] flex items-center gap-1.5">
                  <span>{editingSlideId ? '✏️ Modify Slide Segment' : '➕ Insert New Custom Slide'}</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image URL */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                     <label className="font-bold text-slate-600">Slide Image URL</label>
                     <input
                       type="text"
                       value={slideForm.imageUrl || ''}
                       onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                       placeholder="https://images.unsplash.com/... or absolute image source URL"
                     />
                     <p className="text-slate-600/90 text-[10px] mt-0.5">Provide an image URL to load. You can paste any image link from Unsplash, Imgur, or the web.</p>
                  </div>

                  {/* Caption Title */}
                  <div className="flex flex-col gap-1.5">
                     <label className="font-bold text-slate-600 font-sans">Primary Tag (Title)</label>
                     <input
                       type="text"
                       value={slideForm.captionTitle || ''}
                       onChange={(e) => setSlideForm({ ...slideForm, captionTitle: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                       placeholder="e.g. CHOSEN LEADERS MEET"
                     />
                  </div>

                  {/* Caption Subtitle */}
                  <div className="flex flex-col gap-1.5">
                     <label className="font-bold text-slate-600 font-sans">Secondary Tag (Subtitle / Category)</label>
                     <input
                       type="text"
                       value={slideForm.captionSub || ''}
                       onChange={(e) => setSlideForm({ ...slideForm, captionSub: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                       placeholder="e.g. Mekhala Summit 2026"
                     />
                  </div>

                  {/* Caption Venue */}
                  <div className="flex flex-col gap-1.5">
                     <label className="font-bold text-slate-600 font-sans">Location Tag (Venue / Date Info)</label>
                     <input
                       type="text"
                       value={slideForm.captionVenue || ''}
                       onChange={(e) => setSlideForm({ ...slideForm, captionVenue: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                       placeholder="e.g. VENUE: JAI RANI PUBLIC SCHOOL, KALIYAR"
                     />
                  </div>

                  {/* Is Active Status */}
                  <div className="flex items-center gap-3 pt-6 select-none cursor-pointer">
                    <input
                      id="slide-active-checkbox"
                      type="checkbox"
                      checked={slideForm.isActive !== false}
                      onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="slide-active-checkbox" className="font-bold text-slate-600 cursor-pointer text-xs">
                      Enable Slide in active rotating sequence
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {editingSlideId && (
                    <button
                      onClick={() => {
                        setEditingSlideId(null);
                        setSlideForm({
                          imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
                          captionTitle: '',
                          captionSub: '',
                          captionVenue: '',
                          isActive: true
                        });
                      }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={handleSaveSlide}
                    className="px-5 py-2.5 bg-fuchsia-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                  >
                    {editingSlideId ? 'Apply Slide Update' : 'Add Image Slide segment'}
                  </button>
                </div>
              </div>

              {/* 3. Existing Carousel Slides List */}
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1">Configured Showcase Image Gallery ({settingsForm.heroSlides?.length || 0})</span>
                
                {(!settingsForm.heroSlides || settingsForm.heroSlides.length === 0) ? (
                  <div className="p-6 bg-slate-50/20 border border-dashed border-slate-200 rounded-xl text-center text-slate-500">
                    ⚠️ No custom images defined yet. The website is currently displaying the high-resolution default cover photo ("Chosen Leaders Meet" in Jai Rani School map). Add images above to build a rotating slideshow.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 border border-slate-900 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-slate-50 p-3 text-slate-600 font-bold border-b border-slate-100 uppercase tracking-widest text-[9.5px]">
                      <div className="col-span-2">Preview</div>
                      <div className="col-span-3">Primary Tag</div>
                      <div className="col-span-3">Secondary Tags</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-slate-900 bg-white backdrop-blur-md/40">
                      {settingsForm.heroSlides.map((slide, index) => (
                        <div key={slide.id} className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/20 transition text-slate-700">
                          {/* Preview column */}
                          <div className="col-span-2 flex items-center">
                            <img loading="lazy"
                              src={slide.imageUrl}
                              alt={slide.captionTitle}
                              className="w-16 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Primary tag */}
                          <div className="col-span-3 flex flex-col justify-center min-w-0 pr-2">
                            <span className="font-bold text-slate-800 truncate">{slide.captionTitle}</span>
                            <span className="text-[9px] text-slate-500 font-mono truncate">{slide.id}</span>
                          </div>

                          {/* Secondary tag / Venue */}
                          <div className="col-span-3 flex flex-col pr-2 justify-center min-w-0 text-[10.5px]">
                            <span className="text-amber-500 font-semibold truncate leading-normal">{slide.captionSub || '-'}</span>
                            <span className="text-[9.5px] text-slate-500 truncate leading-none mt-0.5">{slide.captionVenue || '-'}</span>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              slide.isActive 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-50 text-slate-500 border border-slate-300/50'
                            }`}>
                              {slide.isActive ? 'Active rotating' : 'Inactive'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex items-center justify-end gap-1.5">
                            {/* Sort buttons */}
                            <button
                              onClick={() => handleMoveSlide(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-30 text-xs font-bold"
                              title="Move Slide Up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveSlide(index, 'down')}
                              disabled={index === settingsForm.heroSlides!.length - 1}
                              className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-30 text-xs font-bold"
                              title="Move Slide Down"
                            >
                              ▼
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => handleEditSlide(slide)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-50 transition"
                              title="Edit Slide Content"
                            >
                              <Edit className="w-3 h-3" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-500 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-50 transition"
                              title="Delete Slide"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Master Settings Persistent Save */}
              <div className="pt-3 border-t border-slate-900 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-black uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" /> Save General Configs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: OFFICE BEARERS */}
        {activeTab === 'bearers' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage Executive Board Members</h3>
              <p className="text-slate-500 text-xs">Execute immediate CRUD edits over religious directors and youth secretariats.</p>
            </div>

            {/* Bearer Form */}
            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <h4 className="font-extrabold text-slate-700 text-sm">{editingBearerId ? '✏️ Edit Bearer Details' : '➕ Register New Board Leader'}</h4>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">FullName</label>
                <input
                  type="text"
                  value={bearerForm.name}
                  onChange={(e) => setBearerForm({ ...bearerForm, name: e.target.value })}
                  placeholder="e.g. Rev. Fr. Mathew"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Designation / Title</label>
                <input
                  type="text"
                  value={bearerForm.designation}
                  onChange={(e) => setBearerForm({ ...bearerForm, designation: e.target.value })}
                  placeholder="e.g. Mekhala General Secretary"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Avatar Image</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {bearerForm.photoUrl && (
                    <img loading="lazy" src={bearerForm.photoUrl} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('data-target', 'bearer');
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex-1 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-200 border border-slate-300 p-3 rounded-xl text-slate-900 transition cursor-pointer text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Crop Photo</span>
                  </button>
                  <input
                    type="text"
                    value={bearerForm.photoUrl || ''}
                    onChange={(e) => setBearerForm({ ...bearerForm, photoUrl: e.target.value })}
                    placeholder="Or paste URL here..."
                    className="flex-1 w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Contact Telephone Hotline</label>
                <input
                  type="text"
                  value={bearerForm.contact}
                  onChange={(e) => setBearerForm({ ...bearerForm, contact: e.target.value })}
                  placeholder="e.g. +91 94460 12345"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Contact Email</label>
                <input
                  type="email"
                  value={bearerForm.email}
                  onChange={(e) => setBearerForm({ ...bearerForm, email: e.target.value })}
                  placeholder="e.g. treesa@cml.org"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Service Tenure period</label>
                <input
                  type="text"
                  value={bearerForm.servicePeriod}
                  onChange={(e) => setBearerForm({ ...bearerForm, servicePeriod: e.target.value })}
                  placeholder="e.g. 2025 - Present"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">House Name</label>
                <input
                  type="text"
                  value={bearerForm.houseName}
                  onChange={(e) => setBearerForm({ ...bearerForm, houseName: e.target.value })}
                  placeholder="e.g. Veliyath House"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Parish / Unit Name</label>
                <input
                  type="text"
                  value={bearerForm.unit}
                  onChange={(e) => setBearerForm({ ...bearerForm, unit: e.target.value })}
                  placeholder="e.g. Kaliyar Unit"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-3 border-t border-slate-900">
                {editingBearerId && (
                  <button
                    onClick={() => {
                      setEditingBearerId(null);
                      setBearerForm({ name: '', designation: '', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', contact: '', email: '', servicePeriod: '2025 - Present', houseName: '', unit: '', orderIndex: 0 });
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveBearer}
                  className="px-5 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" /> {editingBearerId ? 'Save Edits' : 'Add Register'}
                </button>
              </div>
            </div>

            {/* Bearers listing Table */}
            <div className="bg-white backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full leading-normal border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">House</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {dbData.officeBearers.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-2.5">
                        <img loading="lazy" src={b.photoUrl} alt={b.name} className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{b.name}</td>
                      <td className="px-4 py-2.5 text-indigo-600 font-medium">{b.designation}</td>
                      <td className="px-4 py-2.5 text-slate-700">{b.houseName || '-'}</td>
                      <td className="px-4 py-2.5 text-amber-400 font-medium">{b.unit || '-'}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{b.contact}</td>
                      <td className="px-4 py-2.5 text-slate-500">{b.servicePeriod}</td>
                      <td className="px-4 py-2.5 text-right flex items-center justify-end gap-1.5 h-full mt-1 border-none bg-transparent">
                        <button
                          onClick={() => {
                            setEditingBearerId(b.id);
                            setBearerForm(b);
                          }}
                          className="p-1.5 bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-300"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBearer(b.id, b.name)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-500 rounded-lg border border-indigo-200"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: PARISH UNITS */}
        {activeTab === 'units' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage Parish Units</h3>
              <p className="text-slate-500 text-xs">Register new church branches and update parish strength metrics.</p>
            </div>

            {/* Unit Create Form */}
            <div ref={unitsFormRef} className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-left flex justify-between items-center">
                <h4 className="font-bold text-slate-700 text-sm">
                  {editingUnitId ? `✏️ Edit Config: ${unitForm.name || 'Parish Unit'}` : '➕ Register New CML Parish Unit'}
                </h4>
                {editingUnitId && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded animate-pulse">
                    Active Edit Guild
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Unit Name</label>
                <input
                  type="text"
                  value={unitForm.name || ''}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  placeholder="e.g. St. Sebastian Church Forane, Vannappuram"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Patron Saint</label>
                <input
                  type="text"
                  value={unitForm.patronSaint || ''}
                  onChange={(e) => setUnitForm({ ...unitForm, patronSaint: e.target.value })}
                  placeholder="e.g. St. Sebastian"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Supervisor Hotline Number</label>
                <input
                  type="text"
                  value={unitForm.contactNumber || ''}
                  onChange={(e) => setUnitForm({ ...unitForm, contactNumber: e.target.value })}
                  placeholder="e.g. +91 94460 30040"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Backdrop Picture</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {unitForm.bgPhoto && (
                    <img loading="lazy" src={unitForm.bgPhoto} alt="Backdrop" className="w-20 h-12 rounded-md object-cover border border-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('data-target', 'unit');
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex-1 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-200 border border-slate-300 p-3 rounded-xl text-slate-900 transition cursor-pointer text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Crop Photo</span>
                  </button>
                  <input
                    type="text"
                    value={unitForm.bgPhoto || ''}
                    onChange={(e) => setUnitForm({ ...unitForm, bgPhoto: e.target.value })}
                    placeholder="Or paste URL here..."
                    className="flex-1 w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-600">Unit Descriptions & Historical Work Notes</label>
                <textarea
                  rows={2}
                  value={unitForm.description || ''}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              {/* Stats Metrics nested fields */}
              <div className="flex flex-col gap-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">👨‍👩‍👧‍👦 CML Student Members Count</label>
                <input
                  type="number"
                  value={unitForm.stats?.members ?? ''}
                  onChange={(e) => {
                    const stats = unitForm.stats || { members: 0, families: 0, directorsCount: 0 };
                    setUnitForm({
                      ...unitForm,
                      stats: { ...stats, members: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">🏘️ Parish Familes Count</label>
                <input
                  type="number"
                  value={unitForm.stats?.families ?? ''}
                  onChange={(e) => {
                    const stats = unitForm.stats || { members: 0, families: 0, directorsCount: 0 };
                    setUnitForm({
                      ...unitForm,
                      stats: { ...stats, families: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">👤 CML Director Name</label>
                <input
                  type="text"
                  value={unitForm.directorName || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    directorName: e.target.value
                  })}
                  placeholder="e.g. Rev. Fr. Mathew"
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">📞 CML Director Contact</label>
                <input
                  type="text"
                  value={unitForm.directorPhone || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    directorPhone: e.target.value
                  })}
                  placeholder="e.g. +91 94472 11220"
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">👤 CML Joint Director Name</label>
                <input
                  type="text"
                  value={unitForm.jointDirectorName || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    jointDirectorName: e.target.value
                  })}
                  placeholder="e.g. Rev. Sr. Treesa"
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">📞 CML Joint Director Contact</label>
                <input
                  type="text"
                  value={unitForm.jointDirectorPhone || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    jointDirectorPhone: e.target.value
                  })}
                  placeholder="e.g. +91 85930 11223"
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">👤 CML President Name</label>
                <input
                  type="text"
                  value={unitForm.presidentName || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    presidentName: e.target.value
                  })}
                  placeholder="e.g. Basil Veliyath"
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-600">📞 CML President Contact</label>
                <input
                  type="text"
                  value={unitForm.presidentPhone || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    presidentPhone: e.target.value
                  })}
                  placeholder="e.g. +91 95621 55440"
                  className="w-full bg-white backdrop-blur-md border border-slate-100 p-2 rounded text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingUnitId && (
                  <button
                    onClick={() => {
                      setEditingUnitId(null);
                      setUnitForm({ name: '', patronSaint: '', contactNumber: '', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 100, families: 50, directorsCount: 2 }, description: '', orderIndex: 0, directorName: '', directorPhone: '', jointDirectorName: '', jointDirectorPhone: '', presidentName: '', presidentPhone: '' });
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveUnit}
                  className="px-6 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl flex items-center gap-1 transition animate-pulse-once"
                >
                  {editingUnitId ? (
                    <>
                      <Save className="w-4 h-4" /> Update Parish Unit Details
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Parish Unit
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* List columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbData.units.map((u) => (
                <div key={u.id} className="bg-white backdrop-blur-md p-4 rounded-xl border border-slate-200 flex justify-between gap-4 text-xs items-center">
                  <div className="flex flex-col text-left gap-1 truncate">
                    <span className="font-bold text-slate-800 truncate">{u.name}</span>
                    <span className="text-[10px] text-amber-400">Patron Saint: {u.patronSaint} • Members: {u.stats?.members || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingUnitId(u.id);
                        setUnitForm(u);
                        unitsFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="p-1.5 bg-slate-50 hover:text-slate-900 rounded-lg border border-slate-755 transition flex items-center gap-1"
                      title="Edit details of this Parish Unit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="text-[10px] pr-0.5">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(u.id, u.name)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-500 rounded-lg border border-indigo-200 animate-fade-in"
                      title="Delete this Parish Unit"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: EVENTS */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage Activity Calendar</h3>
              <p className="text-slate-500 text-xs">Configure upcoming summit schedules or edit summary winners list for past events.</p>
            </div>

            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="md:col-span-2 text-left">
                <h4 className="font-bold text-slate-700 text-sm">📅 Add / Edit Calendar Schedule</h4>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Conclave/Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Mekhala Kalolsavam 2026"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Calendar Phase Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none"
                >
                  <option value="upcoming">⏳ Upcoming (Active/Pending)</option>
                  <option value="past">📁 Completed Past Archive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Event Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Event Clock Time</label>
                <input
                  type="text"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  placeholder="e.g. 09:30 AM - 05:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Hosting Venue Address</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  placeholder="e.g. St. Augustine Parish Hall, Karimannoor"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-600">Event Description & Program Details</label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              {eventForm.type === 'past' && (
                <div className="flex flex-col gap-1.5 text-left md:col-span-2 bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 animate-fade-in text-slate-900">
                  <label className="font-bold text-emerald-400">🏅 Winners Summary & points table details (For Past Archives Only)</label>
                  <input
                    type="text"
                    value={eventForm.summary}
                    onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })}
                    placeholder="e.g. Vannappuram emerged Overall Champions with 112 points."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 mt-1.5"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingEventId && (
                  <button
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm({ title: '', type: 'upcoming', date: '2026-07-04', time: '10:00 AM', venue: '', description: '', imageUrl: '/src/assets/images/st_therese.png', summary: '' });
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveEvent}
                  className="px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition"
                >
                  Save Calendar Schedule
                </button>
              </div>
            </div>

            {/* List calendar */}
            <div className="flex flex-col gap-3">
              {dbData.events.map((e) => (
                <div key={e.id} className="bg-white backdrop-blur-md p-4 rounded-xl border border-slate-200 flex justify-between gap-4 text-xs items-center">
                  <div className="flex items-center gap-3 text-left truncate">
                    <span className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-indigo-600 font-bold tracking-wide shrink-0">
                      {e.type === 'upcoming' ? '⏳ UP' : '📁 PAST'}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-slate-900 truncate">{e.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Date: {e.date} • Venue: {e.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEventId(e.id);
                        setEventForm(e);
                      }}
                      className="p-1.5 bg-slate-50 hover:text-slate-900 rounded-lg border border-slate-300"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id, e.title)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-500 rounded-lg border border-indigo-200"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: NEWS */}
        {activeTab === 'news' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage News Posts & Editorial Press</h3>
              <p className="text-slate-500 text-xs">Write beautiful articles summarizing diocesan conferences and toggle spotlight featured layout status.</p>
            </div>

            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs flex flex-col gap-4">
              <div className="text-left font-bold text-slate-700 text-sm">
                🎙️ Edit Editorial Press Bulletin
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-600">Story Title</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="e.g. Bishop inaugurated Leadership Meet"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-600">News Category Class</label>
                  <input
                    type="text"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    placeholder="e.g. Celebration"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-600">Release Timestamp Date</label>
                  <input
                    type="date"
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-3 text-left pl-2 pt-2 bg-slate-50 rounded-xl border border-slate-200 px-4">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={newsForm.isFeatured}
                    onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-fuchsia-600 focus:ring-indigo-500 border-slate-300 bg-slate-50 rounded"
                  />
                  <label htmlFor="featured-check" className="font-bold text-slate-700 cursor-pointer select-none text-xs leading-none">
                    ⭐ Spotlight on Headline block (Featured layout)
                  </label>
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="font-bold text-slate-600">Press Release Article Body Content</label>
                  <textarea
                    rows={4}
                    value={newsForm.body}
                    onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingNewsId && (
                  <button
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsForm({ title: '', body: '', category: 'General', imageUrl: '/src/assets/images/st_therese.png', date: '2026-05-29', isFeatured: false });
                    }}
                    className="px-4 py-2.5 bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveNews}
                  className="px-6 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl"
                >
                  Save Editorial Release
                </button>
              </div>
            </div>

            {/* News Roll list table */}
            <div className="flex flex-col gap-4 text-xs">
              {dbData.news.map((n) => (
                <div key={n.id} className="bg-white backdrop-blur-md p-4 rounded-xl border border-slate-200 flex justify-between gap-4 text-left items-center">
                  <div className="flex flex-col truncate gap-0.5">
                    <span className="font-bold text-slate-900 truncate text-sm">{n.title}</span>
                    <span className="text-[10px] text-slate-500">Category: {n.category} • {n.date} {n.isFeatured && <strong className="text-amber-400 ml-1">★ Featured Spotlight Headline</strong>}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingNewsId(n.id);
                        setNewsForm(n);
                      }}
                      className="p-1.5 bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-755"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(n.id, n.title)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-500 rounded-lg border border-indigo-200"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage Red Ribbon Announcements</h3>
              <p className="text-slate-500 text-xs">Scribble quick notice notifications that scroll continuously on the top red banner.</p>
            </div>

            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs flex flex-col gap-4">
              <div className="text-left font-bold text-slate-700">
                🔔 Publish Urgent Bulletin Notification
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Bulletin notice details</label>
                <input
                  type="text"
                  value={annForm.text}
                  onChange={(e) => setAnnForm({ ...annForm, text: e.target.value })}
                  placeholder="e.g. Registrations for Mekhala Kalolsavam 2026 is officially open..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-600">Notice Category Type</label>
                  <select
                    value={annForm.type || 'regular'}
                    onChange={(e) => setAnnForm({ ...annForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="urgent">🚨 Critical / Urgent (Priority banner scroll)</option>
                    <option value="regular">📋 Standard notice / regular</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pl-2 pt-5 select-none text-left">
                  <input
                    type="checkbox"
                    id="sticky-check-ann"
                    checked={annForm.isSticky || false}
                    onChange={(e) => setAnnForm({ ...annForm, isSticky: e.target.checked })}
                    className="w-4 h-4 text-fuchsia-600 focus:ring-indigo-500 border-slate-300 bg-slate-50 rounded"
                  />
                  <label htmlFor="sticky-check-ann" className="font-bold text-slate-700 cursor-pointer text-xs">
                    📌 Keep sticky on announcement margins
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingAnnId && (
                  <button
                    onClick={() => {
                      setEditingAnnId(null);
                      setAnnForm({ text: '', type: 'regular', date: '2026-05-29', isSticky: false });
                    }}
                    className="px-4 py-2 bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveAnn}
                  className="px-5 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl"
                >
                  Post Announcement Balloon
                </button>
              </div>
            </div>

            {/* Roll list */}
            <div className="flex flex-col gap-3">
              {dbData.announcements.map((a) => (
                <div key={a.id} className="bg-white backdrop-blur-md p-4 rounded-xl border border-slate-200 flex justify-between gap-4 text-xs items-center">
                  <div className="flex items-center gap-3 text-left truncate">
                    <span className={`p-1.5 px-2.5 rounded-lg font-bold shrink-0 text-[10px] ${
                      a.type === 'urgent' ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {a.type.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{a.text}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingAnnId(a.id);
                        setAnnForm(a);
                      }}
                      className="p-1.5 bg-slate-50 hover:text-slate-900 rounded-lg border border-slate-300"
                    >
                      <Edit className="w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnn(a.id, a.text)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-500 rounded-lg border border-indigo-200"
                    >
                      <Trash className="w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 8: GALLERY MEDIA */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-8 animate-fade-in text-xs">
            {/* Page title and description */}
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage Photo Gallery Vault</h3>
              <p className="text-slate-500 text-xs text-left">Upload visual pictures and construct organized albums categories.</p>
            </div>

            {/* Album creation and Image uploading form block nested */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
              
              {/* Box 1: Create categories album */}
              <div className="bg-white backdrop-blur-md p-5 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <h4 className="font-bold text-sm text-amber-500">📁 Construct Organized Album</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-600">Album Name</label>
                  <input
                    type="text"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    placeholder="e.g. Golden Jubilee Inauguration"
                    className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-600">Album category</label>
                  <input
                    type="text"
                    value={albumForm.category}
                    onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value })}
                    className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-600">Descriptions</label>
                  <input
                    type="text"
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-900"
                  />
                </div>

                <button
                  onClick={handleAddAlbum}
                  className="mt-2 py-2 w-full bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg rounded-xl transition"
                >
                  Create Album Slot
                </button>
              </div>

              {/* Box 2: Upload images on existing files */}
              <div className="bg-white backdrop-blur-md p-5 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <h4 className="font-bold text-sm text-amber-500">🖼️ Upload Photo to Album Slot</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-600">Select target album category</label>
                  <select
                    value={imageForm.albumId}
                    onChange={(e) => setImageForm({ ...imageForm, albumId: e.target.value })}
                    className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-900"
                  >
                    {dbData.galleryAlbums.map(alb => (
                      <option key={alb.id} value={alb.id}>{alb.title} ({alb.category})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-600">Photo Title Cover name</label>
                  <input
                    type="text"
                    value={imageForm.title}
                    onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                    placeholder="e.g. Diocesan Bishop Speech"
                    className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-600">Picture URL (Mockup or Unsplash)</label>
                  <input
                    type="text"
                    value={imageForm.imageUrl}
                    onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                    className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-900"
                  />
                </div>

                <button
                  onClick={handleAddImage}
                  className="mt-2 py-2 w-full bg-amber-500 hover:bg-cyan-600 text-slate-950 font-extrabold rounded-lg rounded-xl transition"
                >
                  Submit Photo Upload
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 9: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <h3 className="font-sans font-bold text-lg text-slate-900">Manage Documentation Assets</h3>
              <p className="text-slate-500 text-xs">Register download circular files and PDF guideline templates.</p>
            </div>

            <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-left font-bold text-slate-350">
                📄 Register Document assets
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Document Title</label>
                <input
                  type="text"
                  value={downloadForm.title}
                  onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                  placeholder="e.g. Unit registration guide sheet"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 hover:border-slate-300"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Document Category Type</label>
                <select
                  value={downloadForm.category || 'circular'}
                  onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 font-bold"
                >
                  <option value="circular">📜 Official Circular Banner</option>
                  <option value="form">📋 Dynamic Registration Form</option>
                  <option value="report">📊 Diocese Midterm Report</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-600">Estimated File Size</label>
                <input
                  type="text"
                  value={downloadForm.fileSize}
                  onChange={(e) => setDownloadForm({ ...downloadForm, fileSize: e.target.value })}
                  placeholder="e.g. 1.2 MB"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-600">File Description</label>
                <input
                  type="text"
                  value={downloadForm.description}
                  onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })}
                  placeholder="Describe circular targets briefly"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingDownloadId && (
                  <button
                    onClick={() => {
                      setEditingDownloadId(null);
                      setDownloadForm({ title: '', category: 'circular', fileSize: '1.2 MB', downloadUrl: '#', uploadDate: '2026-05-29', description: '' });
                    }}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-705"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveDownload}
                  className="px-5 py-3 bg-amber-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition"
                >
                  Save Document Resource
                </button>
              </div>
            </div>

            {/* List document */}
            <div className="flex flex-col gap-3">
              {dbData.downloads.map((d) => (
                <div key={d.id} className="bg-white backdrop-blur-md p-4 rounded-xl border border-slate-200 flex justify-between gap-4 text-xs items-center">
                  <div className="flex items-center gap-3 text-left truncate">
                    <span className="p-2 bg-slate-50 text-amber-500 font-bold rounded-lg">
                      📄
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-slate-800 truncate">{d.title}</span>
                      <span className="text-[10px] text-slate-500">Category: {d.category} • Size: {d.fileSize}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingDownloadId(d.id);
                        setDownloadForm(d);
                      }}
                      className="p-1.5 bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-300"
                    >
                      <Edit className="w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteDownload(d.id, d.title)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-500 rounded-lg border border-indigo-200"
                    >
                      <Trash className="w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blood-donors' && (
          <div className="flex-1 p-8 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-sans tracking-tight text-slate-800">Blood Donors Database</h3>
                <p className="text-stone-500 font-sans mt-1">Manage and view the list of registered blood donors.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-200px)]">
              <AdminBloodDonors />
            </div>
          </div>
        )}

        {/* VIEW 10: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-lg text-slate-900">Admin Activity Audit Logs</h3>
                <span className="text-xs font-mono font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  {loadingLogs ? 'Loading...' : `Showing latest ${activityLogs.length} entries`}
                </span>
              </div>
              <p className="text-slate-500 text-xs">Real-time log trails generated by the server. Only Super Admins can clean trails.</p>
            </div>

            <div className="bg-white backdrop-blur-md p-5 rounded-3xl border border-slate-200 font-mono text-[11px] text-slate-700 flex flex-col gap-3 text-left overflow-x-auto max-h-[450px]">
              {loadingLogs && <div className="text-slate-500 py-6 text-center text-xs">Fetching logs from Supabase...</div>}
              {!loadingLogs && activityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-indigo-600 font-bold">🛠️ {log.action}</span>
                    <span className="text-slate-600 text-xs">Target: <strong>{log.target}</strong></span>
                    <span className="text-slate-500 text-[10px]">Executor Agent: {log.user_email}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-white backdrop-blur-md border border-slate-100 px-2 py-0.5 rounded italic whitespace-nowrap shrink-0">
                    Timestamp: {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
              {!loadingLogs && activityLogs.length === 0 && (
                <div className="text-slate-500 py-6 text-center text-xs">
                  Console report clean. No operational state adjustments tracked yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ADMIN CREDENTIALS MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="flex flex-col gap-6 animate-fade-in text-left">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pt-2 -mt-2 shadow-sm rounded-b-xl px-2">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Credentials Policy</span>
              <h3 className="font-sans font-bold text-lg text-slate-900">Administrative Access Accounts</h3>
              <p className="text-slate-500 text-xs">Provision and manage administrative access usernames, passwords, and security clearance levels.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add New User Password Form */}
              <div className="lg:col-span-1 bg-white backdrop-blur-md p-6 rounded-3xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-sans font-bold text-sm text-slate-900">Create Access Profile</h4>
                </div>
                
                <form onSubmit={handleAddAdminUser} className="flex flex-col gap-4.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 text-[10px] uppercase font-bold">Full Name</label>
                    <input
                      type="text"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      placeholder="e.g. Rev. Fr. Joseph"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 text-[10px] uppercase font-bold">Email / Username</label>
                    <input
                      type="text"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="e.g. leader@cmlkaliyar.org"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors placeholder:lowercase"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 text-[10px] uppercase font-bold">Access Security Role</label>
                    <select
                      value={adminForm.role}
                      onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Super Admin">Super Admin (All Permissions)</option>
                      <option value="Admin">Admin (Full Dashboard Edit)</option>
                      <option value="Editor">Editor (General Content Only)</option>
                      <option value="Kalolsavam Editor">Kalolsavam Editor (Marks & Participants)</option>
                      <option value="Blood Donor Admin">Blood Donor Admin (Blood Donors Only)</option>
                      <option value="Shakha Admin">Shakha Admin (Blood Donors Only)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 text-[10px] uppercase font-bold">Access Password</label>
                    <input
                      type="text"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      placeholder="Specify dynamic passcode"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 font-black text-xs rounded-xl tracking-wider uppercase shadow-[0_4px_12px_rgba(16,185,129,0.15)] active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Authorize Security Access
                  </button>
                </form>
              </div>

              {/* Authorized Users Directory */}
              <div className="lg:col-span-2 bg-white backdrop-blur-md p-6 rounded-3xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-sans font-bold text-sm text-slate-900">Authorized Users Directory</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    SYSTEM TOTAL: {((dbData.users || []).length + 2)}
                  </span>
                </div>

                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  
                  {/* Default Static Access Profiles */}
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mt-1">System Built-In Accounts</div>
                  {[
                    { email: 'joelveliyath05@gmail.com', name: 'Joel Veliyath', role: 'Super Admin' },
                    { email: 'admin@cmlkaliyar.org', name: 'Mekhala Office Bearer', role: 'Admin' }
                  ].map((sysU) => (
                    <div key={sysU.email} className="p-3.5 bg-slate-50/40 rounded-2xl border border-slate-100/60 flex items-center justify-between gap-4 border-l-4 border-l-slate-700">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          {sysU.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{sysU.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-white backdrop-blur-md border border-slate-100 text-[9px] font-black text-rose-455 uppercase">
                          {sysU.role}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Dynamic Access Profiles */}
                  {(dbData.users || []).map((dynU: any) => {
                    const isEditing = editingAdminEmail?.toLowerCase() === dynU.email.toLowerCase();
                    return (
                      <div key={dynU.email} className={`p-4 bg-slate-50 rounded-2xl border ${isEditing ? 'border-emerald-500/50 bg-slate-50/90' : 'border-slate-200 hover:border-slate-300'} flex flex-col gap-3 transition duration-200 border-l-4 border-l-emerald-500 text-left`}>
                        {!isEditing ? (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1 flex-1">
                              <span className="text-xs font-bold text-slate-900 uppercase">{dynU.name}</span>
                              <span className="text-[10px] font-mono text-slate-600">{dynU.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-white backdrop-blur-md border border-slate-100 text-[9px] font-mono text-emerald-450 uppercase font-black">
                                {dynU.role}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingAdminEmail(dynU.email);
                                  setEditAdminName(dynU.name);
                                  setEditAdminRole(dynU.role);
                                  setEditAdminPassword('');
                                }}
                                className="p-2 bg-white backdrop-blur-md hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer active:scale-95 shrink-0"
                                title="Edit Password, Name, or Security Role"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdminUser(dynU.email)}
                                className="p-2 bg-indigo-50 hover:bg-indigo-50 text-indigo-600 hover:text-slate-900 border border-indigo-200 hover:border-indigo-200 rounded-xl transition duration-150 cursor-pointer active:scale-95 shrink-0"
                                title="Revoke Administrative Access"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-[10px] uppercase font-mono font-black text-emerald-400">Editing Admin: {dynU.email}</span>
                              <button onClick={() => setEditingAdminEmail(null)} className="text-slate-600 hover:text-red-400 transition">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-slate-600 text-[9px] uppercase font-bold">Admin Name</label>
                                <input
                                  type="text"
                                  value={editAdminName}
                                  onChange={(e) => setEditAdminName(e.target.value)}
                                  className="w-full bg-white backdrop-blur-md border border-slate-880 p-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-slate-600 text-[9px] uppercase font-bold">Role Access Strength</label>
                                <select
                                  value={editAdminRole}
                                  onChange={(e) => setEditAdminRole(e.target.value as any)}
                                  className="w-full bg-white backdrop-blur-md border border-slate-880 p-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="Super Admin">Super Admin</option>
                                  <option value="Admin">Admin</option>
                                  <option value="Editor">Editor</option>
                                  <option value="Kalolsavam Editor">Kalolsavam Editor</option>
                                  <option value="Blood Donor Admin">Blood Donor Admin</option>
                                  <option value="Shakha Admin">Shakha Admin</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-slate-600 text-[9px] uppercase font-bold">New Password (or Leave Blank)</label>
                                <input
                                  type="text"
                                  value={editAdminPassword}
                                  onChange={(e) => setEditAdminPassword(e.target.value)}
                                  placeholder="Leave blank to keep unchanged"
                                  className="w-full bg-white backdrop-blur-md border border-slate-880 p-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                              <button
                                onClick={() => setEditingAdminEmail(null)}
                                className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs transition font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateAdminUser(dynU.email)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs transition font-black tracking-wider uppercase flex items-center gap-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                              >
                                <Save className="w-3.5 h-3.5" /> Save Changes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(!dbData.users || dbData.users.length === 0) && (
                    <div className="text-center py-6 text-slate-500 font-semibold text-xs border border-dashed border-slate-100 rounded-2xl bg-white backdrop-blur-md/30">
                      No dynamic admin accounts provisioned yet.
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 11: CHOSEN DELEGATES MANAGEMENT */}
        {activeTab === 'chosen' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 text-left">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">REGISTRATION REGISTRY</span>
              <h3 className="font-sans font-bold text-lg text-slate-900">Chosen Summit Enrolled Delegates</h3>
              <p className="text-slate-500 text-xs">Track, examine, and manage delegates registered on the public dynamic Summit page.</p>
            </div>

            <div className="flex flex-col gap-4 bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">REGISTERED DELEGATES: <strong>{dbData.chosenRegistrations?.length || 0}</strong></span>
                  <div className="flex bg-white backdrop-blur-md p-1 border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setChosenGenderFilter('all')}
                      className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition ${chosenGenderFilter === 'all' ? 'bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 font-black' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setChosenGenderFilter('boys')}
                      className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition ${chosenGenderFilter === 'boys' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-black' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      Boys
                    </button>
                    <button
                      type="button"
                      onClick={() => setChosenGenderFilter('girls')}
                      className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition ${chosenGenderFilter === 'girls' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 font-black' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      Girls
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={chosenShakhaFilter}
                      onChange={(e) => setChosenShakhaFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Shakhas</option>
                      {Array.from(new Set((dbData.chosenRegistrations || []).map((r: any) => r.shakha))).sort().map((shakhaName: any) => (
                        <option key={shakhaName} value={shakhaName}>{shakhaName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSummitAddOpen(true)}
                    className="px-3 py-1.5 bg-fuchsia-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Participant Manually
                  </button>

                  {dbData.chosenRegistrations && dbData.chosenRegistrations.length > 0 && (
                    <button
                      disabled={isChosenPdfGenerating}
                      type="button"
                      onClick={handleDownloadAllChosenPDF}
                      className="px-3 py-1.5 bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/40 border border-emerald-200/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" /> {isChosenPdfGenerating ? 'Generating...' : 'Download Registry PDF'}
                    </button>
                  )}

                  {isClearAllConfirmOpen ? (
                    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 p-1.5 rounded-xl">
                      <span className="text-[10px] text-rose-200 font-bold uppercase tracking-wider px-1">CONFIRM CLEAR ALL?</span>
                      <button
                        onClick={async () => {
                          const updated = { ...dbData, chosenRegistrations: [] };
                          await saveState(updated, 'CLEAR_CHOSEN_REGISTRATIONS_ALL', 'Registry Clean-up');
                          setIsClearAllConfirmOpen(false);
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase transition cursor-pointer"
                      >
                        YES, DELETE ALL
                      </button>
                      <button
                        onClick={() => setIsClearAllConfirmOpen(false)}
                        className="p-1 hover:bg-slate-50 rounded transition cursor-pointer text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    dbData.chosenRegistrations && dbData.chosenRegistrations.length > 0 && (
                      <button
                        onClick={() => setIsClearAllConfirmOpen(true)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:text-indigo-600 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Clear All Enrolments
                      </button>
                    )
                  )}
                </div>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const filteredChosen = (dbData.chosenRegistrations || []).filter((reg: any) => {
                    if (chosenGenderFilter === 'boys' && (reg.gender || '').toLowerCase() !== 'boy') return false;
                    if (chosenGenderFilter === 'girls' && (reg.gender || '').toLowerCase() !== 'girl') return false;
                    if (chosenShakhaFilter !== 'all' && reg.shakha !== chosenShakhaFilter) return false;
                    return true;
                  });
 
                  if (filteredChosen.length === 0) {
                    return (
                      <div className="bg-white backdrop-blur-md/65 p-10 rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold text-xs md:col-span-2">
                        No active matching delegates found for Chosen 2026.
                      </div>
                    );
                  }
 
                  return filteredChosen.map((reg: any) => (
                    <div key={reg.id} className="bg-white backdrop-blur-md border border-slate-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                      <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition duration-200 flex items-center gap-1.5" id={`chosen-action-${reg.id}`}>
                        {deletingChosenId === reg.id ? (
                          <div className="flex items-center gap-1 bg-red-950/60 border border-red-900 p-1 rounded-lg">
                            <span className="text-[8px] text-red-200 font-bold uppercase tracking-wider px-1">REMOVE?</span>
                            <button
                              onClick={() => {
                                const updated = {
                                  ...dbData,
                                  chosenRegistrations: (dbData.chosenRegistrations || []).filter((r: any) => r.id !== reg.id)
                                };
                                saveState(updated, 'REMOVE_CHOSEN_REGISTRATION', reg.participantName);
                                setDeletingChosenId(null);
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-sans text-[9px] font-black uppercase rounded transition cursor-pointer active:scale-95"
                              title="Yes, remove"
                            >
                              YES
                            </button>
                            <button
                              onClick={() => setDeletingChosenId(null)}
                              className="p-1 hover:bg-slate-50 rounded text-slate-350 hover:text-slate-900 transition cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setDeletingChosenId(reg.id);
                            }}
                            className="p-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-100 hover:text-slate-900 transition cursor-pointer"
                            title="Dismiss Registration"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="text-slate-500 text-[10px] font-mono tracking-wider">ID: {reg.id}</span>
                        <h4 className="font-sans font-black text-sm text-slate-900 mt-1 leading-tight uppercase flex items-center gap-2">
                          {reg.participantName}
                          <span className={`px-2 py-0.5 rounded-full text-[8px] tracking-wide font-black ${reg.gender?.toLowerCase() === 'boy' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                            {reg.gender || 'Delegate'}
                          </span>
                        </h4>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs">
                          <span className="text-indigo-600 font-bold">Shakha: {reg.shakha}</span>
                          {reg.fatherName && (
                            <span className="text-slate-600 font-medium font-mono">Father: {reg.fatherName}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-900 text-xs text-slate-700">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Position</span>
                          <span className="font-semibold text-slate-900 truncate">{reg.position || 'Mission Activist'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Enrolled</span>
                          <span className="font-mono text-slate-500 text-[10px] truncate">{new Date(reg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-slate-700">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Contact Number</span>
                          <span className="font-semibold text-slate-900 truncate font-mono">{reg.contactNumber}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Parent Contact</span>
                          <span className="font-semibold text-slate-900 truncate font-mono">{reg.parentsContactNumber}</span>
                        </div>
                      </div>

                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* SUMMIT MANUAL DELEGATE ADD MODAL */}
            <AnimatePresence>
              {isSummitAddOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] text-left"
                  >
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-5">
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-base font-black text-slate-900">Add Summit Delegate Manually</h3>
                      </div>
                      <button onClick={() => setIsSummitAddOpen(false)} className="text-slate-500 hover:text-slate-900 transition cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddSummitDelegate} className="flex flex-col gap-4 text-xs text-slate-900">
                      
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-bold text-slate-600 uppercase tracking-wide">Delegate Full Name</label>
                        <input
                          type="text"
                          required
                          value={summitForm.participantName}
                          onChange={e => setSummitForm({ ...summitForm, participantName: e.target.value })}
                          placeholder="e.g. ABIN SHAJU"
                          className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-900 font-extrabold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-600 uppercase tracking-wide">Gender</label>
                          <select
                            value={summitForm.gender}
                            onChange={e => setSummitForm({ ...summitForm, gender: e.target.value })}
                            className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Boy">Boy</option>
                            <option value="Girl">Girl</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-600 uppercase tracking-wide">Class</label>
                          <select
                            value={summitForm.className}
                            onChange={e => setSummitForm({ ...summitForm, className: e.target.value })}
                            className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                            <option value="College">College</option>
                            <option value="LKG - Class 4">LKG - Class 4</option>
                            <option value="Class 5 - Class 7">Class 5 - Class 7</option>
                            <option value="Class 8 - Class 9">Class 8 - Class 9</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-600 uppercase tracking-wide font-medium">Parish Unit (Shakha)</label>
                          <select
                            value={summitForm.shakha}
                            onChange={e => setSummitForm({ ...summitForm, shakha: e.target.value })}
                            className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Kaliyar">Kaliyar</option>
                            <option value="Kadavoor">Kadavoor</option>
                            <option value="Kodikulam">Kodikulam</option>
                            <option value="Koduvely">Koduvely</option>
                            <option value="Mullaringad">Mullaringad</option>
                            <option value="Mundanmudy">Mundanmudy</option>
                            <option value="Njarakkad">Njarakkad</option>
                            <option value="Paingottoor">Paingottoor</option>
                            <option value="Punnamattam">Punnamattam</option>
                            <option value="Rajagiri">Rajagiri</option>
                            <option value="Thennathoor">Thennathoor</option>
                            <option value="Thommankuthu">Thommankuthu</option>
                            <option value="Vannappuram">Vannappuram</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-600 uppercase tracking-wide">Summit Role / Position</label>
                          <select
                            value={summitForm.position}
                            onChange={e => setSummitForm({ ...summitForm, position: e.target.value })}
                            className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Delegate">Delegate</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Volunteer">Volunteer</option>
                            <option value="Member">Member</option>
                            <option value="President">President</option>
                            <option value="Secretary">Secretary</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-bold text-slate-600 uppercase tracking-wide">House / Family Name</label>
                        <input
                          type="text"
                          value={summitForm.houseName}
                          onChange={e => setSummitForm({ ...summitForm, houseName: e.target.value })}
                          placeholder="e.g. PUTHENVEETTIL"
                          className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-bold text-slate-600 uppercase tracking-wide font-mono">Father's / Guardian's Name</label>
                        <input
                          type="text"
                          required
                          value={summitForm.fatherName}
                          onChange={e => setSummitForm({ ...summitForm, fatherName: e.target.value })}
                          placeholder="e.g. SHAJU JOSEPH"
                          className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-600 uppercase tracking-wide font-mono">Primary Phone Number</label>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={summitForm.contactNumber}
                            onChange={e => setSummitForm({ ...summitForm, contactNumber: e.target.value.replace(/\D/g, '') })}
                            placeholder="10-digit number"
                            className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-600 uppercase tracking-wide font-mono font-medium">Parent Contact Number</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={summitForm.parentsContactNumber}
                            onChange={e => setSummitForm({ ...summitForm, parentsContactNumber: e.target.value.replace(/\D/g, '') })}
                            placeholder="10-digit number"
                            className="bg-white backdrop-blur-md border border-slate-100 p-3 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-4 mt-2">
                        <button
                          type="button"
                          onClick={() => setIsSummitAddOpen(false)}
                          className="px-5 py-2.5 bg-slate-50 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-indigo-500 hover:from-indigo-500 hover:to-fuchsia-600 text-slate-900 font-bold rounded-xl shadow-lg transition cursor-pointer"
                        >
                          Register Delegate
                        </button>
                      </div>

                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {(activeTab === 'kalolsavam-marks' || activeTab === 'sahithyamalsaram-marks') && (
          <MarksGradeManager 
             dbData={dbData} 
             competitionType={activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram'} 
             currentUser={currentUser} 
             onSaveDatabase={onSaveDatabase} 
             triggerToast={triggerToast} 
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsManager 
             dbData={dbData} 
             currentUser={currentUser} 
             onSaveDatabase={onSaveDatabase} 
             triggerToast={triggerToast} 
          />
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageFile={cropFile}
        aspectRatio={cropAspect}
        onClose={() => { setIsCropperOpen(false); setCropFile(null); setCropTarget(null); }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

