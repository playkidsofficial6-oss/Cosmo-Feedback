import { useAppContext } from '../contexts/AppContext';
import { SearchSystem } from '../components/SearchSystem';

export function DirectoryPage() {
  const {
    patients, appointments,
    activePatient, setActivePatient,
    handleEditPatient, handleDeletePatient,
  } = useAppContext();

  return (
    <SearchSystem
      patients={patients}
      appointments={appointments}
      activePatientId={activePatient?.id}
      onSelectPatient={(p) => {
        setActivePatient(p);
      }}
      onEditPatient={handleEditPatient}
      onDeletePatient={handleDeletePatient}
    />
  );
}
