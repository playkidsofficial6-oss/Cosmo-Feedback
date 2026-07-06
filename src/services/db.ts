export interface Patient {
  id: string;
  pid?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  gender?: string;
  age?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  note?: string;
  patientType: 'Regular' | 'VIP' | 'Celebrity' | 'Referral' | 'Corporate' | 'First Time Visitor' | 'Returning Patient';
  photoUrl: string | null;
  reviewStatus: 'Yes' | 'No' | 'Pending';
  reviewStars: number | null;
  reviewNotes: string | null;
  marketingSource: string | null;
  purchaseStatus: 'Consultation Only' | 'Treatment Booked' | 'Package Purchased' | 'Follow-up Scheduled';
  vipTags: string[];
  checkoutTime: string | null;
}

const STORAGE_KEY = 'cosmo_homes_db';

const DOCTORS = [
  'Dr. Catherine Stone',
  'Dr. Marcus Vance',
  'Dr. Elena Rostova',
  'Dr. Alexander Kim'
];

const TREATMENTS = [
  'Hair Treatment',
  'Hair Transplant',
  'PRP',
  'Skin Care',
  'Pigmentation',
  'Acne',
  'Weight Loss',
  'Laser Hair Removal',
  'Anti Aging',
  'Other'
];

const MARKETING_SOURCES = [
  'Instagram',
  'Facebook',
  'Google Search',
  'Google Maps',
  'Website',
  'YouTube',
  'Instagram Reels',
  'WhatsApp',
  'Friend Referral',
  'Family Referral',
  'Doctor Referral',
  'Existing Patient',
  'Walk-In',
  'Other'
];

const VIP_TAGS = [
  'VIP',
  'Influencer',
  'Celebrity',
  'Corporate',
  'High Value',
  'Potential Lead',
  'Referral Partner'
];

// Profile pictures from Unsplash for realistic design
const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150'
];

