/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  History, 
  Award, 
  Heart, 
  BookOpen, 
  Compass, 
  Sparkles, 
  Flame, 
  ChevronRight,
  Anchor,
  UserCheck,
  Trophy,
  Shield,
  Globe
} from 'lucide-react';
import thereseImg from '../assets/images/st_therese.png';
import founderPriestImg from '../assets/images/director.png';
import founderLaymanImg from '../assets/images/founder.png';
import cmlFlagImg from '../assets/images/flag.png';
import cmlEmblemImg from '../assets/images/logo.png';

export default function HistoryView() {
  const [activeVisual, setActiveVisual] = React.useState<'flag' | 'emblem'>('flag');
  const [activeLyric, setActiveLyric] = React.useState<'malayalam' | 'manglish'>('malayalam');
  
  const milestones = [
    {
      year: '1947',
      title: 'A lay movement is born',
      subtitle: 'The dawn of Cherupushpa Mission League in Bharananganam',
      desc: 'Fr. Joseph Maliparambil and P. C. Abraham Pallattukunnel launch CML in Bharananganam during the centenary of St. Therese of Lisieux, inspiring children to become active lay missionaries inside their homes and parishes.',
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      tag: 'CHAPTER 01',
      bgGradient: 'from-rose-50/50 via-white to-white border-rose-200/65'
    },
    {
      year: '1947',
      title: 'Episcopal recognition',
      subtitle: 'Hierarchical blessings to support parish expansion',
      desc: 'Bishop James Kalacherry and Bishop Thomas Tharayil bless the infant movement, ensuring every parish can host a regional unit and receive standardized spiritual formation tools.',
      icon: <Award className="w-5 h-5 text-amber-600" />,
      tag: 'CHAPTER 02',
      bgGradient: 'from-amber-50/50 via-white to-white border-amber-200/65'
    },
    {
      year: '1948',
      title: 'Papal Blessings by Pope Pius XII',
      subtitle: 'Worldwide Apostolic Seal and Endorsement',
      desc: "Recognizing the highly innovative approach of making youngsters active ambassadors of Christ, Fr. Joseph Maliparambil presented CML's Constitution to Pope Pius XII in Roman audience. The Holy Father personally blessed and endorsed the Constitution, guiding its worldwide expansion.",
      icon: <BookOpen className="w-5 h-5 text-sky-600" />,
      tag: 'CHAPTER 03',
      bgGradient: 'from-sky-50/50 via-white to-white border-sky-200/65'
    },
    {
      year: '1968',
      title: 'Vocation Bureau opens',
      subtitle: 'Nurturing priestly and religious vocations',
      desc: 'CML establishes an India-first vocation bureau in Bharananganam (later the Kerala Vocation Service Centre) to accompany youth discerning priesthood and consecrated life.',
      icon: <Flame className="w-5 h-5 text-orange-600" />,
      tag: 'CHAPTER 04',
      bgGradient: 'from-orange-50/50 via-white to-white border-orange-200/65'
    },
    {
      year: '1972',
      title: 'The Silver Jubilee Milestone',
      subtitle: '25 Years of Lay Missionary Fire',
      desc: "CML celebrated its Silver Jubilee marking a massive spiritual explosion. By this milestone, the league was formally established as a major engine of apostolic lay vocations across various Indian states.",
      icon: <History className="w-5 h-5 text-indigo-600" />,
      tag: 'CHAPTER 05',
      bgGradient: 'from-indigo-50/50 via-white to-white border-indigo-200/65'
    },
    {
      year: '1977',
      title: 'KCBC endorsement',
      subtitle: 'Official recognition across Kerala dioceses',
      desc: 'The Kerala Catholic Bishops\' Council (KCBC) formally recognises CML, cementing the league\'s place in every diocese of the state.',
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      tag: 'CHAPTER 06',
      bgGradient: 'from-emerald-50/50 via-white to-white border-emerald-200/65'
    },
    {
      year: '1981',
      title: 'National mandate',
      subtitle: 'Expanding frontiers beyond regional limits',
      desc: 'The Catholic Bishops\' Conference of India (CBCI) acknowledges CML as a national lay missionary movement, encouraging dioceses outside Kerala to replicate the model.',
      icon: <Compass className="w-5 h-5 text-pink-600" />,
      tag: 'CHAPTER 07',
      bgGradient: 'from-pink-50/50 via-white to-white border-pink-200/65'
    },
    {
      year: '1990',
      title: 'Mission commission partner',
      subtitle: 'Structural incorporation for strategic formation',
      desc: 'KCBC folds CML into the Commission for Church\'s Extension and Vocation so diocesan plans always reserve space for missionary formation.',
      icon: <Anchor className="w-5 h-5 text-teal-600" />,
      tag: 'CHAPTER 08',
      bgGradient: 'from-teal-50/50 via-white to-white border-teal-200/65'
    },
    {
      year: '1997',
      title: 'The Golden Jubilee of CML',
      subtitle: '50 Years of Lay Apostle Development',
      desc: 'Celebrating 50 glorious years of training little apostles in parishes over India, CML hosted massive international youth conferences and conventions, establishing itself as Asia\'s single largest lay children\'s movement.',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      tag: 'CHAPTER 09',
      bgGradient: 'from-amber-50/50 via-white to-white border-amber-200/65'
    },
    {
      year: '2016',
      title: 'Syro-Malabar oversight',
      subtitle: 'Reaffirming the original missionary DNA',
      desc: 'The Syro-Malabar Bishops\' Council takes direct responsibility for CML with the Major Archbishop as patron, reaffirming the original missionary DNA.',
      icon: <Shield className="w-5 h-5 text-violet-600" />,
      tag: 'CHAPTER 10',
      bgGradient: 'from-violet-50/50 via-white to-white border-violet-200/65'
    },
    {
      year: '2022',
      title: 'The Platinum Jubilee Celebration',
      subtitle: '75 Years of Missionary Powerhouse',
      desc: 'Celebrating 75 years of rich legacy under the theme "Platinum Grace". CML is internationally celebrated for having nurtured and inspired over 45,000 vocations to priesthood and consecrated religious life globally.',
      icon: <Globe className="w-5 h-5 text-blue-600" />,
      tag: 'CHAPTER 11',
      bgGradient: 'from-blue-50/50 via-white to-white border-blue-200/65'
    }
  ];

  const founders = [
    {
      name: 'Fr. Joseph Maliparambil',
      role: 'The Spiritual Architect (Co-Founder)',
      bio: 'A visionary priest whose burning love for world evangelization catalyzed the movement. He authored the first constitution, modeling it after Saint Thérèse\'s Carmelite spiritual ideals of the "Little Way," guiding souls toward prayer and simple sacrificial collections.',
      initial: 'JM',
      accentColor: 'rose',
      img: founderPriestImg
    },
    {
      name: 'Mr. P.C. Abraham Kunjettan',
      role: 'The Lay Pioneer (Co-Founder)',
      bio: 'Fondly addressed as "CML Kunjettan", he was a selfless lay leader who traveled tirelessly across villages to set up parish units. His magnetic charm on children and youth established CML as Asia\'s single largest children\'s movement of the 20th century.',
      initial: 'KA',
      accentColor: 'amber',
      img: founderLaymanImg
    }
  ];

  return (
    <div className="w-full bg-[#fcf9f6] relative py-12 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Premium Warm Sacred Ambient Glows & Patterns */}
      <div className="absolute top-0 left-12 w-[650px] h-[650px] bg-radial from-rose-100/60 via-rose-550/10 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-radial from-amber-100/40 via-amber-50/5 to-transparent pointer-events-none z-0"></div>
      <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] bg-radial from-rose-100/30 via-transparent to-transparent pointer-events-none z-0"></div>
      
      {/* Structural crosshairs alignment background lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none z-0" style={{ backgroundImage: 'radial-gradient(#9f1239 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="max-w-6xl mx-auto flex flex-col gap-10 text-left relative z-10">
        
        {/* Editorial Title & Header Block */}
        <div className="flex flex-col gap-6 border-b border-rose-100 pb-6 relative overflow-visible">
          {/* Giant watermark */}
          <div className="absolute -top-12 -left-4 text-[130px] sm:text-[180px] font-black text-rose-900/[0.03] select-none pointer-events-none font-serif tracking-tighter leading-none">
            1947
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-rose-100 text-[#be123c] text-[10px] font-black tracking-widest uppercase rounded-full shadow-sm animate-fade-in select-none">
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
              </span>
              Discover Our Sacred Roots
            </div>
            <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-rose-200 to-transparent" />
            <span className="text-xs font-serif font-black text-rose-800/40 uppercase tracking-widest hidden sm:block">
              Estd. 1947
            </span>
          </div>
          
          <div className="flex flex-col gap-5 relative z-10">
            <h2 className="font-serif font-black text-4xl sm:text-6xl text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
              Our Glorious <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#be123c] to-rose-600">Legacy</span>
            </h2>
            

          </div>
        </div>

        {/* Narrative & Patroness Spotlight */}
        <div className="bg-white rounded-[32px] border border-rose-100 p-6 sm:p-10 flex flex-col md:flex-row gap-8 sm:gap-10 items-center shadow-xs group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Curved gold frame matching home view */}
          <div className="w-32 h-[164px] rounded-t-full rounded-b-[24px] overflow-hidden shrink-0 border-[4px] border-amber-500/90 shadow-xl relative group-hover:scale-105 transition-transform duration-500 p-1 bg-white">
            <div className="w-full h-full rounded-t-full rounded-b-[18px] overflow-hidden bg-rose-950">
              <img loading="lazy"
                src={thereseImg}
                alt="Saint Thérèse of Lisieux"
                className="w-full h-full object-cover object-top hover:scale-115 transition-transform duration-750"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3.5 text-left flex-1 relative z-10">
            <div className="inline-flex py-1 px-3 bg-rose-50 border border-rose-100 rounded-full text-[9px] text-[#be123c] font-black tracking-widest font-mono uppercase self-start">
              Saint of the Little Way
            </div>
            <h4 className="font-serif font-black text-xl sm:text-2xl text-slate-950 leading-tight">
              Our Patroness: Saint Thérèse of Lisieux (Cherupushpam)
            </h4>

            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xs font-bold italic text-rose-800 bg-rose-50/70 border border-rose-100 px-4 py-1.5 rounded-full shadow-3xs">
                "My vocation is Love!" � Saint Thérèse
              </span>
            </div>
          </div>
        </div>

        {/* Co-Founders Block */}
        <div className="flex flex-col gap-8">
          <div className="border-b border-rose-100 pb-4">
            <span className="text-[10px] font-mono font-black text-[#be123c] uppercase tracking-widest block mb-1.5">THE VISIONARY LEADERSHIP</span>
            <h3 className="font-serif font-black text-2xl sm:text-3.5xl text-slate-900 tracking-tight leading-none">
              Founding Pillars
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((founder, index) => (
              <div 
                key={index} 
                className="bg-white rounded-[32px] border border-slate-200/60 p-6 sm:p-8 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-6 group relative overflow-hidden text-left"
              >
                {/* Holder Archival Portrait Photo */}
                <div className="w-24 h-[120px] sm:w-[100px] sm:h-[135px] rounded-t-full rounded-b-[18px] overflow-hidden shrink-0 border-[3.5px] border-amber-500/85 shadow-md group-hover:scale-105 transition-all duration-300 relative self-start mx-auto sm:mx-0 p-1 bg-white">
                  <div className="w-full h-full rounded-t-full rounded-b-[14px] overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img loading="lazy" 
                      src={founder.img} 
                      alt={founder.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top bg-white"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent rounded-t-full rounded-b-[14px]" />
                </div>

                <div className="flex flex-col gap-3 text-center sm:text-left flex-1 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-black text-[#be123c] uppercase tracking-wider block mb-0.5">
                      {founder.role}
                    </span>
                    <h4 className="font-serif font-black text-lg text-slate-950 leading-tight">
                      {founder.name}
                    </h4>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed font-semibold">
                    {founder.bio}
                  </p>
                </div>

                {/* Right side decorative quote sign */}
                <span className="absolute right-4 bottom-1 text-7xl font-serif text-slate-100/50 pointer-events-none select-none group-hover:text-amber-100/60 transition-colors duration-300">⬝</span>
              </div>
            ))}
          </div>
        </div>

        {/* CML Historic Treasures Showcase Spotlight */}
        <div id="cml-symbols-showcase" className="bg-white rounded-[32px] border border-rose-100 p-6 sm:p-10 flex flex-col md:flex-row gap-8 sm:gap-10 items-stretch shadow-xs relative overflow-hidden">
          <div className="absolute left-0 bottom-0 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-full md:w-[38%] flex flex-col gap-4 shrink-0 justify-between">
            {/* Visual Switcher Toggle Header */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner select-none">
              <button 
                id="select-cml-flag"
                onClick={() => setActiveVisual('flag')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeVisual === 'flag' ? 'bg-white text-[#be123c] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                �x��️ Official Flag
              </button>
              <button 
                id="select-cml-emblem"
                onClick={() => setActiveVisual('emblem')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeVisual === 'emblem' ? 'bg-white text-[#be123c] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                �x:�️ Sacred Emblem
              </button>
            </div>

            {/* Display Area */}
            <div className="relative flex-1 min-h-[310px] rounded-2xl overflow-hidden border border-amber-300 shadow-md flex items-center justify-center bg-slate-950 transition-all duration-500 group">
              {activeVisual === 'flag' ? (
                /* FLAG VISUAL */
                <div className="absolute inset-0 flex flex-col select-none animate-fade-in">
                  <img loading="lazy" 
                    src={cmlFlagImg} 
                    alt="CML Official Flag" 
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Floating label */}
                  <div className="absolute bottom-3 inset-x-3 flex justify-center z-10">
                    <span className="text-[9px] font-mono font-black tracking-widest text-[#be123c] bg-white/95 backdrop-blur-md py-1 px-3 rounded-full shadow-md border border-[#be123c]/20 uppercase">
                      OFFICIAL TRI-BAND FLAG
                    </span>
                  </div>
                </div>
              ) : (
                /* EMBLEM ZOOM VISUAL */
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none animate-fade-in bg-[#fcf9f6] p-4">
                  <img loading="lazy" 
                    src={cmlEmblemImg} 
                    alt="CML Official Emblem" 
                    className="w-auto h-full max-h-[280px] aspect-square object-cover object-center rounded-full shadow-xl border-4 border-amber-400/20"
                  />
                  {/* Absolute label for emblem */}
                  <div className="absolute bottom-3 inset-x-3 flex justify-center z-10">
                    <span className="text-[9px] font-mono font-black tracking-widest text-amber-500 bg-slate-900 border border-amber-500/35 py-1 px-3 rounded-full shadow-md uppercase">
                      OFFICIAL C.M.L. EMBLEM
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col justify-between gap-6 text-left flex-1 relative z-10">
            <div className="flex flex-col gap-3">
              <div className="inline-flex py-1 px-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[9px] font-mono font-black tracking-widest uppercase self-start">
                {activeVisual === 'flag' ? 'SYMBOL OF LAY MISSIONARY ZEAL' : 'THE SACRED CARMELITE EMBLEM'}
              </div>
              <h4 className="font-serif font-black text-2xl text-slate-900 leading-tight">
                {activeVisual === 'flag' ? 'The Official CML Flag' : 'The Official CML Emblem & Slogan'}
              </h4>

              {activeVisual === 'flag' ? (
                <>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    The official flag of Cherupushpa Mission League is a glorious, standard horizontal tri-band featuring: <strong className="text-amber-600 font-extrabold">Yellow on the top and bottom</strong>, with a <strong className="text-[#be123c] font-extrabold">central Red stripe</strong>. It is hoisted at every major unit conference and official parish gathering.
                  </p>
                  
                  {/* Detailed explanation parameters for Flag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                    <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100/70 text-left">
                      <span className="text-[10px] font-mono font-black text-amber-700 block mb-1">�xx� THE YELLOW STRIPES (TOP & BOTTOM)</span>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        Represent the bright light of divine grace, royalty to the Holy Catholic Church, and Papal apostolic blessings.
                      </p>
                    </div>
                    <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100/70 text-left">
                      <span className="text-[10px] font-mono font-black text-[#be123c] block mb-1">�x� THE CENTRAL RED STRIPE</span>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        Signifies sacrificial fire, missionary zeal, courageous spirit, and willingness to stand firm witnessing for Christ.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                    The official Sacred Seal of CML is highly rich in symbolism, carrying elements that represent the universal call to mission and the core pillars of the organization.
                  </p>
                  
                  {/* Detailed explanation parameters for Emblem */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-left">
                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1 text-sky-700">
                        <span className="text-sm">�xR�</span>
                        <span className="text-[10px] font-mono font-black">THE GLOBE</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        Represents the universal scope of the organization's mission to spread the gospel to the ends of the earth.
                      </p>
                    </div>
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1 text-[#be123c]">
                        <span className="text-sm">�S�️</span>
                        <span className="text-[10px] font-mono font-black">THE HOLY CROSS</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        Stands tall at the center, signifying our unwavering loyalty to Christ and the gospel of salvation.
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1 text-amber-700">
                        <span className="text-xs">�x</span>
                        <span className="text-[10px] font-mono font-black">THE HOLY BIBLE</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        The open Word of God serves as the foundation of our faith and the ultimate guide for a missionary's life.
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1 text-orange-700">
                        <span className="text-sm">�x�</span>
                        <span className="text-[10px] font-mono font-black">THE LIGHTED LAMP</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        Held up by devoted hands, it symbolizes passing the light of Christ to dispel darkness through selfless service.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2 bg-gradient-to-r from-emerald-50/65 via-teal-50/30 to-emerald-50/45 border-l-4 border-emerald-600 pl-4 pr-3 py-3 rounded-r-2xl">
              <span className="text-[9px] font-mono font-black text-emerald-700 tracking-widest uppercase">
                OUR VISION & MISSION
              </span>
              <p className="text-slate-900 font-serif font-black text-base italic leading-tight">
                "To ignite the missionary spirit in every child, nurturing them to become active apostles of Christ through love, service, and sacrifice."
              </p>
            </div>
          </div>
        </div>
        {/* Anthem Section */}
        <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50/80 via-rose-50/40 to-orange-50/80 border border-amber-200/40 shadow-sm p-6 sm:p-10 lg:p-12">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-200/60 shadow-sm mb-5">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-rose-600 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg"><path d="M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"></path></svg>
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-rose-700">Mission Anthem</span>
            </div>
            <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-none mb-5 drop-shadow-sm">
              Bharathame Nin Raksha <br className="hidden sm:block" /> Nin Makkalil
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              Sung before every CML gathering, the anthem captures the core motto of love, sacrifice, service, and suffering.
            </p>
          </div>
          
          {/* Mobile Lyric Toggle */}
          <div className="relative z-10 flex lg:hidden items-center justify-center mb-6">
            <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-full border border-slate-200/60 shadow-sm">
              <button
                onClick={() => setActiveLyric('malayalam')}
                className={`px-4 py-2 rounded-full text-xs font-black tracking-[0.1em] transition-all duration-300 ${
                  activeLyric === 'malayalam'
                    ? 'bg-amber-100 text-amber-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                MALAYALAM
              </button>
              <button
                onClick={() => setActiveLyric('manglish')}
                className={`px-4 py-2 rounded-full text-xs font-black tracking-[0.1em] transition-all duration-300 ${
                  activeLyric === 'manglish'
                    ? 'bg-rose-100 text-rose-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                MANGLISH
              </button>
            </div>
          </div>

          {/* Lyrics Grid */}
          <div className="relative z-10 grid gap-6 lg:gap-8 lg:grid-cols-2">
            
            {/* Malayalam Card */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 ${activeLyric === 'malayalam' ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center gap-3 mb-8 border-b border-amber-100/60 pb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-lg">മ</div>
                <h4 className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-700">
                  Malayalam Lyrics
                </h4>
              </div>
              <div 
                className="flex flex-col gap-3.5 text-sm sm:text-base text-slate-800 font-bold leading-relaxed tracking-wide"
                style={{ fontFamily: "'Noto Serif Malayalam', serif" }}
              >
                <p>ഭാരതമ�! നിൻ ര�"്ഷ നിൻ മ�"്�"ളിൽ</p>
                <p>� ർഷ പ�വനമ�! നിൻ ശാന്തി നിൻ �"���"ളിൽ</p>
                <p>സ�9ദരര�! �"���"�9ർത്ത് മുന്ന�!റുവിൻ</p>
                <p>സത്യ�"ാഹള� മുഴ�"്�"ി മുന്ന�!റുവിൻ</p>
                <p className="pt-2 text-slate-600">�a� മ്മ�~്�~ �"�`�xി പി�xി�"്�"ു� �"���"ൾ</p>
                <p className="text-slate-600">�"്രിസ്തുവിനായ് പണിയ� �xു�"്�"ു� �"���"ൾ</p>
                <p className="text-slate-600">വയലു�"ള�  വിള�~്�~ വയലു�"ള� </p>
                <p className="text-slate-600">വിളവ� �xു�"്�"ുവാൻ �~�"്�"ൾ �&ണിനിര�"്�"ുന്നു</p>
                <p className="pt-2 text-slate-600">സ്ന�!ഹവു� ത്യാ�വു� നു�"ർന്ന് �~�"്�"ൾ</p>
                <p className="text-slate-600">സ�!വനത്തിന ദ�തരായി വരുന്നിതാ</p>
                <p className="text-slate-600">�"ര�"ളു� തിര�"ളു� �"�xന്ന് �~�"്�"ൾ</p>
                <p className="text-slate-600">സുവിശ�!ഷ ദ�തരായ് വരുന്നിതാ</p>
                <p className="pt-2">ഭാരതമ�! നിൻ ര�"്ഷ നിൻ മ�"്�"ളിൽ</p>
                <p>� ർഷ പ�വനമ�! നിൻ ശാന്തി നിൻ �"���"ളിൽ</p>
                <p>സ�9ദരര�! �"���"�9ർത്ത് മുന്ന�!റുവിൻ</p>
                <p>സത്യ�"ാഹള� മുഴ�"്�"ി മുന്ന�!റുവിൻ</p>
                <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100/50 text-center">
                  <p className="text-rose-700 font-black text-lg">മുന്ന�!റുവിൻ</p>
                  <p className="text-rose-700 font-black text-lg">മുന്ന�!റുവിൻ</p>
                </div>
              </div>
            </div>

            {/* Manglish Card */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 ${activeLyric === 'manglish' ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center gap-3 mb-8 border-b border-rose-100/60 pb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-serif font-bold text-lg">M</div>
                <h4 className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-700">
                  Manglish Lyrics
                </h4>
              </div>
              <div className="flex flex-col gap-3.5 text-sm sm:text-base text-slate-700 font-semibold leading-relaxed tracking-wide">
                <p>Bharathame Nin Raksha Nin Makkalil</p>
                <p>Aarsha Poovaname Nin Shanthi Nin Kaikalil</p>
                <p>Sodharare Kaikorthu Munneruvin</p>
                <p>Sathya Kaahalam Muzhakki Munneruvin</p>
                <p className="pt-2 text-slate-500">Chemmanja Kodi Pidikkum Kaikal</p>
                <p className="text-slate-500">Kristhuvinaai Paniyedukkum Kaikal</p>
                <p className="text-slate-500">Vayalukale Vilanja Vayalukale</p>
                <p className="text-slate-500">Vilavedukkuvaan Njangal Ani Nirakkunnu</p>
                <p className="pt-2 text-slate-500">Snehavum Thyagavum Nukarnnu Njangal</p>
                <p className="text-slate-500">Sevanathin Dootharaai Varunnitha</p>
                <p className="text-slate-500">KarakaLum ThirakaLum Kadannu Njangal</p>
                <p className="text-slate-500">Suvisesha Dootharaai Varunnitha</p>
                <p className="pt-2">Bharathame Nin Raksha Nin Makkalil</p>
                <p>Aarsha Poovaname Nin Shanthi Nin Kaikalil</p>
                <p>Sodharare Kaikorthu Munneruvin</p>
                <p>Sathya Kaahalam Muzhakki Munneruvin</p>
                <div className="mt-4 p-4 rounded-xl bg-rose-50/50 border border-rose-100/50 text-center">
                  <p className="text-rose-700 font-black text-lg">Munneruvin</p>
                  <p className="text-rose-700 font-black text-lg">Munneruvin</p>
                </div>
              </div>
            </div>

          </div>
        </div>


        <div className="mt-8"></div>

        {/* Timeline Section */}
        <div className="flex flex-col gap-8">
          <div className="border-b border-rose-100 pb-4">
            <span className="text-[10px] font-mono font-black text-rose-700 uppercase tracking-widest block mb-1.5">HISTORIC TIMELINE</span>
            <h3 className="font-serif font-black text-2xl sm:text-3.5xl text-slate-900 tracking-tight leading-none">
              The Journey Across Decades (1947 - 2026)
            </h3>
          </div>

          <div className="relative border-l-2 border-amber-300 pl-4 sm:pl-10 ml-3 sm:ml-8 py-3 flex flex-col gap-12">
            {milestones.map((mil, idx) => (
              <div key={idx} className="relative text-left group">
                
                {/* Bullet node on timeline */}
                <div className="absolute -left-[23px] sm:-left-[49px] top-1.5 w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] rounded-full border-4 border-white bg-amber-500 shadow-md group-hover:bg-rose-700 group-hover:scale-115 transition-all duration-300 z-10" />

                {/* Floating year box */}
                <div className="inline-flex py-1 px-4 bg-slate-900 text-white text-xs font-black font-mono tracking-widest uppercase rounded-full shadow-sm select-none">
                  {mil.year}
                </div>

                {/* Main Content card */}
                <div className="mt-3 bg-white hover:border-amber-400 rounded-3xl border border-rose-100 p-6 sm:p-8 hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 relative shadow-3xs overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-rose-500/5 to-transparent pointer-events-none rounded-tr-3xl" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-4 right-4 text-[9px] font-black font-mono text-rose-750 bg-rose-50/60 px-2 py-0.5 rounded uppercase tracking-wider border border-rose-100/50">
                    {mil.tag}
                  </span>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex flex-col leading-tight">
                      <h4 className="font-serif font-black text-base sm:text-lg text-slate-950">
                        {mil.title}
                      </h4>
                      <span className="text-slate-500 text-xs font-bold mt-1">
                        {mil.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-semibold">
                    {mil.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Redesigned 4 Pillars Section for History View in Dark Mode */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[40px] p-8 sm:p-12 border-2 border-slate-800 text-white mt-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-2 mb-10 border-b border-slate-800/80 pb-6 max-w-xl text-left">
            <span className="text-amber-400 font-mono text-[10px] font-black uppercase tracking-widest block bg-amber-500/10 px-2.5 py-1 rounded w-fit border border-amber-500/10">The Core Mandate</span>
            <h4 className="font-sans font-black text-3xl tracking-tight leading-tight mt-1 text-slate-100">
              The 4 Pillar Ideals of CML
            </h4>
            <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
              These represent the sacred missionary pillars taught to every CML cadet to live a fruitful, apostolic life of grace and divine purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1: Sneham */}
            <div className="p-7 bg-[#0b101c] rounded-[32px] border border-slate-800 hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6 text-left relative overflow-hidden group/item">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-[80px] pointer-events-none group-hover/item:scale-110 transition-transform duration-300"></div>
              <div className="absolute top-4 right-6 font-serif text-5xl font-black text-rose-500/5 group-hover/item:text-rose-500/15 transition-colors select-none">01</div>
              <div className="flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-950/40 border border-rose-800/20 flex items-center justify-center text-rose-450 shadow-sm">
                  <span className="text-xl animate-bounce">❤️</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-rose-400 font-mono font-black tracking-widest uppercase bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 rounded-md self-start">LOVE (SNEHAM)</span>
                  <h5 className="text-rose-100 font-sans font-extrabold text-2xl tracking-tight transition-colors group-hover/item:text-rose-400">Sneham</h5>
                </div>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed font-semibold">Loving God above all else with child-like prayers, and offering selfless friendship to every companion without physical or social barriers.</p>
              </div>
              <div className="text-[11px] text-rose-300/30 font-mono border-t border-slate-900 pt-3">
                "Sneham"
              </div>
            </div>

            {/* Pillar 2: Thyagam */}
            <div className="p-7 bg-[#0b101c] rounded-[32px] border border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6 text-left relative overflow-hidden group/item">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-[80px] pointer-events-none group-hover/item:scale-110 transition-transform duration-300"></div>
              <div className="absolute top-4 right-6 font-serif text-5xl font-black text-amber-500/5 group-hover/item:text-amber-500/15 transition-colors select-none">02</div>
              <div className="flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-950/40 border border-amber-800/20 flex items-center justify-center text-amber-450 shadow-sm">
                  <span className="text-xl animate-pulse">�x�</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-amber-400 font-mono font-black tracking-widest uppercase bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded-md self-start">SACRIFICE (THYAGAM)</span>
                  <h5 className="text-amber-100 font-sans font-extrabold text-2xl tracking-tight transition-colors group-hover/item:text-amber-400">Thyagam</h5>
                </div>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed font-semibold">Offering little pocket investments, sweet treats, game schedules, and minor personal conveniences to collect critical aid for remote global missions.</p>
              </div>
              <div className="text-[11px] text-amber-300/30 font-mono border-t border-slate-900 pt-3">
                "Thyagam"
              </div>
            </div>

            {/* Pillar 3: Sevanam */}
            <div className="p-7 bg-[#0b101c] rounded-[32px] border border-slate-800 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6 text-left relative overflow-hidden group/item">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-[80px] pointer-events-none group-hover/item:scale-110 transition-transform duration-300"></div>
              <div className="absolute top-4 right-6 font-serif text-5xl font-black text-emerald-500/5 group-hover/item:text-emerald-500/15 transition-colors select-none">03</div>
              <div className="flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-800/20 flex items-center justify-center text-emerald-450 shadow-sm">
                  <span className="text-xl">�x��</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-emerald-400 font-mono font-black tracking-widest uppercase bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-md self-start">SERVICE (SEVANAM)</span>
                  <h5 className="text-emerald-100 font-sans font-extrabold text-2xl tracking-tight transition-colors group-hover/item:text-emerald-400">Sevanam</h5>
                </div>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed font-semibold">Ready, joyful lay assistance rendered in church catechisms, holy altars, parish cleanings, and school study-aid activities with sheer enthusiasm.</p>
              </div>
              <div className="text-[11px] text-emerald-300/30 font-mono border-t border-slate-900 pt-3">
                "Sevanam"
              </div>
            </div>

            {/* Pillar 4: Sahanam */}
            <div className="p-7 bg-[#0b101c] rounded-[32px] border border-slate-800 hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6 text-left relative overflow-hidden group/item">
              <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-bl-[80px] pointer-events-none group-hover/item:scale-110 transition-transform duration-300"></div>
              <div className="absolute top-4 right-6 font-serif text-5xl font-black text-sky-500/5 group-hover/item:text-sky-500/15 transition-colors select-none">04</div>
              <div className="flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-sky-950/40 border border-sky-800/20 flex items-center justify-center text-sky-455 shadow-sm">
                  <span className="text-xl">�x</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-sky-400 font-mono font-black tracking-widest uppercase bg-sky-950/40 border border-sky-900/30 px-2 py-0.5 rounded-md self-start">SUFFERING (SAHANAM)</span>
                  <h5 className="text-sky-100 font-sans font-extrabold text-2xl tracking-tight transition-colors group-hover/item:text-sky-400">Sahanam</h5>
                </div>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed font-semibold">Quietly offering up daily academic trials, playground contentions, homework effort, or home cleaning corrections with a genuine alphonsian smile.</p>
              </div>
              <div className="text-[11px] text-sky-300/30 font-mono border-t border-slate-900 pt-3">
                "Sahanam"
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

