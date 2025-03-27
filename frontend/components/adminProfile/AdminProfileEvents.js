import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import "moment/locale/fr";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { Modal, Box, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Tooltip from "@mui/material/Tooltip";
import { frFR } from "@mui/x-data-grid/locales";

// Import table pour modal
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function AdminProfileEvents() {
  // Récupération du token depuis redux
  const token = useSelector((state) => state.admin.value.token);

  // Stockage infos events + participants
  const [eventsData, setEventsData] = useState([]);

  // Toggle pour modal
  const [open, setOpen] = useState(false);

  // Etat pour les lignes dans le tableau de la modal
  const [rows, setRows] = useState([]);

  const handleRowClick = (e) => {
    setOpen(!open); // Ouverture de la modal

    let allParticipants = e.row.participants.map((e) => ({
      authId: e._id,
      avatar: e.participant.pictureUrl,
      firstName: e.participant.firstName,
      lastName: e.participant.lastName,
      status: e.isValidated,
    }));

    setRows(allParticipants);
  };

  // Récupération des infos relatives aux events gérés par l'admin
  useEffect(() => {
    fetch(
      `http://localhost:3000/events/eventsByAdminWithParticipantInfos/${token}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setEventsData(
            data.data.map((element) => ({
              id: element._id,
              eventTitle: element.title,
              participants: element.authorisations,
              nbParticipants: element.authorisations.length, // Calcul du nombre de participants
              validatedAuths: element.authorisations.filter(
                (e) => e.isValidated
              ).length, // Calcul du nombre d'autorisations validées
              place: element.place,
              dateStart: moment(element.dateStart).format("LL"),
            }))
          );
        }
      });
  }, []);

  // Initialisation du tableau pour afficher les résultats (colonnes)
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "eventTitle",
      headerName: "Nom de l'événement",
      width: 300,
      editable: false,
    },
    {
      field: "participants",
      headerName: "Participants",
      width: 200,
      editable: false,
      renderCell: (params) => (
        // Fonction pour transformer le tableau des pictureUrl participants en un groupe d'avatars capés à 4 (flex-end pour forcer l'alignement à gauche)
        <AvatarGroup max={4} style={{ justifyContent: "flex-end" }}>
          {params.value.map((e) => (
            <Avatar src={e.participant?.pictureUrl} />
          ))}
        </AvatarGroup>
      ),
    },
    {
      field: "rate",
      headerName: "Taux de validation",
      width: 150,
      editable: false,
      renderCell: (params) => {
        // Configuration de l'affichage dynamique des couleurs sur l'arc
        let arcColor = "green";
        let percentage = Math.round(
          (params.row.validatedAuths / params.row.nbParticipants) * 100
        );

        if (percentage < 30) {
          arcColor = "red";
        } else if (percentage < 50) {
          arcColor = "orange";
        }

        return (
          <Gauge
            width={60}
            height={60}
            value={Math.round(
              (params.row.validatedAuths / params.row.nbParticipants) * 100
            )} // Calcul du taux de validation
            startAngle={-90}
            endAngle={90}
            text={({ value }) => `${value}%`}
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 12,
                transform: "translate(0px,7px)",
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: `${arcColor}`,
              },
            }}
          />
        );
      },
    },
    {
      field: "place",
      headerName: "Lieu de l'événément",
      width: 150,
      editable: false,
    },
    {
      field: "dateStart",
      headerName: "Date de l'évément",
      width: 150,
      editable: false,
    },
  ];

  let eventModal = (
    <Modal open={open} onClose={() => setOpen(!open)}>
      <Box sx={styleModal}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 600 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Prénom</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Nom</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Autorisation
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.authId}>
                  <TableCell>
                    <Avatar src={row.avatar} />
                  </TableCell>
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell>{row.lastName}</TableCell>
                  {row.status ? (
                    <TableCell style={{ color: "green" }}>Validé</TableCell>
                  ) : (
                    <TableCell style={{ color: "red" }}>
                      En attente
                      <Tooltip title="Relancer">
                        <IconButton>
                          <NotificationsNoneIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={styleFooter}>
          <Button sx={buttonCloseStyle} onClick={() => setOpen(!open)}>
            Fermer
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  return (
    <div>
      {eventModal}
      {eventsData.length === 0 ? (
        <span>Aucun événement</span>
      ) : (
        <Paper>
          <DataGrid
            onRowClick={(e) => handleRowClick(e)} // On gère le clic sur la ligne et on envoie les données à la fonction handleRowClick pour affichage en modal
            rowHeight={70}
            columnVisibilityModel={{
              // Cache la colonne ID
              id: false,
            }}
            rows={eventsData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          />
        </Paper>
      )}
    </div>
  );
}

const styleModal = {
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  p: 10,
};

const styleFooter = {
  display: "flex",
  justifyContent: "center",
  pt: 5,
  gap: 2,
};

const buttonCloseStyle = {
  color: "#031EAD",
  fontSize: "0.90rem",
  width: 100,
};

export default AdminProfileEvents;
