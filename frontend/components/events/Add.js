import styles from "../../styles/Events.module.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { buttonStyles } from "../modules/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import TextField from "@mui/material/TextField";
import AddGroup from "./AddGroup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/fr";

function AddEvent() {
  // Récupérer les infos admin depuis Redux
  const admin = useSelector((state) => state.admin.value);

  const [groupInEtablissement, setGroupInEtablissement] = useState([]);
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [msgCreationEvent, setMsgCreationEvent] = useState("");
  const [isCreated, setIsCreated] = useState(false);

  const handleChangeDateStart = (value) => {
    setDateStart(value);
  };

  const handleChangeDateEnd = (value) => {
    setDateEnd(value);
  };

  // États centralisés adaptés au modèle du backend
  const [form, setForm] = useState({
    title: "",
    place: "",
    dateStart: "",
    dateEnd: "",
    supportsCom: [],
    authorisations: [],
  });

  // Fonction pour mettre à jour les valeurs du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Supprimer un groupe
  const handleRemoveGroup = (id) => {
    setGroupInEtablissement(
      groupInEtablissement.filter((group) => group.id !== id)
    );
  };

  // Réinitialiser le formulaire après soumission réussie
  const resetForm = () => {
    setForm({
      title: "",
      place: "",
      supportsCom: [],
      authorisations: [],
    });
  };

  // Valider les champs du formulaire
  const validateForm = () => {
    if (!form.title.trim()) {
      setMsgCreationEvent("Veuillez entrer un nom d'événement");
      return false;
    }

    if (groupInEtablissement.length === 0) {
      setMsgCreationEvent("Veuillez ajouter au moins un groupe");
      return false;
    }
    if (!form.place) {
      setMsgCreationEvent("Veuillez ajouter un lieu à l'évènement");
      return false;
    }
    if (!dateStart) {
      setMsgCreationEvent("Veuillez définir une date de début");
      return false;
    }

    if (!dateEnd) {
      setMsgCreationEvent("Veuillez définir une date de fin");
      return false;
    }

    // Vérifier que la date de fin est après la date de début
    if (dateEnd.isBefore(dateStart)) {
      setMsgCreationEvent(
        "La date de fin doit être postérieure à la date de début"
      );
      return false;
    }

    return true;
  };

  // Ajouter un événement
  const handleSubmitEvent = () => {
    // Réinitialisation des messages
    setMsgCreationEvent("");
    setIsCreated(false);

    // Validation du formulaire
    if (!validateForm()) {
      return;
    }

    fetch(`http://localhost:3000/events/add/${admin.infoAdmin.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        authorisations: [], // Un tableau non vide pour passer la validation
        groupId: groupInEtablissement.map((group) => group.id), // Conversion de l'array d'objets en array d'IDs
        dateStart: dateStart,
        dateEnd: dateEnd,
        place: form.place,
        supportsCom: form.supportsCom,
        etablissementId: admin.etablissement,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setMsgCreationEvent("Événement créé avec succès!");
          setIsCreated(true);
          resetForm();
        } else {
          setMsgCreationEvent("Impossible de créer l'événement");
          setIsCreated(false);
        }
      });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>Votre évènement</h2>
        <div className={styles.formButton}>
          <button
            onClick={handleSubmitEvent}
            className={buttonStyles({ color: "primary" })}
          >
            Créer un évènement
          </button>
          <button className={buttonStyles({ color: "secondary" })}>
            Générer les autorisations
          </button>
        </div>
      </div>

      {/* Message de succès ou d'erreur */}
      {msgCreationEvent && (
        <div
          className={isCreated ? styles.successMessage : styles.errorMessage}
        >
          {msgCreationEvent}
        </div>
      )}

      <div className={styles.formInfos}>
        <div className={styles.formAddInfos}>
          <div className={styles.firstBloc}>
            {/* Champ pour entrer le nom de l'événement */}
            <TextField
              sx={{ width: 400, marginBottom: 2, marginTop: 1 }}
              onChange={(e) =>
                handleFormChange({
                  target: { name: "title", value: e.target.value },
                })
              }
              value={form.title}
              label="Nom de l'événement"
              name="title"
              required
            />

            {/* Champ pour entrer le lieu */}
            <TextField
              sx={{ width: 400, marginBottom: 2 }}
              onChange={(e) =>
                handleFormChange({
                  target: { name: "place", value: e.target.value },
                })
              }
              value={form.place}
              label="Lieu de l'événement"
              name="place"
              required
            />

            <div className={styles.formAddGroup}>
              <AddGroup
                groupInEtablissement={groupInEtablissement}
                setGroupInEtablissement={setGroupInEtablissement}
              />

              {/* Affichage des groupes sélectionnés */}
              {groupInEtablissement.length > 0 && (
                <div className={styles.selectedGroups}>
                  <h5>Groupes sélectionnés:</h5>
                  <div className={styles.groupTags}>
                    {groupInEtablissement.map((group, index) => (
                      <span key={index} className={styles.groupTag}>
                        {group.label}
                        <FontAwesomeIcon
                          icon={faXmark}
                          onClick={() => handleRemoveGroup(group.id)}
                          className={styles.removeIcon}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formAddDate}>
              <h4>Dates de l'événement *</h4>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="fr"
              >
                <DatePicker
                  sx={{ width: 400, marginBottom: 2, marginTop: 1 }}
                  label="Date de début"
                  value={dateStart}
                  onChange={handleChangeDateStart}
                />
              </LocalizationProvider>

              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="fr"
              >
                <DatePicker
                  sx={{ width: 400, marginBottom: 2 }}
                  label="Date de fin"
                  value={dateEnd}
                  onChange={handleChangeDateEnd}
                />
              </LocalizationProvider>
              {/* <AddDate form={form} handleFormChange={handleFormChange} /> */}
            </div>
          </div>
        </div>
      </div>

      <p className={styles.requiredFields}>* Champs obligatoires</p>
    </div>
  );
}

export default AddEvent;
