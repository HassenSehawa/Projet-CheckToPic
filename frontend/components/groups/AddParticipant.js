import styles from "../../styles/Groups.module.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { buttonStyles } from "../modules/Button";

function AddParticipant({
  participantInGroup,
  setParticipantInGroup,
  titleGroup,
  setTitleGroup,
  msgCreationGroup,
  isCreated,
}) {
  //A. Redux
  const admin = useSelector((state) => state.admin.value);

  //B. States

  const [participantData, setParticipantData] = useState([]);
  const [addParticipant, setAddParticipant] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  //C. Logique

  //on récupère tous les participants liés à l'établissement de l'admin
  useEffect(() => {
    fetch(
      `http://localhost:3000/participants/findAllByEtablissement/${admin.etablissement}/${admin.token}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setParticipantData(data.allParticipants);
        }
      });
  }, []);

  // on crée un nouveau tableau avec map, il contient les objets :
  // l'id du participant (pour l'ajouter au groupe) + le nom du participant
  // (pour afficher côté front) avec la clé "label" (connue par Autocomplete de MUI ).
  // UI va ainsi itérer sur toutes les clés label et ignorer id.
  const filtredData = participantData.map((participant) => ({
    label: `${participant.firstName} ${participant.lastName}`,
    id: participant._id,
  }));

  //ici on vient récupérer la value directement et non e.target.value
  // car le composant Mui AutoComplete ne le reconnaît pas (voir documentation)
  const handleChange = (e, value) => {
    setAddParticipant(value);
  };

  const handleSubmit = () => {
    if (!addParticipant) {
      return setErrorMsg("Veuillez - sélectionner un participant");
    }

    if (!participantInGroup.some((e) => e.id === addParticipant.id)) {
      setParticipantInGroup((prevGroup) => [...prevGroup, addParticipant]);
      setAddParticipant("");
      setErrorMsg("");
    } else {
      setErrorMsg("Participant déjà ajouté");
    }
  };

  return (
    <div>
      <TextField
        sx={{ width: 400, marginBottom: 2, marginTop: 1 }}
        onChange={(e) => setTitleGroup(e.target.value)}
        value={titleGroup}
        label="Nom du groupe"
      />
      <div>
        <Autocomplete
          disablePortal
          options={filtredData}
          sx={{ width: 400, marginBottom: 5 }}
          renderInput={(params) => (
            <TextField {...params} label="Rechercher les participants" />
          )}
          value={addParticipant}
          onChange={handleChange}
        />
        <p className={styles.errorMsg}>{errorMsg}</p>
      </div>
      <div className={styles.buttonMsgContainer}>
        <button
          onClick={handleSubmit}
          className={buttonStyles({
            color: "secondary",
            display: "flex",
            flexBasis: "100%",
          })}
        >
          Ajouter un participant
        </button>
        <span
          style={{
            color: isCreated ? "green" : "red",
            fontWeight: "bold",
            fontSize: "12",
          }}
        >
          {msgCreationGroup}
        </span>
      </div>
    </div>
  );
}

export default AddParticipant;
