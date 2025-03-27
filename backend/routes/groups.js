var express = require("express");
var router = express.Router();
const Group = require("../models/groups");
const Admin = require("../models/admins");
const { checkBody } = require("../modules/checkBody");
const { checkToken } = require("../modules/checkToken");
// Ajout d'un nouveau groupe avec etablisement et admin en params

router.post("/add/:adminId/:etablissementId", (req, res) => {
  const fields = ["title", "participantIds"];

  checkToken(req.body.token).then((data) => {
    if (!data) {
      return res.json({ result: false, message: "Token incorrect" });
    }
  

  console.log("CheckBody result:", req.body);
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  }

  // Vérif si le title du group n'est pas présent
  Group.findOne({ title: req.body.title }).then((response) => {
    if (response) {
      return res.json({
        result: false,
        message: " Ce nom de groupe est déjà existant",
      });
    } else {
      //on vérifie que participantIds est bien un tableau, pour ne pas se retrouver avec des formes différentes en BDD.
      const participantIds = Array.isArray(req.body.participantIds)
        ? req.body.participantIds
        : [req.body.participantIds];

      const newGroup = new Group({
        title: req.body.title,
        adminId: req.params.adminId,
        etablissementId: req.params.etablissementId,
        participantIds: participantIds,
      });

      newGroup.save().then((response) => {
        if (!response) {
          res.json({ result: false, message: "Impossible de créer le groupe" });
        } else {
          res.json({ result: true, message: "Groupe créé" });
        }
      });
    }
  });
})});

// Route pour rechercher tous les groups d'un établissement
router.get("/findAllGroupsByEtablissement/:etablissementId/:token", (req, res) => {
  const etablissementId = req.params.etablissementId;
  const token = req.params.token
  checkToken(req.params.token).then((data) => {
    if (!data) {
      return res.json({ result: false, message: "Token incorrect" });
    }


  Group.find({ etablissementId })
    .populate("adminId", "firstName lastName")
    .then((data) => {
      if (data.length === 0) {
        res.json({
          result: false,
          message: "Aucun groupe trouvé pour cet établissement.",
        });
      } else {
        res.json({
          result: true,
          allGroups: data,
        });
      }
    });
})});

router.get("/findOneGroup/:groupId", (req, res) => {
  Group.findOne({ _id: req.params.groupId })
    .populate({ path: "participantIds", select: "firstName lastName" })
    .then((data) => {
      if (!data) {
        return res.json({ result: false, message: "Aucun groupe trouvé" });
      } else {
        return res.json({
          result: true,
          group: data,
          message: `Groupe :  ${data.title} trouvé`,
        });
      }
    });
});

router.delete("/:groupId/:token", (req, res) => {
  const token = req.params.token
  checkToken(req.params.token).then((data) => {
    if (!data) {
      return res.json({ result: false, message: "Token incorrect" });
    }

  Group.deleteOne({ _id: req.params.groupId }).then((data) => {
    if (data.deletedCount > 0) {
      return res.json({ result: true, message: "Groupe supprimé" });
    } else {
      return res.json({
        result: false,
        message: "Aucun groupe trouvé avec cet ID",
      });
    }
  });
})});

router.put("/modify/:groupId/:token", (req, res) => {
  const fields = ["title", "participantIds"];

  const token = req.params.token
  checkToken(req.params.token).then((data) => {
    if (!data) {
      return res.json({ result: false, message: "Token incorrect" });
    }
  console.log("CheckBody result:", req.body);
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  }

  Group.findOneAndUpdate({ _id: req.params.groupId }, req.body, {
    new: true,
  }).then((data) => {
    if (data) {
      return res.json({
        result: true,
        message: "Votre groupe a été modifié",
        data,
      });
    } else {
      return res.json({ result: false, message: "Aucun groupe trouvé" });
    }
  });
})});

// ADMIN Page

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

// DashbordPage

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

module.exports = router;
