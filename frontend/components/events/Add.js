import styles from "../../styles/Events.module.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { buttonStyles } from "../modules/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import TextField from "@mui/material/TextField";

import AddGroup from "./AddGroup";
import AddDate from "./AddDate";


function AddEvent() {
  // Récupérer les infos admin depuis Redux
  const admin = useSelector((state) => state.admin.value);

  // États centralisés adaptés au modèle du backend
  const [form, setForm] = useState({
    title: "",
    place: "",
    dateStart: "",
    dateEnd: "",
    supportsCom: [],
    authorisations: [],
  });

  const [groupInEtablissement, setGroupInEtablissement] = useState([]);
  const [participantInGroup, setParticipantInGroup] = useState([]);
  const [msgCreationEvent, setMsgCreationEvent] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour mettre à jour les valeurs du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Format personnalisé pour AddDate qui continue d'utiliser startDate/endDate
  const handleDateChange = (name, value) => {
    // Mapping des noms de champs de l'UI vers le modèle backend
    const fieldMapping = {
      startDate: "dateStart",
      endDate: "dateEnd",
    };

    setForm((prevForm) => ({
      ...prevForm,
      [fieldMapping[name] || name]: value,
    }));
  };

  // Supprimer le participant du groupe
  const handleRemoveParticipant = (id) => {
    setParticipantInGroup(participantInGroup.filter((e) => e.id !== id));
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
      dateStart: "",
      dateEnd: "",
      supportsCom: [],
      authorisations: [],
    });
    setGroupInEtablissement([]);
    setParticipantInGroup([]);
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

    if (!form.dateStart) {
      setMsgCreationEvent("Veuillez définir une date de début");
      return false;
    }

    if (!form.dateEnd) {
      setMsgCreationEvent("Veuillez définir une date de fin");
      return false;
    }

    // Vérifier que la date de fin est après la date de début
    if (new Date(form.dateEnd) < new Date(form.dateStart)) {
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

    setIsLoading(true);

    // Préparation des données selon le format attendu par le backend
    const requestBody = {
      title: form.title,
      authorisations: [], // Un tableau non vide pour passer la validation
      groupId: groupInEtablissement.map((group) => group.id), // Conversion de l'array d'objets en array d'IDs
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
      place: form.place,
      supportsCom: form.supportsCom,
      etablissementId: admin.etablissement,
    };

    console.log("Envoi au serveur:", requestBody); // Pour déboguer

    fetch(`http://localhost:3000/events/add/${admin.infoAdmin.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((response) =>
        response.json().then((data) => ({
          ok: response.ok,
          status: response.status,
          data,
        }))
      )
      .then(({ ok, status, data }) => {
        if (!ok) {
          console.error("Erreur de création:", status, data);
          setMsgCreationEvent(
            data.message || `Erreur ${status}: Impossible de créer l'événement`
          );
          setIsCreated(false);
        } else {
          setMsgCreationEvent(data.message || "Événement créé avec succès!");
          setIsCreated(data.data?.result || data.result);

          if (data.data?.result || data.result) {
            resetForm();
          }
        }
      })
      .catch((error) => {
        console.error("Erreur réseau:", error);
        setMsgCreationEvent("Erreur de communication avec le serveur");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>Votre évènement</h2>
        <div className={styles.formButton}>
          <button
            onClick={handleSubmitEvent}
            disabled={isLoading}
            className={buttonStyles({ color: "primary" })}
          >
            {isLoading ? "Enregistrement en cours..." : "Enregistrer"}
          </button>
          <button
            className={buttonStyles({ color: "secondary" })}
            disabled={!isCreated || isLoading}
          >
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
              {/* Vous devez adapter le composant AddDate ou créer une interface alternative */}
              <AddDate form={form} handleFormChange={handleFormChange} />
            </div>
          </div>

          <div className={styles.secondBloc}>
            {/* <h3>Participants</h3>
            <div className={styles.boxContainer}>
              {participantInGroup.length === 0 ? (
                <p className={styles.emptyState}>Aucun participant sélectionné</p>
              ) : (
                participantInGroup.map((participant, index) => (
                  <p
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className={styles.participantTag}
                    key={index}
                  >
                    {participant.label}
                    <FontAwesomeIcon icon={faXmark} className={styles.removeIcon} />
                  </p>
                ))
              )}
            </div> */}
          </div>
        </div>
      </div>

      <p className={styles.requiredFields}>* Champs obligatoires</p>
    </div>
  );
}

export default AddEvent;
