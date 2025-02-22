import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

//import styles from '../../styles/Events.module.css';

const columns = [
  { field: '_id', headerName: 'ID', width: 70 },
  { field: 'Name', headerName: "Titre de l'évènement", width: 200 },
  { field: 'Author', headerName: 'Auteur', width: 200 },
  { field: 'Date', headerName: 'Date de sortie', type: 'date', width: 130 },
  { field: 'Accept', headerName: "Taux d'acceptation", width: 200 },
  {
    field: 'modify',
    headerName: 'Modify',
    width: 130,
    renderCell: (params) => (
      <a href={`/ctp-admin/events/modify/${params.row.id}`} style={{ color: 'blue' }}>
        Modify
      </a>
    ),
  },
  {
    field: 'delete',
    headerName: 'Delete',
    width: 130,
    renderCell: (params) => (
      <button onClick={() => deleteEvent(params.row.id)} style={{ color: 'red' }}>
        Delete
      </button>
    ),
  },
];

function Events() {
  const [rows, setRows] = useState([]);
  // Récupère l'ID de l'établissement depuis le state Redux
  const etablissementId = useSelector(
    (state) => state.admin.value.etablissement 
  );
  

  // Récupération des événements au chargement du composant
  useEffect(() => {
    if (!etablissementId) return;
    fetch(`http://localhost:3000/eventsByEtablissement/${etablissementId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          const formattedEvents = data.data.map((event) => ({
            ...event,
            acceptRate: Math.round(
              (event.authorisations.filter((auth) => auth.accepted).length /
                event.authorisations.length) *
                100
            ), // Calculer le taux d'acceptation sur base des autorisations
          }));
          setRows(formattedEvents);
        } else {
          console.error("Erreur : Aucune donnée disponible.");
        }
      })
      .catch((error) => console.error("Erreur API :", error));
  }, [etablissementId]);

  // Suppression d'un événement
  const deleteEvent = async (id) => {
    const response = await fetch(
      `http://localhost:3000/events/delete/${eventId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      // Si suppression réussie, mettre à jour les lignes en supprimant celle supprimée
      setRows(rows.filter((row) => row.id !== id));
    } else {
      console.error('Événement non trouvé ou erreur dans la suppression.');
    }
  };

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id} // Utilisation de l'ID MongoDB comme identifiant unique
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </Paper>
  );
}

export default Events;