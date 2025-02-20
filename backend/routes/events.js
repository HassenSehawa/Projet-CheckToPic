var express = require("express");
var router = express.Router();
const Event = require("../models/events");
const { checkBody } = require("../modules/checkBodyModify");

const Group = require("../models/groups");
const Participant = require("../models/participants");

// Route pour la création d'un nouvel event
router.post("/add", (req, res) => {
  const fields = [
    "title",
    "adminId",
    "authorisations",
    "groupId",
    "participantID",
    "dateStart",
    "dateEnd",
    "place",
    "supportsCom",
  ];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    const newEvent = new Event({
      title: req.body.title,
      adminId: req.body.adminId,
      authorisations: req.body.authorisation,
      groupId: req.body.groupId,
      participantId: req.body.participantId,
      dateStart: req.body.dateStart,
      dateEnd: req.body.dateEnd,
      place: req.body.place,
      supportsCom: req.body.supportsCom
    });

    newEvent.save().then((response) => {
      res.json({ response });
    });
  }
});

// Route pour rechercher un évènément en fonction de l'admin qui est connecté

/* Route pour récupérer les événements créés par un admin
la router.get("/eventsByAdmin/:token", (req, res) => { 
  permet de gérer explicitement les requêtes GET sur l'URL /eventsByAdmin/:token
  où :token est un paramètre de la requête
*/ 
router.get("/eventsByAdmin/:token", (req, res) => {
  const fields = ["token"];

  // Vérification de la présence des données
  if (!checkBody(req.params, fields)) {
    res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    // Récupération des événements associés à l'admin
    Event.find({ adminId: req.params.token }).then((response) => {
      if (response.length === 0) {
        res.json({
          result: false,
          message: "Aucun événement trouvé pour cet admin",
        });
      } else {
        res.json({ result: true, data: response });
      }
    });
  }
});

/* Route pour récupérer tous les groupes associés à un établissement
en fonction de l'administeur connecté */
router.post("/findAllGroupsByEtablissement", (req, res) => {
  const token = req.body.token;
  // Récupérer l'ID de l'établissement de l'administrateur à partir du token
  const etablissementId = getEtablissementIdFromToken(token);
  Group.find({ etablissement: etablissementId })
    .then(groups => res.json(groups))
    .catch(error => res.status(500).json({ message: error.message }));
});



// Route pour récupérer tous les participants associé à un établissement
router.post("/findAllParticipantsByEtablissement", (req, res) => {
  Participant.find({ etablissement: req.body.etablissement })
    .then(participants => res.json(participants))
    .catch(error => res.status(500).json({ message: error.message }));
});

module.exports = router;
