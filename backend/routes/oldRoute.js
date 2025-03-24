// Admin

// Route pour rechercher un admin en particulier (à partir de son token)

router.post("/findByToken", (req, res) => {
  const fields = ["token"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    Admin.findOne({ token: req.body.token }).then((response) => {
      if (!response) {
        return res.json({
          result: false,
          message: "Aucun admin trouvé avec ce token",
        });
      } else {
        return res.json({ result: true, data: response });
      }
    });
  }
});


// Route pour rechercher tous les admins d'un établissement
router.get("/findAllByEtablissement/:etablissementId", (req, res) => {
  Admin.find({ etablissement: req.params.etablissementId }).then((data) => {
    if (data.length === 0) {
      return res.json({
        result: false,
        message: "Aucun admin sur cet établissement ou établissement inconnu",
      });
    } else {
      return res.json({ result: true, data });
    }
  });
});

// Route pour supprimer un admin (via son ID)
router.delete("/deleteById", (req, res) => {
  const fields = ["adminId"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    Admin.deleteOne({ _id: req.body.adminId }).then((response) => {
      if (response.deletedCount > 0) {
        return res.json({ result: true, message: "Admin supprimé" });
      } else {
        return res.json({
          result: false,
          message: "Aucun admin trouvé avec cet ID",
        });
      }
    });
  }
});

// Participant


// PUT route pour mettre à jour un participant = à terminer
router.put("/modify/:participantId", (req, res) => {
  const fields = ["firstName", "lastName", "email", "phone", "birthDate"];
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  }

  Participant.findByIdAndUpdate(
    req.params.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      birthDate: req.body.birthDate,
    },
    { new: true }
  ).then((updatedParticipant) => {
    if (!updatedParticipant) {
      return res.json({ result: false, message: "Participant non trouvé" });
    }
    res.json({
      result: true,
      message: "Participant mis à jour",
      participant: updatedParticipant,
    });
  });
});

//Groupes

// / Route pour récupérer les groupes d'un admin en particulier (à partir de l'ID via le token)

router.post("/findAllGroupsByAdminToken", (req, res) => {
  const fields = ["token"];
  let adminId = "";

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    Admin.findOne({ token: req.body.token }).then((data) => {
      if (!data) {
        res.json({
          result: false,
          message: "Aucun admin trouvé avec ce token",
        });
      } else {
        adminId = data._id;
        Group.find({ adminId })
          .populate("participantIds", "pictureUrl -_id") // Populate pour récupérer seulement les pictureUrl des participants
          .then((data) => {
            if (data.length === 0) {
              res.json({
                result: false,
                message: "Aucun groupe trouvé pour cet admin",
              });
            } else {
              res.json({ result: true, data });
            }
          });
      }
    });
  }
});

// Route pour rechercher tous les groups d'un établissement (avec populate participants)
router.get(
  "/findAllByEtablissementWithParticipantInfos/:etablissement",
  (req, res) => {
    const { etablissement } = req.params; // Extraction du paramètre depuis req.params

    // Vérification de la présence des données
    if (!etablissement) {
      return res.json({
        result: false,
        message: "L'identifiant de l'établissement est manquant.",
      });
    }

    // Recherche des groupes dans la base MongoDB
    Group.find({ etablissementId: req.params.etablissement })
      .populate("participantIds", "pictureUrl -_id")
      .then((data) => {
        if (data.length === 0) {
          res.json({
            result: false,
            message: "Aucun groupe trouvé pour cet établissement.",
          });
        } else {
          res.json({
            result: true,
            data, // Renvoie les groupes trouvés
          });
        }
      });
  }
);

// Etalissement 

// Route pour récupérer tous les établissements

router.get("/allEtablissements", (req, res) => {
  Etablissement.find().then((data) => {
    res.json({ result: true, data });
  });
});


// Events

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

// Route pour valider une autorisation dans un event (par l'admin)
router.put("/validateAuth/:authId", (req, res) => {
  Event.findOne({ "authorisations._id": req.params.authId }).then((data) => {
    if (!data) {
      res.json({ result: false, message: "Autorisation introuvable" });
    } else {
      Event.updateMany(
        { "authorisations._id": req.params.authId },
        { $set: { "authorisations.$.isValidated": true } } // $set et $ permettent de cibler l'autorisation à modifier
      ).then((data) => {
        if (data.modifiedCount = 0) {
          res.json({result: false, error: "Impossible de modifier cette autorisation"})
        } else {
          res.json({result: true, message: "Autorisation validée par l'admin"})
        }
      });
    }
  });
});

// Route pour récupérer les events d'un groupe
router.get("/getEventByGroup", (req, res) => {
  const fields = ["groupId"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    Event.find({ _id: req.body.groupId }).then((response) => {
      if (response.findCount > 0) {
        res.json({ result: true, message: "Evénement trouvé" });
      } else {
        res.json({
          result: false,
          message: "Aucun événement trouvé avec cet ID",
        });
      }
    });
  }
});

// Route pour récupérer les événements créés par un admin via le token de l'admin
router.get("/eventsByAdmin/:token", (req, res) => {
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
      return Event.find({ adminId: admin._id });
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

// Route pour récupérer les événements créés par un admin via le token de l'admin (avec populate sur authorisations pour récupérer les infos participants)
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

// Route pour récupérer les événements d'un établissement via l'ID (avec populate sur authorisations pour récupérer les infos participants)
router.get(
  "/eventsByEtablissementWithParticipantInfos/:etablissementId",
  (req, res) => {
    // Vérifie si l'admin existe via son token
    Etablissement.findOne({ _id: req.params.etablissementId })
      .then((admin) => {
        if (!admin) {
          return res.json({
            result: false,
            message: "Aucun admin trouvé avec ce token",
          });
        }

        // Si l'établissement est trouvé, récupère les événements liés à l'établissement
        return Event.find({
          etablissement: req.params.etablissementId,
        }).populate(
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
  }
);

