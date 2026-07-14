import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logoImg from '../assets/images/logo.webp';
import {
  Sparkles,
  Users,
  MapPin,
  Phone,
  User,
  Award,
  Download,
  Search,
  Plus,
  Trash2,
  Printer,
  X,
  CheckCircle,
  FileText,
  BookmarkCheck,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  ChevronDown,
  Building,
  Crown
} from 'lucide-react';
import { ChosenRegistration, ParishUnit } from '../types';

interface ChosenViewProps {
  dbData: any;
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
}

export default function ChosenView({ dbData, onSaveDatabase }: ChosenViewProps) {
  const registrations: ChosenRegistration[] = dbData?.chosenRegistrations || [];
  const units: ParishUnit[] = dbData?.units || [];

  const [activeView, setActiveView] = useState<'register' | 'directory'>('register');

  // Form input states
  const [participantName, setParticipantName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [houseName, setHouseName] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [gender, setGender] = useState('Boy');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fatherPhoneNumber, setFatherPhoneNumber] = useState('');
  const [position, setPosition] = useState('Delegate');
  const [shakha, setShakha] = useState('');
  const [shakhaDropdownOpen, setShakhaDropdownOpen] = useState(false);
  const [shakhaSearch, setShakhaSearch] = useState('');
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Draft items in the current session
  const [draftParticipants, setDraftParticipants] = useState<ChosenRegistration[]>([]);
  // Last successfully registered batch for direct download
  const [justRegisteredBatch, setLastRegisteredBatch] = useState<ChosenRegistration[] | null>(null);

  // Directory filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShakhaFilter, setSelectedShakhaFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'boys' | 'girls' | 'group'>('all');

  // Print Preview Dialog States
  const [printData, setPrintData] = useState<{ title: string; list: ChosenRegistration[]; parishName: string; categoryLetter: string } | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Category presets
  const categories = ['A', 'B', 'C', 'D'];
  const [selectedCategory, setSelectedCategory] = useState('B');

  const positionsPreset = [
    'President',
    'Vice President',
    'Secretary',
    'Joint Secretary',
    'Organizer',
    'Executive Member',
    'Delegate'
  ];

  const classOptions = [
    '8', '9', '10', '11', '12', 'College', 'Youth'
  ];

  const shakhaOptions = [
    'Kaliyar',
    'Vannappuram',
    'Thommankuth',
    'Kodikulam',
    'Koduvely',
    'Njarakkad',
    'Kadavoor',
    'Thennathoor',
    'Paingottoor',
    'Mullaringad',
    'Rajagiri',
    'Mundanmudy',
    'Punnamattom'
  ];

  // Helper matching to get detailed church addresses like the PDF layout
  const getFullChurchName = (shakhaName: string): string => {
    const name = (shakhaName || '').trim().toLowerCase();
    if (name.includes('kaliyar')) return 'St. Ritha Forane Church, Kaliyar';
    if (name.includes('kadavoor')) return 'St. George\'s Church, Kadavoor';
    if (name.includes('kodikulam')) return 'St. Ann\'s Church, Kodikulam';
    if (name.includes('koduvely')) return 'Little Flower Church, Koduvely';
    if (name.includes('mullaringad')) return 'B.V.M. Lourdes Church, Mullaringad';
    if (name.includes('mundanmudy')) return 'B.V.M Church, Mundanmudy';
    if (name.includes('njarakkad')) return 'St. Joseph\'s Church, Njarakkad';
    if (name.includes('paingottoor')) return 'St. Antony\'s Forane Church, Paingottoor';
    if (name.includes('punnamattom') || name.includes('punnamattam')) return 'St. Sebastian\'s Church, Punnamattam';
    if (name.includes('rajagiri')) return 'Christuraj Church, Rajagiri';
    if (name.includes('thennathoor')) return 'B.V.M. Fatima Church, Thennathoor';
    if (name.includes('thommankuthu') || name.includes('thommankuth')) return 'St. Thomas Church, Thommankuth';
    if (name.includes('vannappuram')) return 'Mar Sleeva Church, Vannappuram';
    return `${shakhaName} Parish Unit`;
  };

  const getPositionDetails = (pos: string) => {
    switch (pos) {
      case 'President':
        return {
          icon: <Crown className="w-4 h-4 text-amber-500" />,
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200/50',
          desc: 'Primary parish committee leader',
          badgeColor: 'bg-amber-100 text-amber-800'
        };
      case 'Vice President':
        return {
          icon: <Award className="w-4 h-4 text-emerald-500" />,
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
          desc: 'Supportive executive leader',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        };
      case 'Secretary':
        return {
          icon: <FileText className="w-4 h-4 text-blue-500" />,
          bgColor: 'bg-blue-50 text-blue-800 border-blue-200/50',
          desc: 'Official scribe and records supervisor',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'Joint Secretary':
        return {
          icon: <Users className="w-4 h-4 text-purple-500" />,
          bgColor: 'bg-purple-50 text-purple-800 border-purple-200/50',
          desc: 'Collaborative secretary partner',
          badgeColor: 'bg-purple-100 text-purple-800'
        };
      case 'Organizer':
        return {
          icon: <Sparkles className="w-4 h-4 text-rose-500" />,
          bgColor: 'bg-rose-50 text-rose-800 border-rose-200/50',
          desc: 'Lead administrator of events',
          badgeColor: 'bg-rose-100 text-rose-800'
        };
      case 'Executive Member':
        return {
          icon: <BookmarkCheck className="w-4 h-4 text-indigo-500" />,
          bgColor: 'bg-indigo-50 text-indigo-800 border-indigo-200/50',
          desc: 'Core policy decisions representative',
          badgeColor: 'bg-indigo-100 text-indigo-800'
        };
      case 'Delegate':
      default:
        return {
          icon: <User className="w-4 h-4 text-slate-500" />,
          bgColor: 'bg-slate-50 text-slate-800 border-slate-200/50',
          desc: 'Representing parish unit members',
          badgeColor: 'bg-slate-100 text-slate-800'
        };
    }
  };

  const handleAddToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!participantName.trim()) {
      setMessage({ type: 'error', text: 'Please enter participant name' });
      return;
    }
    if (!houseName.trim()) {
      setMessage({ type: 'error', text: 'Please enter house name' });
      return;
    }
    if (!fatherName.trim()) {
      setMessage({ type: 'error', text: 'Please enter father\'s/Guardian\'s name' });
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      return;
    }
    if (fatherPhoneNumber && fatherPhoneNumber.length < 10) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit parents contact number' });
      return;
    }
    if (!shakha) {
      setMessage({ type: 'error', text: 'Please select parish shakha' });
      return;
    }

    const newDraft: ChosenRegistration = {
      id: `chosen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      participantName: participantName.trim().toUpperCase(),
      fatherName: fatherName.trim(),
      houseName: houseName.trim(),
      className,
      gender,
      position,
      shakha,
      contactNumber: phoneNumber,
      parentsContactNumber: fatherPhoneNumber || phoneNumber,
      createdAt: new Date().toISOString()
    };

    setDraftParticipants((s) => [...s, newDraft]);
    setMessage({ type: 'success', text: `Added ${participantName.toUpperCase()} to draft batch list!` });
    
    // Reset individual participant inputs while maintaining shakha for rapid grid insertion
    setParticipantName('');
    setFatherName('');
    setHouseName('');
    setPhoneNumber('');
    setFatherPhoneNumber('');
  };

  // Submit Draft batch officially to base
  const handleSubmitBatchToLedger = async () => {
    if (draftParticipants.length === 0) {
      setMessage({ type: 'error', text: 'Your draft batch is empty!' });
      return;
    }

    const updatedRegistrations = [...registrations, ...draftParticipants];
    const updatedDb = { ...dbData, chosenRegistrations: updatedRegistrations };

    const success = await onSaveDatabase(
      updatedDb,
      'ADD_CHOSEN_REGISTRATIONS_BATCH',
      `${draftParticipants.length} registered from shakha ${draftParticipants[0].shakha}`
    );

    if (success) {
      setLastRegisteredBatch([...draftParticipants]);
      setDraftParticipants([]);
      setMessage({
        type: 'success',
        text: '🎉 Registration Batch successfully verified and processed!'
      });
    } else {
      setMessage({ type: 'error', text: 'Failed to synchronize registration with the server.' });
    }
  };

  const deleteFromDraft = (id: string) => {
    setDraftParticipants((s) => s.filter((x) => x.id !== id));
  };

  const handleDownloadCSV = (list: ChosenRegistration[], prefix = 'chosen') => {
    if (!list.length) return;
    const csvHeader = 'No.,Participant Name,Class,Gender,House Name,Father Name,Phone,Father Phone,Position,Shakha\n';
    const csvRows = list
      .map(
        (p, idx) =>
          `"${idx + 1}","${p.participantName}","${p.className || ''}","${p.gender || ''}","${p.houseName || ''}","${p.fatherName}","${p.contactNumber}","${p.parentsContactNumber}","${p.position}","${p.shakha}"`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Prepares data to show in exact PDF template with print modal
  const triggerPrintPreview = (list: ChosenRegistration[], title: string, forcedShakha?: string) => {
    const shakhaLabel = forcedShakha || (list.length > 0 ? list[0].shakha : 'General');
    const chapel = getFullChurchName(shakhaLabel);
    setPrintData({
      title,
      list,
      parishName: chapel,
      categoryLetter: selectedCategory
    });
  };

  const generateCleanPDF = async () => {
    if (!printData || !printData.list.length) {
      alert('No participants selected for export');
      return;
    }

    setIsPdfGenerating(true);

    try {
      // Preheat and load the logo image in memory
      let imgElement: HTMLImageElement | null = null;
      try {
        const img = new Image();
        img.src = logoImg;
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
        imgElement = img;
      } catch (imgLoadErr) {
        console.warn("Logo image preloading bypassed", imgLoadErr);
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // We'll wrap all pages drawing in a standard function
      const drawHeaderAndFooter = (pageDoc: typeof doc, pageNum: number, totalPages: number) => {
        // Modern Full Width Top Bar
        pageDoc.setFillColor(225, 29, 72); // rose-600
        pageDoc.rect(0, 0, 210, 3, 'F');

        // Draw Logo Image
        if (imgElement) {
          try {
            pageDoc.addImage(imgElement, 'JPEG', 15, 12, 22, 22);
          } catch (logoErr) {
            console.warn("Logo image drawing failed", logoErr);
          }
        } else {
          // Draw a soft backup crimson circle badge if we can't find logoImg
          pageDoc.setFillColor(251, 113, 133); // rose-400
          pageDoc.circle(26, 23, 11, 'F');
          pageDoc.setTextColor(255, 255, 255);
          pageDoc.setFont('helvetica', 'bold');
          pageDoc.setFontSize(9);
          pageDoc.text('CML', 26, 24, { align: 'center' });
        }

        // Vertical divider
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.setLineWidth(0.5);
        pageDoc.line(42, 12, 42, 34);

        // Title text - Line 1
        pageDoc.setTextColor(15, 23, 42); // slate-900
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.setFontSize(15);
        pageDoc.text('CHERUPUSHPA MISSION LEAGUE', 47, 19);

        // Title text - Line 2
        pageDoc.setTextColor(71, 85, 105); // slate-600
        pageDoc.setFontSize(11);
        pageDoc.text('KALIYAR MEKHALA', 47, 25);

        // Badge for Chosen Registration
        pageDoc.setFillColor(225, 29, 72); // rose-600
        pageDoc.roundedRect(47, 29, 44, 6, 1.5, 1.5, 'F');
        pageDoc.setTextColor(255, 255, 255);
        pageDoc.setFontSize(7.5);
        pageDoc.text('CHOSEN REGISTRATION', 69, 33.2, { align: 'center' });

        // Beautiful divider line
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.setLineWidth(0.5);
        pageDoc.line(15, 40, 195, 40);

        // Parish detail box with rounded rectangle shifted down slightly
        pageDoc.setFillColor(248, 250, 252); // slate-50
        pageDoc.roundedRect(15, 45, 180, 16, 2, 2, 'F');
        pageDoc.setDrawColor(241, 245, 249); // slate-100
        pageDoc.roundedRect(15, 45, 180, 16, 2, 2, 'D');

        pageDoc.setFontSize(7.5);
        pageDoc.setTextColor(148, 163, 184); // slate-400
        pageDoc.text('PARISH UNIT', 19, 50);

        pageDoc.setFontSize(11);
        pageDoc.setTextColor(15, 23, 42); // slate-900
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.text(printData.parishName.toUpperCase(), 19, 57);

        // Page info at bottom
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.setLineWidth(0.3);
        pageDoc.line(15, 275, 195, 275);

        pageDoc.setFont('helvetica', 'normal');
        pageDoc.setFontSize(7.5);
        pageDoc.setTextColor(148, 163, 184); // slate-400
        const dateStr = new Date().toLocaleDateString('en-GB');
        pageDoc.text(`Generated on ${dateStr} • Kaliyar Mekhala Official Ledger Connection`, 15, 281);
        pageDoc.text(`Page ${pageNum} of ${totalPages}`, 195, 281, { align: 'right' });
      };

      // Draw table headers helper
      const drawTableHeaders = (pageDoc: typeof doc, startY: number) => {
        pageDoc.setFillColor(241, 245, 249); // slate-100/75
        pageDoc.rect(15, startY, 180, 8, 'F');
        pageDoc.setDrawColor(226, 232, 240); // slate-200
        pageDoc.line(15, startY, 195, startY);
        pageDoc.line(15, startY + 8, 195, startY + 8);

        pageDoc.setFontSize(7.5);
        pageDoc.setFont('helvetica', 'bold');
        pageDoc.setTextColor(71, 85, 105); // slate-600

        pageDoc.text('NO.', 17, startY + 5.5);
        pageDoc.text('DELEGATE NAME', 26, startY + 5.5);
        pageDoc.text('GENDER', 76, startY + 5.5);
        pageDoc.text('CLASS', 92, startY + 5.5);
        pageDoc.text('HOUSE NAME', 106, startY + 5.5);
        pageDoc.text('CONTACT NO.', 146, startY + 5.5);
        pageDoc.text('POSITION', 171, startY + 5.5);
      };

      // Pre-calculate total pages
      const itemsPerPage = 20;
      const totalPages = Math.ceil(printData.list.length / itemsPerPage) || 1;

      for (let pNum = 1; pNum <= totalPages; pNum++) {
        if (pNum > 1) {
          doc.addPage();
        }

        drawHeaderAndFooter(doc, pNum, totalPages);

        let y = 67; // Starting Y coordinate for table elements on current page
        drawTableHeaders(doc, y);
        y += 8;

        const startIndex = (pNum - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, printData.list.length);
        const pageItems = printData.list.slice(startIndex, endIndex);

        pageItems.forEach((p, index) => {
          const globalIdx = startIndex + index;
          if (globalIdx % 2 === 1) {
            doc.setFillColor(248, 250, 252); // slate-50
            doc.rect(15, y, 180, 8, 'F');
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85); // slate-700
          
          // No.
          doc.text(String(globalIdx + 1), 17, y + 5.5);

          // Delegate Name
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text((p.participantName || '').toUpperCase(), 26, y + 5.5);

          // Gender
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(p.gender || 'Boy', 76, y + 5.5);

          // Class
          doc.text(p.className || '-', 92, y + 5.5);

          // House / Father name
          const houseText = (p.houseName || p.fatherName || '-').toUpperCase();
          const truncatedHouse = houseText.length > 20 ? houseText.substring(0, 18) + '..' : houseText;
          doc.text(truncatedHouse, 106, y + 5.5);

          // Contact
          doc.setFont('courier', 'normal');
          doc.setFontSize(7.5);
          doc.text(p.contactNumber || '-', 146, y + 5.5);

          // Position
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(225, 29, 72); // rose-600
          doc.text((p.position || 'Delegate').toUpperCase(), 171, y + 5.5);

          // Border bottom row
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.2);
          doc.line(15, y + 8, 195, y + 8);

          y += 8;
        });

        // Add Signature block at the end of the last page
        if (pNum === totalPages) {
          // Ensure we have enough space, else move it up slightly if table is full (max y is ~231, page is 297)
          const signatureY = Math.min(y + 25, 260); 
          
          doc.setDrawColor(148, 163, 184); // slate-400
          doc.setLineWidth(0.3);
          // Draw a small line for the signature
          doc.line(145, signatureY - 6, 195, signatureY - 6);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85); // slate-700
          doc.text('Signature of the Director', 195, signatureY, { align: 'right' });
        }
      }

      const filename = `CML_Registry_${printData.list[0]?.shakha || 'General'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('PDF Engine error:', e);
      // Fallback
      window.print();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Filter registrations for custom tab
  const filteredRegistrations = registrations.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      r.participantName.toLowerCase().includes(q) ||
      (r.houseName && r.houseName.toLowerCase().includes(q)) ||
      (r.fatherName && r.fatherName.toLowerCase().includes(q)) ||
      r.contactNumber.includes(q);

    const matchesShakha = selectedShakhaFilter === '' || r.shakha === selectedShakhaFilter;

    const matchesGender =
      genderFilter === 'all' ||
      genderFilter === 'group' ||
      (genderFilter === 'boys' && (r.gender || '').toLowerCase() === 'boy') ||
      (genderFilter === 'girls' && (r.gender || '').toLowerCase() === 'girl');

    return matchesSearch && matchesShakha && matchesGender;
  });

  // Map and group filtered registrations by Parish Shakha unit for the 'group' display view
  const groupedRegistrations = filteredRegistrations.reduce((acc, r) => {
    const key = r.shakha || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(r);
    return acc;
  }, {} as Record<string, ChosenRegistration[]>);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f8fafc] via-slate-50 to-[#f1f5f9] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-left">
              <span className="inline-block text-[10px] sm:text-xs font-black uppercase text-rose-600 tracking-widest font-mono bg-rose-50/70 border border-rose-250/30 px-3 py-1 rounded-full mb-2">
                CHERUPUSHPA MISSION LEAGUE KALIYAR MEKHALA
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight leading-none uppercase">CHOSEN REGISTRATION</h1>
            </div>
          </div>


        </div>

        {/* Global Feedback Banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl mb-8 flex items-start gap-3 text-left border shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
            )}
            <div>
              <span className="font-semibold text-sm block">{message.text}</span>
              {message.type === 'success' && justRegisteredBatch && (
                <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl flex flex-col gap-3">
                  <p className="text-xs text-emerald-805 font-medium">
                    📥 You can download and save your official Diocese compliant Registration PDF slip receipt right now. Keep this copy for the parish files as proof of registration.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => triggerPrintPreview(justRegisteredBatch, 'Official Registration Receipt')}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-rose-200" /> Download PDF Receipt
                    </button>
                    <button
                      onClick={() => handleDownloadCSV(justRegisteredBatch, 'registration_batch')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" /> Save CSV Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CONDITIONAL COMPONENT VIEWS */}
        <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Registration Form (2 cols) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-lg text-left">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">Add Participant Details</h2>
                </div>

                <form onSubmit={handleAddToBatch} className="space-y-6">
                  
                  {/* Basic Metadata Info */}
                  <div className="relative mt-2" id="shakha-select-container">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Parish unit / Shakha
                    </label>
                    
                    {/* Custom Dropdown Trigger */}
                    <button
                      type="button"
                      id="shakha-select-trigger"
                      onClick={() => setShakhaDropdownOpen(!shakhaDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/60 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-left cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-rose-55 flex items-center justify-center text-rose-500 shrink-0">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        {shakha ? (
                          <div className="overflow-hidden">
                            <p className="text-sm font-black text-slate-900 leading-none">{shakha}</p>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{getFullChurchName(shakha)}</p>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-400 select-none">-- Choose Parish Shakha --</span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-250 ${shakhaDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {/* Custom Dropdown Panel with Search */}
                    <AnimatePresence>
                      {shakhaDropdownOpen && (
                        <>
                          {/* Overlay element to close dropdown on click outside */}
                          <div 
                            className="fixed inset-0 z-40 cursor-default" 
                            id="shakha-dropdown-backdrop"
                            onClick={() => {
                              setShakhaDropdownOpen(false);
                              setShakhaSearch('');
                            }}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            id="shakha-dropdown-panel"
                            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden z-50 text-left"
                          >
                            {/* Search Box */}
                            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                              <input
                                type="text"
                                id="shakha-search-input"
                                placeholder="Search parish shakha or church..."
                                value={shakhaSearch}
                                onChange={(e) => setShakhaSearch(e.target.value)}
                                className="w-full bg-transparent border-0 py-1.5 px-1 focus:outline-none focus:ring-0 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-semibold"
                                autoFocus
                              />
                              {shakhaSearch && (
                                <button
                                  type="button"
                                  id="shakha-clear-search-btn"
                                  onClick={() => setShakhaSearch('')}
                                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Options List */}
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 p-1.5" id="shakha-options-list">
                              {shakhaOptions
                                .filter((s) => s.toLowerCase().includes(shakhaSearch.toLowerCase()) || getFullChurchName(s).toLowerCase().includes(shakhaSearch.toLowerCase()))
                                .map((s) => {
                                  const isSelected = shakha === s;
                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      id={`shakha-option-${s.toLowerCase()}`}
                                      onClick={() => {
                                        setShakha(s);
                                        setShakhaDropdownOpen(false);
                                        setShakhaSearch('');
                                      }}
                                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left cursor-pointer ${
                                        isSelected 
                                          ? 'bg-rose-50 text-rose-900 font-extrabold' 
                                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full transition-all duration-200 shrink-0 ${isSelected ? 'bg-rose-500 scale-125' : 'bg-transparent'}`} />
                                        <div>
                                          <p className={`text-sm tracking-tight ${isSelected ? 'font-black text-rose-800' : 'font-bold'}`}>{s}</p>
                                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-tight">{getFullChurchName(s)}</p>
                                        </div>
                                      </div>
                                      {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                                    </button>
                                  );
                                })}
                              {shakhaOptions.filter((s) => s.toLowerCase().includes(shakhaSearch.toLowerCase()) || getFullChurchName(s).toLowerCase().includes(shakhaSearch.toLowerCase())).length === 0 && (
                                <div className="p-4 text-center text-slate-400 text-xs font-medium" id="shakha-no-results">
                                  No matching parish unit found
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Primary Name Details */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Participant Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="e.g. ANCELINA ABY"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm placeholder:opacity-60"
                    />
                  </div>

                  {/* Gender Designation & Class */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        Gender Designation
                      </label>
                      <div className="flex gap-3 p-1.5 bg-slate-100/60 border border-slate-200 rounded-xl">
                        {['Boy', 'Girl'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`flex-1 py-2.5 text-xs font-black tracking-wider uppercase rounded-lg transition-all duration-200 border cursor-pointer ${
                              gender === g
                                ? g === 'Boy'
                                  ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-sm ring-4 ring-sky-500/10'
                                  : 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm ring-4 ring-rose-500/10'
                                : 'bg-white/80 text-slate-600 border-slate-200/40 hover:text-slate-900 hover:bg-white/100 hover:shadow-xs'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        Class
                      </label>
                      <input
                        type="text"
                        required
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="e.g. Class 10, College, LKG"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm placeholder:opacity-60"
                      />
                    </div>
                  </div>

                  {/* House and Family Lineage */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        House Name
                      </label>
                      <input
                        type="text"
                        required
                        value={houseName}
                        onChange={(e) => setHouseName(e.target.value)}
                        placeholder="e.g. Mundackal"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm placeholder:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        Father's / Guardian's Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="e.g. Aby K.J."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm placeholder:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Contacts and Position */}
                  <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Participants Contact Number
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Participant contact"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm placeholder:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Parents Contact Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={fatherPhoneNumber}
                        onChange={(e) => setFatherPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Parent contact (optional)"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm placeholder:opacity-60"
                      />
                    </div>

                    <div className="relative" id="position-select-container">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        Position / Designation
                      </label>
                      
                      {/* Styled Dropdown Trigger */}
                      <button
                        type="button"
                        id="position-select-trigger"
                        onClick={() => setPositionDropdownOpen(!positionDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/60 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-left cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">{position}</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-250 ${positionDropdownOpen ? 'transform rotate-180' : ''}`} />
                      </button>

                      {/* Custom Listbox Dropdown Overlay & Panel */}
                      <AnimatePresence>
                        {positionDropdownOpen && (
                          <>
                            {/* Backdrop to dismiss on click outside */}
                            <div 
                              className="fixed inset-0 z-40 cursor-default" 
                              id="position-dropdown-backdrop"
                              onClick={() => setPositionDropdownOpen(false)}
                            />
                            
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.98 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              id="position-dropdown-panel"
                              className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden z-50 text-left p-1.5 space-y-1"
                            >
                              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 select-none">
                                Select Position / Designation
                              </div>
                              <div className="max-h-[285px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-200">
                                {positionsPreset.map((p) => {
                                  const details = getPositionDetails(p);
                                  const isSelected = position === p;
                                  return (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => {
                                        setPosition(p);
                                        setPositionDropdownOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-150 text-left cursor-pointer group ${
                                        isSelected 
                                          ? 'bg-rose-50 text-rose-900 font-bold' 
                                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div>
                                          <p className={`text-xs font-black leading-none ${isSelected ? 'text-rose-950' : 'text-slate-800'}`}>
                                            {p}
                                          </p>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-rose-500 shrink-0 ml-2 animate-fade-in" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Batch Action */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Delegate to Draft List
                    </button>
                  </div>

                </form>
              </div>
            </div>

            {/* Quick Stats Summary Right (1 col) */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 text-white text-left relative overflow-hidden shadow-lg border border-slate-800">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-rose-500/10 rounded-full blur-xl" />
                
                <h3 className="text-base font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-rose-500" /> Registry Tally
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400">Total Registered</span>
                    <span className="text-3xl font-black text-rose-500">{registrations.length}</span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400">Parishes Reporting</span>
                    <span className="text-xl font-black text-white">
                      {new Set(registrations.map(r => r.shakha)).size} / 13
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-3xl text-left text-xs text-amber-900">
                <h4 className="font-extrabold uppercase tracking-wider mb-2 text-amber-800">Coordinator Checkbox</h4>
                <ul className="list-disc list-inside space-y-1 text-amber-950 font-medium">
                  <li>You can register multiple delegates at once.</li>
                  <li>Click <strong>"Verify & Submit Batch"</strong> at bottom once finished to transmit.</li>
                  <li>Download the mekhala compliance list immediately upon submission!</li>
                </ul>
              </div>
            </div>

            {/* Draft Batch List Table - Spans full row */}
            {draftParticipants.length > 0 && (
              <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-lg text-left">
                <div className="p-6 bg-slate-50 border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase">Current Batch Registrants ({draftParticipants.length})</h3>
                    <p className="text-slate-500 text-xs">These participants are loaded inside your device's memory. Review below, then finalize submission.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerPrintPreview(draftParticipants, 'Local Draft List')}
                      className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 font-extrabold text-[10px] tracking-wide uppercase text-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Preview PDF Layout
                    </button>

                    <button
                      onClick={handleSubmitBatchToLedger}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-md shadow-emerald-100 active:scale-95 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Confirm & Register Batch
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100/60 border-b border-slate-200">
                        <th className="px-6 py-4. font-bold text-slate-700 text-left text-xs uppercase tracking-wider w-12">#</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-left text-xs uppercase tracking-wider">Participant Name</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-left text-xs uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-left text-xs uppercase tracking-wider">House Name</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-left text-xs uppercase tracking-wider">Father Name</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-left text-xs uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-center text-xs uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {draftParticipants.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-rose-50/20 transition duration-150">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-6 py-4 font-black text-slate-900 uppercase">{p.participantName}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${p.gender === 'Boy' ? 'bg-sky-50 text-sky-800' : 'bg-pink-50 text-pink-800'}`}>
                              {p.gender}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{p.houseName}</td>
                          <td className="px-6 py-4 text-slate-600">{p.fatherName}</td>
                          <td className="px-6 py-4 font-mono text-slate-600">{p.contactNumber}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => deleteFromDraft(p.id)}
                              className="p-1.5 hover:bg-rose-100 hover:text-rose-600 text-slate-400 rounded-lg transition"
                              title="Discard"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

      </div>

      {/* PIXEL-PERFECT DIOCESE PDF PRINT PREVIEW OVERLAY MODAL */}
      <AnimatePresence>
        {printData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-slate-950/80 z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl my-8 text-slate-900"
            >
              
              {/* Toolbar Controls */}
              <div className="sticky top-0 bg-slate-100 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center rounded-t-3xl z-10">
                <div className="text-left">
                  <p className="text-[11px] text-[#059669] font-bold">
                    💡 Click "DOWNLOAD PDF" below to save.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={generateCleanPDF}
                    disabled={isPdfGenerating}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest py-2.5 px-5 rounded-xl shadow-md transition"
                  >
                    <Download className="w-4 h-4" /> {isPdfGenerating ? 'Generating...' : 'DOWNLOAD PDF  '}
                  </button>
                  
                  <button
                    onClick={() => setPrintData(null)}
                    className="p-2.5 hover:bg-slate-200 bg-slate-150 rounded-xl transition text-slate-600 hover:text-slate-950"
                  >
                    <X className="w-5 h-5 flex-shrink-0" />
                  </button>
                </div>
              </div>

              {/* PRINT ELEMENT SHEET CONTAINER */}
              <div className="p-4 sm:p-10 bg-slate-50 max-h-[75vh] overflow-y-auto">
                <div
                  id="printable-content"
                  className="mx-auto bg-white p-6 sm:p-10 border border-slate-200 shadow-md max-w-[210mm] text-left relative"
                  style={{ width: '100%', minHeight: '297mm', boxSizing: 'border-box' }}
                >
                  
                  {/* Image Header with Logos matching screenshot perfectly */}
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
                    
                    {/* Left: Circled CML Logo with typography */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center p-0.5">
                        <img loading="lazy"
                          src={logoImg}
                          alt="CML"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-left">
                        <h1 className="text-base sm:text-lg font-black font-display text-slate-900 tracking-tight leading-none uppercase">
                          CHERUPUSHPA MISSION LEAGUE KALIYAR MEKHALA
                        </h1>
                        <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mt-1">
                          Chosen Registration
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Soft Light Blue Card Callout Box exactly matching screenshot */}
                  <div className="mb-6 p-4 rounded-xl border border-slate-100 bg-[#f8fafc] text-xs font-sans">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">PARISH UNIT</span>
                      <h4 className="text-base font-extrabold text-[#0f172a] leading-none">
                        {printData.parishName}
                      </h4>
                    </div>
                  </div>

                  {/* Main Table Styled identically to the compliance sheet */}
                  <div className="mb-10 overflow-x-auto">
                    <table className="w-full border-collapse border-b border-slate-150 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100/75 border-t border-b border-slate-200 text-slate-500 font-bold">
                          <th className="px-4 py-3 text-left w-12 text-[#475569] tracking-wider uppercase">No.</th>
                          <th className="px-4 py-3 text-left font-bold text-[#475569] tracking-wider uppercase">Participant Name</th>
                          <th className="px-4 py-3 text-left font-bold text-[#475569] tracking-wider uppercase">Gender</th>
                          <th className="px-4 py-3 text-left font-bold text-[#475569] tracking-wider uppercase">Class</th>
                          <th className="px-4 py-3 text-left font-bold text-[#475569] tracking-wider uppercase">House Name</th>
                          <th className="px-4 py-3 text-left font-bold text-[#475569] tracking-wider uppercase">Phone</th>
                          <th className="px-4 py-3 text-left font-bold text-[#475569] tracking-wider uppercase">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printData.list.map((p, idx) => (
                          <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-extrabold text-[#0f172a] text-xs tracking-wide uppercase">
                              {p.participantName}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-slate-650">{p.gender || 'Boy'}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-650">{p.className || '-'}</td>
                            <td className="px-4 py-2.5 text-slate-600 font-semibold">{p.houseName || p.fatherName}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-600 tracking-wider">{p.contactNumber}</td>
                            <td className="px-4 py-2.5 font-bold text-rose-600 uppercase text-[10px]">{p.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Director Seal Signature footer */}
                  <div className="absolute bottom-16 left-10 right-10 pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <div className="w-48 border-b border-slate-200 mb-1.5" />
                        <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest">DIRECTOR</h4>
                        <span className="text-[10px] text-slate-400 font-medium italic">(Signature & Seal)</span>
                      </div>

                    </div>
                  </div>

                  {/* Official Base layout credits matching screenshot */}
                  <div className="absolute bottom-6 left-10 right-10 flex justify-between text-[9px] font-bold text-slate-400 border-t border-slate-100 pt-3">
                    <span>Generated on {new Date().toLocaleDateString('en-GB')} • Page 1 of 1</span>
                  </div>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded print styles so when browser prints, only #printable-content triggers */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #printable-content, #printable-content * {
            visibility: visible !important;
          }
          #printable-content {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            z-index: 99999;
          }
        }
      `}</style>
    </div>
  );
}

