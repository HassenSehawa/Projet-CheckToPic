import styles from "../../styles/Events.module.css";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

function AddGroup({ groupInEtablissement, setGroupInEtablissement }) {
  // Initialise l'état groupData comme tableau vide
  const [groupData, setGroupData] = useState([]); // Données des groupes disponibles
  const [errorMsg, setErrorMsg] = useState("");

  // Récupère les données de l'administrateur connecté via Redux
  const admin = useSelector((state) => state.admin.value);

  // Crée un tableau filtré pour le menu déroulant
  const filteredData = groupData.map((group) => ({
    label: group.title, // Nom affiché dans le menu déroulant
    id: group._id, // Identifiant unique du groupe
  }));

  // Récupère les groupes liés à l'établissement de l'administrateur
  useEffect(() => {
    if (admin && admin.etablissement) {
      fetch(
        `http://localhost:3000/groups/findAllGroupsByEtablissement/${admin.etablissement}/${admin.token}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.result) {
            setGroupData(data.allGroups); // Stocke les groupes récupérés
          }
        })
        .catch(error => {
          console.error("Erreur lors du chargement des groupes:", error);
          setErrorMsg("Erreur lors du chargement des groupes");
        });
    }
  }, [admin]);

  // Ajoute directement le groupe sélectionné sans passer par un état intermédiaire
  const handleChange = (event, selectedValue) => {
    // Si rien n'est sélectionné (effacement), on ne fait rien
    if (!selectedValue) return;
    
    // Vérifie si le groupe est déjà dans la liste
    if (!groupInEtablissement.some(g => g.id === selectedValue.id)) {
      // Ajoute le groupe directement à la liste
      setGroupInEtablissement(prevGroups => [...prevGroups, selectedValue]);
      setErrorMsg(""); // Efface les messages d'erreur
    } else {
      setErrorMsg("Ce groupe est déjà ajouté");
    }
  };

  return (
    <div>
      {/* Dropdown pour sélectionner un groupe */}
      <Autocomplete
        disablePortal
        options={filteredData}
        sx={{ width: 400, marginBottom: 5}}
        renderInput={(params) => (
          <TextField {...params} label="Ajouter un groupe *" />
        )}
        onChange={handleChange}
        // On ne définit pas value pour que l'Autocomplete se réinitialise après chaque sélection
        isOptionEqualToValue={(option, value) => option.id === value?.id}
      />
      
      {/* Affichage des messages d'erreur si nécessaire */}
      {errorMsg && (
        <p className={styles.errorMessage}>{errorMsg}</p>
      )}
    </div>
  );
}

export default AddGroup;