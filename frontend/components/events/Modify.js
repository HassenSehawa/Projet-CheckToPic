import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Autocomplete from "@mui/material/Autocomplete";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Box, Button, TextField, Typography } from "@mui/material";

function Modify({ open, handleToggleModal, idGroup }) {

// COPIE DU COMPOSANT MODIFY DE GROUPE - A ADAPTER

  //A. Redux
  const admin = useSelector((state) => state.admin.value);

  //B. States
  const [participantData, setParticipantData] = useState([]);
  const [participantsInGroup, setparticipantsInGroup] = useState([]);
  const [addParticipant, setAddParticipant] = useState("");
  const [titleGroup, setTitleGroup] = useState("");
  const [msgModifGroup, setMsgModifGroup] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  //C/ Logique
  // on récupère tous les participants de l'établissement
  useEffect(() => {
    fetch(
      `http://localhost:3000/participants/findAllByEtablissement/${admin.etablissement}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setParticipantData(data.allParticipants);
        }
      });
  }, []);

  // supprimer le participant du groupe en fonction de son ID
  const handleRemoveParticipant = (id) => {
    setparticipantsInGroup(participantsInGroup.filter((e) => e._id !== id));
  };

  // voir explication dans addParticipant
  const filtredData = participantData.map((participant) => ({
    label: `${participant.firstName} ${participant.lastName}`,
    _id: participant._id,
  }));


  //on récupère les informations du groupe en fonction de l'id
  useEffect(() => {
    if (!idGroup) {
      return console.log("erreur:", idGroup);
    }
    fetch(`http://localhost:3000/groups/findOneGroup/${idGroup}`)
      .then((response) => response.json())
      .then((data) => {
        setparticipantsInGroup(data.group.participantIds);
        setTitleGroup(data.group.title);
      });
  }, []);

  //Input participant
  const handleChange = (e, value) => {
    setAddParticipant(value);
  };

  const handleSubmitNewParticipant = () => {
    if (!addParticipant) {
      return setErrorMsg("Veuillez - sélectionner un participant");
    }

    if (!participantsInGroup.some((e) => e._id === addParticipant._id)) {
      setparticipantsInGroup((prevGroup) => [...prevGroup, addParticipant]);
      setAddParticipant("");
      setErrorMsg("");
    } else {
      setErrorMsg("Participant déjà ajouté");
      
    }
  };

  const handleSubmitChange = () => {
    const newParticipantIds = participantsInGroup.map((e) => e._id);

    fetch(`http://localhost:3000/groups/modify/${idGroup}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleGroup,
        participantIds: newParticipantIds,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setMsgModifGroup(data.message);
          setIsModified(data.result);
          //ajout d'une fonction de rechargement de la page pour mettre à jour les informations au niveau du parent (allgroups), temps de rechargement d'une 1 s pour afficher le message "groupe crée" si true
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setMsgModifGroup(data.message);
          setIsModified(data.result);
        }
      });
  };

  return (
    <Modal open={open} onClose={handleToggleModal}>
      <Box sx={styleModal}>
        {/* Header */}
        <Box sx={styleHeader}>
          <Typography sx={styleHeader}>
            Veuiller modifier les informations de votre groupe à l'aide des
            champs ci-dessous :{" "}
          </Typography>
        </Box>
        {/* Input */}
        <Box sx={styleContainerInputs}>
          <TextField
            type="text"
            label="Nom de groupe"
            value={titleGroup}
            style={{ width: 300 }}
            // force le label à rester au -dessus, sinon il se superpose avec value
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setTitleGroup(e.target.value)}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Autocomplete
              disablePortal
              options={filtredData}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Rechercher les participants" />
              )}
              value={addParticipant}
              onChange={handleChange}
            />
            <Button onClick={handleSubmitNewParticipant} sx={butttonAddParticipantStyle}>
              Ajouter un participant
            </Button>
            {errorMsg && <Typography color="error">{errorMsg}</Typography>}
          </Box>
        </Box>
        {/* Participant */}
        <Typography>Participants du groupe :</Typography>
        <Box sx={styleBoxParticipant}>
          {participantsInGroup.map((participant, index) => (
            <Typography
              onClick={() => handleRemoveParticipant(participant._id)}
              sx={{ cursor: "pointer" }}
              key={index}
            >
              {participant.firstName && participant.lastName
                ? `${participant.firstName} ${participant.lastName}`
                : participant.label}
              <FontAwesomeIcon icon={faXmark} style />
            </Typography>
          ))}
        </Box>
        {/* Footer */}
        <Box sx={styleFooter}>
          <Button onClick={handleToggleModal} sx={buttonCloseStyle}>
            Fermer
          </Button>
          <Button onClick={handleSubmitChange} sx={buttonModifyStyle}>
            Modifier
          </Button>
        </Box>
        <Typography
          style={{
            display: "flex",
            justifyContent: "center",
            color: isModified ? "green" : "red",
            fontWeight: "bold",
            fontSize: "12",
          }}
        >
          {msgModifGroup}
        </Typography>
      </Box>
    </Modal>
  );
}

// MODAL STYLE
//Composant MUI adapté au projet
const styleModal = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  height: 500,
  bgcolor: "background.paper",
  borderRadius: 2,
  p: 10,
  gap: 2,
};

const styleBoxParticipant = {
  display: "flex",
  flexWrap: "wrap",
  borderRadius: 2,
  border: "solid 1px black",
  height: 300,
  maxHeight: 300,
  p: 1,
  gap: 1,
  overflowY: "auto",
};

const buttonCloseStyle = {
  color: "#031EAD",
  fontSize: "0.90rem",
  width: 100,
};
const buttonModifyStyle = {
  bgcolor: "#031EAD",
  color: "white",
  fontSize: "0.90rem",
  width: 100,
};
const butttonAddParticipantStyle = {
  bgcolor: "#031EAD",
  color: "white",
  fontSize: "0.90rem",
  width: 300,
};

const styleHeader = {
  textAlign: "center",
  pb: 2,
  fontSize: "1.1rem",
};

const styleFooter = {
  display: "flex",
  justifyContent: "center",
  pt: 5,
  gap: 2,
};

const styleContainerInputs = {
  display: "flex",
  justifyContent: "center",
  gap: 3,
};

export default Modify;