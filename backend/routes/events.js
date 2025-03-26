var express = require("express");
var router = express.Router();

const Event = require("../models/events");

// REVOIR TOUTES LES ROUTES = utilisation de chatGPT par Sarah


// Route pour la création d'un nouvel event
router.post("/add/:adminId", (req, res) => {
  const fields = [
    "title",
    "adminId",
    "authorisations",
    "groupId",
    "dateStart",
    "dateEnd",
    "place",
    "supportsCom",
    "etablissement",
  ];

  const optionalFields = ["authorisations", "supportsCom"];

  console.log("Body reçu:", req.body);
  console.log("Champs attendus:", fields);
  console.log("Champs optionnels:", optionalFields);


  const newEvent = new Event({
    title: req.body.title,
    adminId: req.params.adminId,
    authorisations: req.body.authorisations,
    groupId: req.body.groupId,
    dateStart: req.body.dateStart,
    dateEnd: req.body.dateEnd,
    place: req.body.place,
    supportsCom: req.body.supportsCom,
    etablissement: req.body.etablissementId,
  });

  newEvent
    .save()
    .then(() => {
      res.status(200).json({ response: true, message: "Évènement créé" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ result: false, message: "Erreur lors de la création", error });
    });
});
// Route pour récupérer tous les events d'un établissement
router.get("/findEventsByEtablissement/:etablissementId", (req, res) => {
  Event.find({ etablissement: req.params.etablissementId })
    .populate({ path: "groupId", select: "participantIds" })
    .then((data) => {
      if (data.length === 0) {
        return res.json({
          result: false,
          message: "Aucun événement pour cet établissement",
        });
      } else {
        return res.json({ result: true, allEvents: data });
      }
    });
});

// Route pour modifier un évènement
router.put("/update/:eventId", (req, res) => {
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

  // Vérification des champs
  if (!checkBody(req.body, fields)) {
    return res
      .status(400)
      .json({ result: false, message: "Champs manquants ou vides" });
  }

  Event.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      adminId: req.body.adminId,
      authorisations: req.body.authorisation,
      groupId: req.body.groupId,
      participantId: req.body.participantId,
      dateStart: req.body.dateStart,
      dateEnd: req.body.dateEnd,
      place: req.body.place,
      supportsCom: req.body.supportsCom,
    },
    { new: true }
  )
    .then((updatedEvent) => {
      if (!updatedEvent) {
        return res
          .status(404)
          .json({ result: false, message: "Évènement non trouvé" });
      }
      res.status(200).json({
        result: true,
        message: "Évènement mis à jour",
        event: updatedEvent,
      });
    })
    .catch((error) => {
      res.status(500).json({ result: false, message: "Erreur serveur", error });
    });
});

// Route pour supprimer un event (via son ID)
router.delete("/:eventId", (req, res) => {
  const fields = ["eventId"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    Event.deleteOne({ _id: req.body.eventId }).then((response) => {
      if (response.deletedCount > 0) {
        res.json({ result: true, message: "Evénement supprimé" });
      } else {
        res.json({
          result: false,
          message: "Aucun évènement trouvé avec cet ID",
        });
      }
    });
  }
});

// AdminPage

router.get("/eventsByAdminWithParticipantInfos/:token", (req, res) => {
  // Vérifie si l'admin existe via son token
  Admin.findOne({ token: req.params.token })
    .then((admin) => {
      if (!admin) {
        return res.json({
          result: false,
          message: "Aucun admin trouvé avec ce token",
        });
      }

      // Si l'admin est trouvé, récupère les événements liés à l'admin
      return Event.find({ adminId: admin._id }).populate(
        "authorisations.participant",
        "pictureUrl firstName lastName -_id"
      );
    })
    .then((events) => {
      if (!events || events.length === 0) {
        return res.status(404).json({
          result: false,
          message: "Aucun événement trouvé pour cet admin",
        });
      }

      res.status(200).json({ result: true, data: events });
    });
});

// dashboardPage


// Route pour récupérer les autorisations d'un events via son ID
router.post("/autorisationByEvent", (req, res) => {
  const fields = ["eventId"];

  // Vérification de la présence des données dans le body
  if (!checkBody(req.body, fields)) {
    return res
      .status(400)
      .json({ result: false, message: "Champs manquants ou vides" });
  }

  // Extraction de l'eventId du body
  const { eventId } = req.body;

  // Recherche de l'event via son ID
  Event.findById(eventId).then((event) => {
    if (!event) {
      return res.status(404).json({
        result: false,
        message: "Aucun événement trouvé avec cet ID",
      });
    }

    // Si l'event est trouvé, renvoyer les autorisations
    res.status(200).json({
      result: true,
      data: event.authorisations, // Supposons que les autorisations sont stockées dans ce champ
    });
  });
});



module.exports = router;
