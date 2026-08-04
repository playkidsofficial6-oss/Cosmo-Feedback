import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import useSWR from 'swr';
import { api, fetcher } from '../services/api';
import type { Patient } from '../services/db';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
}

/* ── Types ─────────────────────────────────────────────── */
interface AppContextValue {
  // Auth
  user: any;
  role: string | undefined;
  handleLogout: () => void;

  // Data
  patients: Patient[];
  appointments: any[];
  allDoctors: any[];
  mutatePatients: () => void;
  mutateAppointments: () => void;
  mutateDoctors: () => void;

  // Active patient
  activePatient: Patient | null;
  setActivePatient: (p: Patient | null) => void;
  activeAppointment: any;

  // Today's queue
  todaysPatientIds: Set<string>;
  pendingQueue: Patient[];
  completedToday: Patient[];

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;

  // Modals
  showRegisterModal: boolean;
  setShowRegisterModal: (v: boolean) => void;
  showAppointmentModal: boolean;
  setShowAppointmentModal: (v: boolean) => void;
  preselectedPatientId: string | null;
  setPreselectedPatientId: (v: string | null) => void;
  showDoctorModal: boolean;
  setShowDoctorModal: (v: boolean) => void;
  doctorToEdit: any;
  setDoctorToEdit: (v: any) => void;
  showEditPatientModal: boolean;
  setShowEditPatientModal: (v: boolean) => void;
  patientToEdit: Patient | null;
  setPatientToEdit: (v: Patient | null) => void;

  // Custom Confirm Dialog State
  confirmConfig: ConfirmConfig | null;
  setConfirmConfig: (config: ConfirmConfig | null) => void;
  confirmLoading: boolean;

  // Patient actions
  handleEditPatient: (p: Patient) => void;
  handleDeletePatient: (p: Patient) => void;
  handleSave: (id: string, updates: Partial<Patient>) => Promise<void>;

  // Doctor actions
  handleAddDoctor: () => void;
  handleEditDoctor: (doc: any) => void;
  handleSaveDoctor: (data: any) => Promise<void>;
  handleDeleteDoctor: (docId: string) => void;

  // Review URL
  reviewUrl: string;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ── Hook ──────────────────────────────────────────────── */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

/* ── Provider ──────────────────────────────────────────── */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Auth
  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role;

  // Data (SWR)
  const { data: patients = [], mutate: mutatePatients } = useSWR<Patient[]>('/patients', fetcher);
  const { data: appointments = [], mutate: mutateAppointments } = useSWR<any[]>('/appointments', fetcher);
  const { data: allDoctors = [], mutate: mutateDoctors } = useSWR<any[]>('/doctors', fetcher);

  // Active patient
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<any>(null);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  // Custom Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Review URL
  const reviewUrl = 'https://g.page/r/CRrsj4jmltT8EBM/review';

  // Today's queue
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysPatientIds = useMemo(() => new Set(
    appointments
      .filter(a => a.createdAt && a.createdAt.startsWith(todayStr))
      .map(a => a.patient?.id || a.patient?._id || a.patient)
  ), [appointments, todayStr]);

  const pendingQueue = useMemo(
    () => patients.filter(p => todaysPatientIds.has(p.id) && p.reviewStatus === 'Pending'),
    [patients, todaysPatientIds],
  );
  const completedToday = useMemo(
    () => patients.filter(p => todaysPatientIds.has(p.id) && p.reviewStatus !== 'Pending'),
    [patients, todaysPatientIds],
  );

  const activeAppointment = useMemo(() => {
    if (!activePatient) return null;
    return appointments
      .filter(a => (a.patient?.id || a.patient?._id || a.patient) === activePatient.id)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
  }, [activePatient, appointments]);

  // Keep activePatient updated with fresh data from patients array
  useEffect(() => {
    if (activePatient) {
      const activeId = activePatient.id || (activePatient as any)._id;
      const updated = patients.find(p => p.id === activeId || (p as any)._id === activeId);
      if (updated && updated !== activePatient) {
        setActivePatient(updated);
      }
    }
  }, [patients]);

