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
  createdAt: Date | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
}



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


// Complete patient review checkout



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
export const getTreatmentList = () => TREATMENTS;
export const getMarketingSources = () => MARKETING_SOURCES;
export const getVipTagsList = () => VIP_TAGS;
