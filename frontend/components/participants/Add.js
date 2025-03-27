import styles from "../../styles/Participants.module.css";
import { buttonStyles } from "../modules/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/fr";

function Add() {
  const admin = useSelector((state) => state.admin.value);
  const [isCreated, setIsCreated] = useState(false);
  const [msgCreationParticipant, setMsgCreationParticipant] = useState("");

  const [formParticipant, setFormParticipant] = useState({
    firstName: "",
    lastName: "",
  });

  const [birthDateParticipant, setBirthDateParticipant] = useState(null);

  const [formFirstLegalGuardian, setFormFirstLegalGuardian] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [formSecondLegalGuardian, setFormSecondLegalGuardian] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleChangeParticipant = (e) => {
    const { name, value } = e.target;
    setFormParticipant((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleChangeBirthDay = (value) => {
    setBirthDateParticipant(value);
  };

  const handleChangeFirstLegalGuardian = (e) => {
    const { name, value } = e.target;
    setFormFirstLegalGuardian((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleChangeSecondLegalGuardian = (e) => {
    const { name, value } = e.target;
    setFormSecondLegalGuardian((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmitParticipant = () => {
    fetch("http://localhost:3000/participants/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formParticipant.firstName,
        lastName: formParticipant.lastName,
        pictureUrl: "",
        birthDate: birthDateParticipant,
        etablissementId: admin.etablissement,
        legalGuardian: [formFirstLegalGuardian, formSecondLegalGuardian],
        token: admin.token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setIsCreated(true);
          setMsgCreationParticipant(data.message);
        } else {
          console.log(data.participant);
          setIsCreated(false);
          setMsgCreationParticipant(data.message);

        }
      });
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerContainer}>
        <h2>Compléter les informations du participant</h2>
        <button
          onClick={handleSubmitParticipant}
          className={buttonStyles({ color: "secondary" })}
        >
          Ajouter
        </button>
      </div>
      <span
        style={{
          color: isCreated ? "green" : "red",
          fontWeight: "bold",
          fontSize: "13",
          display: "flex",
          justifyContent : "flex-end",
        }}
      >
        {msgCreationParticipant}
      </span>
      <div className={styles.formContainer}>
        <div>
          <div className={styles.inputGroup}>
            <h3 className={styles.titleSections}>Participant : </h3>
            <TextField
              className={styles.inputField}
              label="Prénom"
              value={formParticipant.firstName}
              onChange={handleChangeParticipant}
              name="firstName"
            />
            <TextField
              className={styles.inputField}
              label="Nom"
              value={formParticipant.lastName}
              onChange={handleChangeParticipant}
              name="lastName"
            />
            {/* Localization : permet de définir  le format des dates du composant MUI "DatePicker" */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <DatePicker
                className={styles.inputField}
                label="Date de naissance"
                value={birthDateParticipant}
                onChange={handleChangeBirthDay}
              />
            </LocalizationProvider>
          </div>
          <div className={styles.legalGuardian}>
            <h3 className={styles.titleSections}>Réprésentants légaux : </h3>
            <h4 className={styles.titleSections}>N°1 (obligatoire) : </h4>
            <div className={styles.inputGroup}>
              <TextField
                className={styles.inputField}
                name="firstName"
                label="Prénom"
                value={formFirstLegalGuardian.firstName}
                onChange={handleChangeFirstLegalGuardian}
              />
              <TextField
                className={styles.inputField}
                name="lastName"
                value={formFirstLegalGuardian.lastName}
                label="Nom"
                onChange={handleChangeFirstLegalGuardian}
              />
              <TextField
                className={styles.inputField}
                name="email"
                value={formFirstLegalGuardian.email}
                label="Email"
                onChange={handleChangeFirstLegalGuardian}
              />
              <TextField
                className={styles.inputField}
                name="phone"
                value={formFirstLegalGuardian.phone}
                label="Numéro de téléphone"
                onChange={handleChangeFirstLegalGuardian}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <h4 className={styles.titleSections}>N°2 (facultatif) : </h4>
            <TextField
              className={styles.inputField}
              name="firstName"
              label="Prénom"
              value={formSecondLegalGuardian.firstName}
              onChange={handleChangeSecondLegalGuardian}
            />
            <TextField
              className={styles.inputField}
              name="lastName"
              value={formSecondLegalGuardian.lastName}
              label="Nom"
              onChange={handleChangeSecondLegalGuardian}
            />
            <TextField
              className={styles.inputField}
              name="email"
              value={formSecondLegalGuardian.email}
              label="Email"
              onChange={handleChangeSecondLegalGuardian}
            />
            <TextField
              className={styles.inputField}
              name="phone"
              value={formSecondLegalGuardian.phone}
              label="Numéro de téléphone"
              onChange={handleChangeSecondLegalGuardian}
            />
          </div>
        </div>
        {/* <h3>Picture : </h3> */}
      </div>
    </div>
  );
}

export default Add;
