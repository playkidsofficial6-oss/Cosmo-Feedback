import { useAppContext } from '../contexts/AppContext';
import { Dashboard } from '../components/Dashboard';

export function AnalyticsPage() {
  const {
    patients, appointments, allDoctors,
    handleAddDoctor, handleEditDoctor, handleDeleteDoctor,
  } = useAppContext();

  return (
    <Dashboard
      patients={patients}
      appointments={appointments}
      allDoctors={allDoctors}
      onAddDoctor={handleAddDoctor}
      onEditDoctor={handleEditDoctor}
      onDeleteDoctor={handleDeleteDoctor}
    />
  );
}
