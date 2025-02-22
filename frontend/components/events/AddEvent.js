import { useEffect, useState } from 'react';
import styles from '../../styles/Events.module.css';
import { Input } from '../modules/Input';
import { Dropdown } from '../modules/Dropdown';
import { DateInput } from '../modules/DateInput';

function AddEvent() {
  // État pour stocker la liste des groupes récupérés
  const [groupList, setGroupList] = useState([]);

  // État pour stocker les valeurs saisies dans le formulaire (+ groupe sélectionné)
  const [form, setForm] = useState({
    groupId: "", // L’ID du groupe sélectionné
    eventName: "", // Nom de l’événement
    location: "", // Lieu de l’événement
    participant: "", // Participant sélectionné
    startDate: "", // Date de début
    endDate: "", // Date de fin
  });

  // ID fictif d’établissement (remplace-le par une variable dynamique si nécessaire)
  const etablissementId = "67a73c9ebdc534b0b477c7d9";

  // Appel API pour récupérer les groupes
  useEffect(() => {
    fetch(`http://localhost:3000/groups/findAllByEtablissement/${etablissementId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          // Formatage des groupes pour le Dropdown
          const formattedGroups = data.data.map((group) => ({
            value: group._id, // Identifiant du groupe
            label: group.name, // Nom du groupe
          }));
          setGroupList(formattedGroups); // Mise à jour dans l’état
        } else {
          console.error("Erreur API :", data.message);
        }
      })
      .catch(console.error); // Gestion des erreurs réseau
  }, [etablissementId]);

  // Gestion des changements dans le formulaire (groupId, lieu, etc.)
  const handleFormChange = (e) => {
    const { name, value } = e.target; // Extraire le name et la valeur de l'élément déclencheur
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value, // Mettre à jour uniquement la propriété changée
    }));
  };

  return (
      <form className={styles.form}>      
          <Input label="Nom de votre évènement" />

          {/* Dropdown pour sélectionner un groupe */}
          <Dropdown
            label="Choix du groupe"
            name="groupId" // Nom du champ dans le state
            options={groupList} // Les groupes récupérés depuis l’API
            value={form.groupId} // Sélection actuelle
            onChange={handleFormChange} // Gérer le changement de sélection
          />

          <Dropdown label="Ajouter un participant">
          </Dropdown>

          <DateInput />
        
          <DateInput />

          <Input label="Lieu de votre évènement" />
      </form>
  );
}

export default AddEvent;