// Generate standard mock patient data spanning the last 30 days plus some for today
const generateMockData = (): Patient[] => {
  const list: Patient[] = [];

  // Names of clients visiting a premium clinic
  const patientNames = [
    'Aria Montgomery', 'Maximilian Sterling', 'Serena van der Woodsen', 'Liam Neeson',
    'Olivia Copeland', 'Garrick Thorne', 'Amara Vance', 'Ethan Hunt',
    'Zara Hadid', 'Christian Grey', 'Diana Prince', 'Bruce Wayne',
    'Charlotte York', 'Arthur Pendragon', 'Victoria Beckham', 'Alexander Mercer',
    'Isabella Rossellini', 'Gabriel Macht', 'Sophia Loren', 'Sebastian Shaw',
    'Natalia Romanova', 'Lachlan Murdoch', 'Clara Oswald', 'Charles Xavier',
    'Genevieve Beauchamp', 'Roderick Usher', 'Fiona Gallagher', 'Daniel Craig',
    'Eleanor Shellstrop', 'Lucas Scott', 'Brooke Davis', 'Nathan Drake',
    'Selina Kyle', 'Harvey Specter', 'Donna Paulsen', 'Louis Litt',
    'Rachel Zane', 'Mike Ross', 'Jessica Pearson', 'Robert Zane',
    'David Beckham', 'Angelina Jolie', 'Brad Pitt', 'George Clooney',
    'Penelope Cruz', 'Scarlett Johansson', 'Ryan Reynolds', 'Emma Watson'
  ];

  // Seed 44 historical checkouts (last 30 days)
  for (let i = 0; i < patientNames.length; i++) {
    const isVip = i % 5 === 0;
    const isCelebrity = i % 12 === 0;
    const ratingSeed = Math.random();

    let reviewStatus: 'Yes' | 'No' | 'Pending' = 'Yes';
    if (ratingSeed < 0.2) reviewStatus = 'No';
    else if (ratingSeed < 0.35) reviewStatus = 'Pending';

    let reviewStars: number | null = null;
    let reviewNotes: string | null = null;

    if (reviewStatus === 'Yes') {
      const starRoll = Math.random();
      reviewStars = starRoll > 0.85 ? 4 : starRoll > 0.3 ? 5 : starRoll > 0.1 ? 3 : 2;

      const notesOptions = [
        'Absolutely loved the consultation and facial analysis.',
        'Extremely satisfied with the doctor\'s patience.',
        'Will definitely return for follow-up PRP treatment.',
        'Impressed by the gold interiors and boutique vibe.',
        'Great hospitality, VIP service was top notch.',
        'Dr Catherine was amazing with skin tightening advice.',
        'Fast and professional checkout process.',
        'Pricing is high but worth the premium care.',
        null
      ];
      reviewNotes = notesOptions[Math.floor(Math.random() * notesOptions.length)];
    }

    const typeRoll = Math.random();
    let patientType: Patient['patientType'] = 'Regular';
    if (isCelebrity) patientType = 'Celebrity';
    else if (isVip) patientType = 'VIP';
    else if (typeRoll < 0.15) patientType = 'First Time Visitor';
    else if (typeRoll < 0.3) patientType = 'Returning Patient';
    else if (typeRoll < 0.45) patientType = 'Referral';

    const sourceRoll = Math.random();
    let marketingSource = 'Instagram';
    if (sourceRoll < 0.25) marketingSource = 'Instagram';
    else if (sourceRoll < 0.45) marketingSource = 'Google Search';
    else if (sourceRoll < 0.6) marketingSource = 'Google Maps';
    else if (sourceRoll < 0.7) marketingSource = 'Friend Referral';
    else if (sourceRoll < 0.8) marketingSource = 'Website';
    else if (sourceRoll < 0.9) marketingSource = 'Facebook';
    else marketingSource = 'Walk-In';

    // Build VIP tags
    const tags: string[] = [];
    if (patientType === 'VIP') tags.push('VIP');
    if (patientType === 'Celebrity') { tags.push('Celebrity'); tags.push('VIP'); }
    if (Math.random() < 0.2) tags.push('High Value');
    if (Math.random() < 0.1) tags.push('Influencer');

    list.push({
      id: `HIST-${1000 + i}`,
      name: patientNames[i],
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      patientType,
      photoUrl: Math.random() < 0.3 ? MOCK_PHOTOS[i % MOCK_PHOTOS.length] : null,
      reviewStatus,
      reviewStars,
      reviewNotes,
      marketingSource,
      purchaseStatus: Math.random() > 0.5 ? 'Package Purchased' : 'Treatment Booked',
      vipTags: tags,
      checkoutTime: '14:24'
    });
  }

  // Seed 8 checkout queue patients for TODAY
  const todaysPatients = [
    { name: 'Alia Bhatt', type: 'Celebrity', phone: '+91 9988223344', treatment: 'Skin Care', doctor: DOCTORS[0] },
    { name: 'Dr. Kabir Sen', type: 'Corporate', phone: '+91 9845112233', treatment: 'Hair Transplant', doctor: DOCTORS[1] },
    { name: 'Rhea Kapoor', type: 'VIP', phone: '+91 9777555111', treatment: 'Anti Aging', doctor: DOCTORS[2] },
    { name: 'Vikram Malhotra', type: 'First Time Visitor', phone: '+91 8877112233', treatment: 'PRP', doctor: DOCTORS[3] },
    { name: 'Kiara Advani', type: 'Celebrity', phone: '+91 9122334455', treatment: 'Pigmentation', doctor: DOCTORS[0] },
    { name: 'Rohit Sharma', type: 'VIP', phone: '+91 9811223344', treatment: 'Hair Treatment', doctor: DOCTORS[2] },
    { name: 'Simran Singh', type: 'Returning Patient', phone: '+91 9654321122', treatment: 'Laser Hair Removal', doctor: DOCTORS[1] },
    { name: 'Amitabh Bachchan', type: 'Celebrity', phone: '+91 9000000001', treatment: 'Anti Aging', doctor: DOCTORS[3] }
  ];

  todaysPatients.forEach((tp, idx) => {
    // Some are pre-completed for stats rendering, others are completely pending for checkout
    const isCompleted = idx < 4;
    let reviewStatus: Patient['reviewStatus'] = 'Pending';
    let reviewStars: number | null = null;
    let reviewNotes: string | null = null;
    let marketingSource: string | null = null;
    let purchaseStatus: Patient['purchaseStatus'] = 'Consultation Only';
    let checkoutTime: string | null = null;

    if (isCompleted) {
      reviewStatus = idx === 0 ? 'Yes' : idx === 1 ? 'No' : 'Yes';
      reviewStars = reviewStatus === 'Yes' ? 5 : null;
      reviewNotes = reviewStatus === 'Yes' ? 'Fantastic doctor and modern clinic environment.' : null;
      marketingSource = idx === 0 ? 'Instagram Reels' : 'Google Search';
      purchaseStatus = idx === 0 ? 'Package Purchased' : 'Treatment Booked';
      checkoutTime = `11:${30 + idx * 10}`;
    }

    const tags = [];
    if (tp.type === 'VIP' || tp.type === 'Celebrity') tags.push(tp.type);

    list.push({
      id: `TODAY-${100 + idx}`,
      name: tp.name,
      phone: tp.phone,
      patientType: tp.type as Patient['patientType'],
      photoUrl: tp.type === 'Celebrity' || tp.type === 'VIP' ? MOCK_PHOTOS[idx % MOCK_PHOTOS.length] : null,
      reviewStatus,
      reviewStars,
      reviewNotes,
      marketingSource,
      purchaseStatus,
      vipTags: tags,
      checkoutTime
    });
  });

  return list;
};