  // Auto-select first pending patient
  useEffect(() => {
    if (!activePatient && patients.length > 0) {
      const first = patients.find(p => todaysPatientIds.has(p.id) && p.reviewStatus === 'Pending');
      if (first) setActivePatient(first);
    }
  }, [patients, appointments, activePatient, todaysPatientIds]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  /* ── Handlers ────────────────────────────────────────── */
  const handleLogout = () => {
    Cookies.remove('user');
    navigate('/');
  };

  const handleSave = async (id: string, updates: Partial<Patient>) => {
    const res = await api.put(`/patients/${id}`, {
      ...updates,
      checkoutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    const updated = res.data;
    await mutatePatients();
    showToast(`Check-out saved — ${updated.name}`);

    const freshDb = await fetcher('/patients');
    const next = freshDb.find((p: any) => todaysPatientIds.has(p.id) && p.reviewStatus === 'Pending' && p.id !== id);
    setActivePatient(next ?? null);
  };

  const handleEditPatient = (p: Patient) => {
    setPatientToEdit(p);
    setShowEditPatientModal(true);
  };

  const handleDeletePatient = (p: Patient) => {
    const targetId = p.id || (p as any)._id;
    setConfirmConfig({
      title: 'Delete Patient',
      message: `Are you sure you want to delete ${p.name}? This action cannot be undone.`,
      confirmText: 'Delete Patient',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/patients/${targetId}`);
          await mutatePatients();
          await mutateAppointments();
          showToast(`${p.name} has been deleted.`);
          if (activePatient?.id === p.id || (activePatient as any)?._id === targetId) {
            setActivePatient(null);
          }
        } catch (err) {
          console.error('Delete patient failed:', err);
          showToast('Error deleting patient.');
        } finally {
          setConfirmLoading(false);
          setConfirmConfig(null);
        }
      },
    });
  };

  const handleAddDoctor = () => {
    setDoctorToEdit(null);
    setShowDoctorModal(true);
  };

  const handleEditDoctor = (doc: any) => {
    setDoctorToEdit(doc);
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = async (data: any) => {
    if (doctorToEdit) {
      await api.put(`/doctors/${doctorToEdit._id}`, data);
      showToast(`Doctor updated to: ${data.name}`);
    } else {
      await api.post('/doctors', data);
      showToast(`Doctor added: ${data.name}`);
    }
    await mutateDoctors();
    setShowDoctorModal(false);
  };

  const handleDeleteDoctor = (docId: string) => {
    setConfirmConfig({
      title: 'Remove Doctor',
      message: 'Are you sure you want to remove this doctor from the clinic directory?',
      confirmText: 'Remove Doctor',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.put(`/doctors/${docId}`, { isDeleted: true });
          await mutateDoctors();
          showToast('Doctor removed.');
        } catch {
          showToast('Error removing doctor.');
        } finally {
          setConfirmLoading(false);
          setConfirmConfig(null);
        }
      },
    });
  };

  const value: AppContextValue = {
    user, role, handleLogout,
    patients, appointments, allDoctors,
    mutatePatients, mutateAppointments, mutateDoctors,
    activePatient, setActivePatient, activeAppointment,
    todaysPatientIds, pendingQueue, completedToday,
    toast, showToast,
    showRegisterModal, setShowRegisterModal,
    showAppointmentModal, setShowAppointmentModal,
    preselectedPatientId, setPreselectedPatientId,
    showDoctorModal, setShowDoctorModal,
    doctorToEdit, setDoctorToEdit,
    showEditPatientModal, setShowEditPatientModal,
    patientToEdit, setPatientToEdit,
    confirmConfig, setConfirmConfig, confirmLoading,
    handleEditPatient, handleDeletePatient, handleSave,
    handleAddDoctor, handleEditDoctor, handleSaveDoctor, handleDeleteDoctor,
    reviewUrl,
  };

  if (!user) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
