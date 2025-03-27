var express = require("express");
var router = express.Router();
const Etablissement = require("../models/etablissements");
const { checkBody } = require("../modules/checkBody");

// Route pour la création d'un nouvel établissement
router.post("/add", function (req, res) {
  const fields = ["name"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    const newEtablissement = new Etablissement({
      name: req.body.name,
    });

    newEtablissement.save().then((response) => {
      res.json({ result: true, message: "Etablissement créé" });
    });
  }
});

// Route pour récupérer les infos d'un établissement (à partir de l'ID)
router.get("/find/:etablissementId", (req, res) => {
  Etablissement.findOne({ _id: req.params.etablissementId }).then((data) => {
    if (data) {
      res.json({ result: true, data });
    } else {
      res.json({
        result: false,
        error: "Aucun établissement trouvé avec cet ID",
      });
    }
  });
});


// Route pour récupérer tous les établissements

router.get("/allEtablissements", (req, res) => {
  Etablissement.find().then((data) => {
    res.json({ result: true, data });
  });
});

module.exports = router;
