var express = require("express");
var router = express.Router();
const Participant = require("../models/participants");
const { checkBody } = require("../modules/checkBody");


// Route pour la création d'un nouveau participant 
router.post("/add", (req, res) => {
  const fields = ["firstName", "lastName", "birthDate", "legalGuardian"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  }  

  const etablissementId = req.params.etablissementId

    const newParticipant = new Participant({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        pictureUrl: req.body.pictureUrl,
        birthDate: req.body.birthDate,
        etablissementId: req.body.etablissementId,
        legalGuardian : req.body.legalGuardian

    });

    newParticipant.save().then((response) => {
      if(!response) {
        res.json({ result : false, message : "Impossible de créer un participant"})
      } else {
        res.json({ result: true, message: "Participant créé", participant: response });
      }
    })
  
});

// GET route pour récupérer un participant
router.get("/:participantId", (req, res) => {
  Participant.findById(req.params.id)
    .then((participant) => {
      if (!participant) {
        return res.json({ result: false, message: "Participant non trouvé" });
      }
      res.json({ result: true, participant });
    })
});

// GET Route pour rechercher tous les participants d'un établissement
router.get("/findAllByEtablissement/:etablissementId", (req, res) => {
    Participant.find({ etablissementId: req.params.etablissementId }).then((data) => {
      if (data.length === 0) {
        res.json({
          result: false,
          message: "Aucun participant sur cet établissement ou établissement inconnu",
        });
      } else {
        res.json({ result: true, allParticipants : data  });
      }
    });
});

// PUT route pour mettre à jour un participant = à terminer


// DELETE route pour supprimer un participant
router.delete("/delete/:participantId", (req, res) => {
  Participant.deleteOne({ _id : req.params.participantId }).then((data) => {
    if (data.deletedCount > 0) {
      return res.json({ result: true, message: "Participant supprimé" });
    } else {
      return res.json({ result: false, message: "Aucun participant trouvé avec cet ID" });
    }
    
  });
});

module.exports = router;