// Fetch DB helper
export const getDatabase = (): Patient[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = generateMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

// Save DB helper
export const saveDatabase = (data: Patient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Reset to default seed
export const resetDatabase = (): Patient[] => {
  const fresh = generateMockData();
  saveDatabase(fresh);
  return fresh;
};

// Get single patient
export const getPatientById = (id: string): Patient | undefined => {
  const db = getDatabase();
  return db.find(p => p.id === id);
};

// Complete patient review checkout
export const checkoutPatient = (id: string, updates: Partial<Patient>): Patient => {
  const db = getDatabase();
  const index = db.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Patient not found');
  }

  const current = db[index];
  const updated: Patient = {
    ...current,
    ...updates,
    checkoutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db[index] = updated;
  saveDatabase(db);
  return updated;
};

// Create a new patient (from receptionist desk)
export const createPatient = (patientData: Omit<Patient, 'id' | 'visitDate' | 'checkoutTime'>): Patient => {
  const db = getDatabase();
  const newId = `NEW-${Date.now()}`;

  const newPatient: Patient = {
    ...patientData,
    id: newId,
    checkoutTime: null
  };

  db.push(newPatient);
  saveDatabase(db);
  return newPatient;
};

// Aggregate Stats for "Today's Statistics"
export interface TodayStats {
  patientsConsulted: number;
  reviewsRequested: number;
  reviewsSubmitted: number;
  conversionRate: number;
  averageRating: number;
  vipPatients: number;
  newPatients: number;
  returningPatients: number;
}

export const getTodayStats = (db: Patient[], appointments: any[]): TodayStats => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todays = db.filter(p => {
    const appts = appointments.filter(a => a.patient && (a.patient.id === p.id || a.patient._id === p.id || a.patient === p.id));
    return appts.some(a => (a.createdAt || '').startsWith(todayStr));
  });

  const patientsConsulted = todays.length;
  // Requested: reviewed or explicitly rejected/pending but checked out
  const reviewsRequested = todays.filter(p => p.reviewStatus !== 'Pending' || p.checkoutTime !== null).length;
  const reviewsSubmitted = todays.filter(p => p.reviewStatus === 'Yes').length;
  const conversionRate = reviewsRequested > 0 ? Math.round((reviewsSubmitted / reviewsRequested) * 100) : 0;

  const rated = todays.filter(p => p.reviewStars !== null);
  const averageRating = rated.length > 0 ? parseFloat((rated.reduce((sum, p) => sum + (p.reviewStars || 0), 0) / rated.length).toFixed(1)) : 0;

  const vipPatients = todays.filter(p => p.patientType === 'VIP' || p.patientType === 'Celebrity' || p.vipTags.includes('VIP')).length;
  const newPatients = todays.filter(p => p.patientType === 'First Time Visitor').length;
  const returningPatients = todays.filter(p => p.patientType === 'Returning Patient').length;

  return {
    patientsConsulted,
    reviewsRequested,
    reviewsSubmitted,
    conversionRate,
    averageRating,
    vipPatients,
    newPatients,
    returningPatients
  };
};

// Aggregate Marketing Analytics (Sources vs Patient count)
export interface MarketingSourceStat {
  source: string;
  count: number;
}

export const getMarketingAnalytics = (db: Patient[]): MarketingSourceStat[] => {
  // Filter only those that have a marketing source filled
  const sourcesMap: Record<string, number> = {};

  MARKETING_SOURCES.forEach(src => {
    sourcesMap[src] = 0;
  });

  db.forEach(p => {
    if (p.marketingSource && sourcesMap[p.marketingSource] !== undefined) {
      sourcesMap[p.marketingSource]++;
    } else if (p.marketingSource) {
      sourcesMap['Other'] = (sourcesMap['Other'] || 0) + 1;
    }
  });

  return Object.entries(sourcesMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
};

// Doctor Analytics Table
export interface DoctorStat {
  doctorName: string;
  patients: number;
  reviews: number;
  averageRating: number;
}

export const getDoctorAnalytics = (db: Patient[], appointments: any[]): DoctorStat[] => {
  const doctorMap: Record<string, { patients: number; reviews: number; starsSum: number }> = {};

  db.forEach(p => {
    // Find the latest appointment for this patient
    const appts = appointments.filter(a => a.patient && (a.patient.id === p.id || a.patient._id === p.id || a.patient === p.id));
    if (appts.length === 0) return; // Skip if no appointment
    const latestAppt = appts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];

    // The populated doctor object
    const doc = latestAppt.doctor?.name || 'Unknown';

    if (!doctorMap[doc]) {
      doctorMap[doc] = { patients: 0, reviews: 0, starsSum: 0 };
    }

    doctorMap[doc].patients++;
    if (p.reviewStatus === 'Yes' && p.reviewStars) {
      doctorMap[doc].reviews++;
      doctorMap[doc].starsSum += p.reviewStars;
    }
  });

  return Object.entries(doctorMap).map(([doctorName, metrics]) => ({
    doctorName,
    patients: metrics.patients,
    reviews: metrics.reviews,
    averageRating: metrics.reviews > 0 ? parseFloat((metrics.starsSum / metrics.reviews).toFixed(1)) : 0
  })).sort((a, b) => b.reviews - a.reviews);
};

// Source Conversion Table
export interface SourceAttributionStat {
  source: string;
  patientCount: number;
  conversionPct: number;
  reviewCount: number;
}

export const getSourceAnalytics = (db: Patient[]): SourceAttributionStat[] => {
  const sourceMetrics: Record<string, { patients: number; reviews: number }> = {};

  MARKETING_SOURCES.forEach(src => {
    sourceMetrics[src] = { patients: 0, reviews: 0 };
  });

  db.forEach(p => {
    const src = p.marketingSource || 'Other';
    if (!sourceMetrics[src]) {
      sourceMetrics[src] = { patients: 0, reviews: 0 };
    }
    sourceMetrics[src].patients++;
    if (p.reviewStatus === 'Yes') {
      sourceMetrics[src].reviews++;
    }
  });

  return Object.entries(sourceMetrics)
    .map(([source, metrics]) => {
      const conversionPct = metrics.patients > 0 ? Math.round((metrics.reviews / metrics.patients) * 100) : 0;
      return {
        source,
        patientCount: metrics.patients,
        conversionPct,
        reviewCount: metrics.reviews
      };
    })
    .filter(item => item.patientCount > 0)
    .sort((a, b) => b.patientCount - a.patientCount);
};

// Metadata utilities
export const getDoctorList = () => DOCTORS;
export const getTreatmentList = () => TREATMENTS;
export const getMarketingSources = () => MARKETING_SOURCES;
export const getVipTagsList = () => VIP_TAGS;
