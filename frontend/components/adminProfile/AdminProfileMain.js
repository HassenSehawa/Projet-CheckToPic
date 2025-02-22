import styles from "../../styles/adminProfile.module.css";
import Image from "next/image";
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';       <FontAwesomeIcon icon={faBookmark} />
//import { faBookmark, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modify } from "../../reducers/admin";
import { Modal, Box, Button, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import AdminProfileAuthorizations from "./AdminProfileAuthorizations";
import AdminProfileGroups from "./AdminProfileGroups";
import AdminProfileEvents from "./AdminProfileEvents";

function AdminProfileMain() {
  // Initialisation redux
  const dispatch = useDispatch();
  const token = useSelector((state) => state.admin.value.token);
  const infoAdmin = useSelector((state) => state.admin.value.infoAdmin);

  // Modal modifications des infos admin
  const [open, setOpen] = useState(false);

  // Toggles pour les tabs
  const [showGroups, setShowGroups] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showAuthorizations, setShowAuthorizations] = useState(false);

  // Force reload (à optimiser si j'ai le temps)
  const [forceReload, setForceReload] = useState(false);

  // Formulaire pour les modifications des infos admins (sauf pictureUrl qui est gérée à part)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    position: "",
    role: "",
    email: "",
    etablissement: "",
    password: "",
  });

  const handleToggleModal = () => {
    setOpen(!open);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Etat pour stocker temporairement la nouvelle photo admin si elle est uploadée
  const [adminImg, setAdminImg] = useState(null);

  const handleChangeImage = (e) => {
    setAdminImg(e.target.files);
  };

  const handleSubmit = () => {
    setOpen(!open);
    fetch("http://localhost:3000/admins/updateByToken", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(modify(data.data)); // Mise à jour des infos reducer
          setForceReload(!forceReload); // A optimiser si j'ai le temps
        }
      });

    // Update de l'image
    const formData = new FormData();
    formData.append("newAdminPicture", adminImg[0], token);

    fetch(`http://localhost:3000/admins/updatePicture/${token}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(modify(data.data)); // Mise à jour des infos reducer
        setForceReload(!forceReload); // A optimiser si j'ai le temps
      });
  };

  const handleToggleTab = (tabName) => {
    if (tabName === "groups") {
      setShowGroups(!showGroups);
      setShowEvents(false);
      setShowAuthorizations(false);
    }
    if (tabName === "events") {
      setShowEvents(!showEvents);
      setShowGroups(false);
      setShowAuthorizations(false);
    }
    if (tabName === "authorizations") {
      setShowAuthorizations(!showAuthorizations);
      setShowGroups(false);
      setShowEvents(false);
    }
  };

  let modificationPopin = (
    <Modal open={open} onClose={handleToggleModal}>
      <Box sx={styleModal}>
        {/* Formulaire */}
        <Box sx={styleContainer}>
          <TextField
            type="text"
            label="Prénom"
            name="firstName"
            onChange={handleChangeForm}
          />
          <TextField
            type="text"
            label="Nom"
            name="lastName"
            onChange={handleChangeForm}
          />
          <TextField
            type="text"
            label="Fonction"
            name="position"
            onChange={handleChangeForm}
          />
          <TextField
            type="text"
            label="Email"
            name="email"
            onChange={handleChangeForm}
          />
          <TextField
            type="password"
            label="Mot de passe"
            name="password"
            onChange={handleChangeForm}
          />
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          >
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => handleChangeImage(event)}
            />
            Modifier ma photo
          </Button>
        </Box>
        {/* Footer avec les deux boutons */}

        <Box sx={styleFooter}>
          <Button sx={buttonCloseStyle} onClick={handleToggleModal}>
            Fermer
          </Button>
          <Button sx={buttonSignUpStyle} onClick={handleSubmit}>
            Valider
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  return (
    <div className={styles.mainContent}>
      <div className={styles.upperInfos}>
        <div className={styles.picContainer}>
          {infoAdmin.pictureUrl ? (
            <Image
              src={infoAdmin.pictureUrl}
              alt="Ma photo de profil"
              width={200}
              height={200}
            />
          ) : (
            <Image
              src="/profil.webp"
              alt="Ma photo de profil"
              width={200}
              height={200}
            />
          )}
        </div>
        <div className={styles.adminInfos}>
          <div className={styles.fullName}>
            {infoAdmin.firstName} <span className={styles.lastName}>{infoAdmin.lastName}</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div>Fonction : {infoAdmin.position}</div>
            <div>Rôle : {infoAdmin.role}</div>
          </div>
          <Button style={{border: "1px solid"}} onClick={handleToggleModal} >
            Modifier mon profil
          </Button>
          {modificationPopin}
        </div>
      </div>
      <div className={styles.tabBar}>
        <h3
          className={styles.tab}
          style={{ color: showGroups ? "var(--main-bg-color)" : "" }}
          onClick={() => handleToggleTab("groups")}
        >
          Tous mes groupes
        </h3>
        <h3
          className={styles.tab}
          style={{ color: showEvents ? "var(--main-bg-color)" : "" }}
          onClick={() => handleToggleTab("events")}
        >
          Toutes mes sorties
        </h3>
        <h3
          className={styles.tab}
          style={{ color: showAuthorizations ? "var(--main-bg-color)" : "" }}
          onClick={() => handleToggleTab("authorizations")}
        >
          Toutes mes autorisations
        </h3>
      </div>
      {showGroups && <AdminProfileGroups />}
      {showEvents && <AdminProfileEvents />}
      {showAuthorizations && <AdminProfileAuthorizations />}
    </div>
  );
}
// MODAL STYLE
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

const styleButtonOpenModal = {
  bgcolor: "white",
  fontSize: "0.75rem",
  color: "#031EAD",
};

const styleHeader = {
  textAlign: "center",
  pb: 5,
  fontSize: "1.1rem",
};

const styleContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 2.5,
  padding: 1,
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
const buttonSignUpStyle = {
  bgcolor: "#031EAD",
  color: "white",
  fontSize: "0.90rem",
  width: 100,
};

const styleErrorSignUp = {
  display: "flex",
  justifyContent: "center",
  color: "red",
};

const styleSuccesSignUp = {
  display: "flex",
  justifyContent: "center",
  color: "green",
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default AdminProfileMain;
