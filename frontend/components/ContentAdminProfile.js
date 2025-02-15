import styles from "../styles/adminProfile.module.css";
import Image from "next/image";
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';       <FontAwesomeIcon icon={faBookmark} />
//import { faBookmark, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function Content() {
  const token = useSelector((state) => state.admin.value.token);

  // Infos admin
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fonction, setFonction] = useState("");
  const [role, setRole] = useState("");
  const [picture, setPicture] = useState("");

  // Infos groupes gérés par l'admin
  const [groupsData, setGroupsData] = useState([]);
  let groupsList = [];

  useEffect(() => {
    // Récupération des infos relatives à l'admin lui-même
    fetch("http://localhost:3000/admins/findByToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFirstName(data.data.firstName);
        setLastName(data.data.lastName);
        setFonction(data.data.function);
        setRole(data.data.role);
        setPicture(data.data.pictureUrl);
      });

    // Récupération des infos relatives aux groupes gérés par l'admin
    fetch("http://localhost:3000/groups/findAllGroupsByAdminToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setGroupsData(
            data.data.map((element) => ({
              title: element.title,
              nbParticipants: element.participantIds.length,
            }))
          );
        }
      });
  }, []);

  // Transformation des données brutes des groupes pour affichage
  groupsList = groupsData.map((e) => {
    return (
      <li className={styles.list}>
        {e.title} - {e.nbParticipants} participant(s)
      </li>
    );
  });

  return (
    <div className={styles.mainContent}>
      {picture ? (
        <Image
          src={picture}
          alt="Ma photo de profil"
          width={100}
          height={100}
        />
      ) : (
        <Image
          src="/profil.webp"
          alt="Ma photo de profil"
          width={100}
          height={100}
        />
      )}
      <ul>
        <li className={styles.list}><strong>First name</strong> {firstName}</li>
        <li className={styles.list}><strong>Last name</strong> {lastName}</li>
        <li className={styles.list}><strong>Function</strong> {fonction}</li>
        <li className={styles.list}><strong>Role</strong> {role}</li>
      </ul>
      <span>Modifier mon profil</span>
      <h3>Mes stats</h3>
      <h3>Mes groupes</h3>
      <ul> 
        {groupsData.length === 0 ? (
          <span>Aucun groupe</span>
        ) : groupsList}
      </ul>
      <h3>Mes sorties</h3>
      <h3>Mes autorisations</h3>
    </div>
  );
}

export default Content;
