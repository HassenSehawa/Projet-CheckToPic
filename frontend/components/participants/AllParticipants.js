import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { frFR } from "@mui/x-data-grid/locales";
import Modify from "./Modify";
import Paper from "@mui/material/Paper";
import moment from "moment";
import "moment/locale/fr";


function AllParticipants () {

//A. Redux
const admin = useSelector((state) => state.admin.value);

//B. States
const [open, setOpen] = useState(false);
const [participantsData, setParticipantsData] = useState([]);

//C/ Logique
useEffect(() => {
  fetch(
    `http://localhost:3000/participants/findAllByEtablissement/${admin.etablissement}/${admin.token}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.result) {
        console.log(data);
        setParticipantsData(
          data.allParticipants.map((e) => ({
            id: e._id,
            firstName: e.firstName,
            lastName: e.lastName,
            birthDate: moment(e.birthDate).format("DD/MM/YYYY"),
          }))
        );
      }
    });
}, []);

const handleDeleteGroup = (id) => {
  fetch(`http://localhost:3000/participants/delete/${id}/${admin.token}`, { method: "DELETE" })
    .then((response) => response.json())
    .then((data) => {
      if (data.result) {
        console.log(data.message);
        setParticipantsData(participantsData.filter((e) => e.id !== id));
      } else {
        console.log(data.message)
      }
      
    });
};

const handleToggleModal = (id) => {
 
  setOpen(!open);
};

//D. Configuration du tableau
const columns = [
  {
    field: "lastName",
    headerName: "Nom",
    width: 150,
    editable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "firstName",
    headerName: "Prénom",
    width: 200,
    editable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "birthDate",
    headerName: "Date de naissance",
    width: 200,
    editable: false,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 300,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <div>
        <Button
          variant="contained"
          style={{
            marginRight: "10px",
            fontSize: "11px",
            backgroundColor: "#2E35B3",
          }}
          onClick={() => handleToggleModal(params.row.id)}
        >
          Modifier
        </Button>
        <Button
          variant="contained"
          onClick={() => handleDeleteGroup(params.row.id)}
          style={{ fontSize: "11px", backgroundColor: "#DC1C4D" }}
        >
          Supprimer
        </Button>
      </div>
    ),
  },
];

return (
  <div>
    {participantsData.length === 0 ? (
      <p>Aucun participant</p>
    ) : (
      <div>
        <h2 style={{marginBottom: "50px"}} >Tous les participants  </h2>
      <Paper>
        <DataGrid
          rows={participantsData}
          columns={columns}
          loading={participantsData.length === 0}
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
      </div>
    )}
    {/* {open && idGroup ? (
      <Modify
        open={open}
        handleToggleModal={handleToggleModal}
        setIdGroup={setIdGroup}
        idGroup={idGroup}
      />
   ) : null} */}
  </div>
);
}

export default AllParticipants;