//import styles from '../../styles/Groups.module.css';
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { frFR } from "@mui/x-data-grid/locales";
import Modify from "./Modify";
import Paper from "@mui/material/Paper";
import moment from "moment";
import "moment/locale/fr";

function AllGroups() {
  //A. Redux
  const admin = useSelector((state) => state.admin.value);

  //B. States
  const [open, setOpen] = useState(false);
  const [idGroup, setIdGroup] = useState("");
  const [groupsData, setGroupsData] = useState([]);

  //C/ Logique
  useEffect(() => {
    fetch(
      `http://localhost:3000/groups/findAllGroupsByEtablissement/${admin.etablissement}/${admin.token}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setGroupsData(
            data.allGroups.map((e) => ({
              id: e._id,
              groupName: e.title,
              auteurName: `${e.adminId.firstName + " " + e.adminId.lastName}`,
              participantNumber: e.participantIds.length,
              createdAt: moment(e.createdAt).format("LLLL"),
            }))
          );
        }
      });
  }, []);

  const handleDeleteGroup = (id) => {
    fetch(`http://localhost:3000/groups/${id}/${admin.token}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          console.log(data.message);
          console.log(data.result);
          setGroupsData(groupsData.filter((e) => e.id !== id))
        }
        else {
        console.log(data.message)
        }
      });
  };

  const handleToggleModal = (id) => {
    setIdGroup(id);
    setOpen(!open);
  };

  //D. Configuration du tableau
  const columns = [
    {
      field: "groupName",
      headerName: "Nom de groupe",
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "auteurName",
      headerName: "Auteur",
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "participantNumber",
      headerName: "Nbre de participants",
      width: 200,
      editable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "createdAt",
      headerName: "Date de création",
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
      {groupsData.length === 0 ? (
        <p>Aucun groupe</p>
      ) : (
        <div>
          <h2 style={{marginBottom: "50px"}} >Tous les groupes  </h2>
        <Paper>
          <DataGrid
            rows={groupsData}
            columns={columns}
            loading={groupsData.length === 0}
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
      {open && idGroup ? (
        <Modify
          open={open}
          handleToggleModal={handleToggleModal}
          setIdGroup={setIdGroup}
          idGroup={idGroup}
        />
     ) : null}
    </div>
  );
}

export default AllGroups;
