var express = require("express");
var router = express.Router();

const Admin = require("../models/admins");
const Etablissement = require("../models/etablissements");

const uid2 = require("uid2"); // Token
const bcrypt = require("bcrypt"); // Mot de passe
const uniqid = require("uniqid"); // ID unique pour les images

const { checkBody } = require("../modules/checkBody");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Route pour l'ajout d'un admin en BDD (signup)
router.post("/signup", (req, res) => {
  const fields = [
    "firstName",
    "lastName",
    "position",
    "role",
    "email",
    "password",
    "etablissement",
  ];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    return res.json({
      result: false,
      message: "Tous les champs sont requis backend ",
    });
  }

  // Recherche préalable de l'établissement ID à partir du nom (string)

  Etablissement.findOne({ name: req.body.etablissement }).then((data) => {
    if (!data) {
      return res.json({ result: false, message: "Établissement non trouvé" });
    }

    // Check si l'admin n'existe pas déjà via son email
    Admin.findOne({ email: req.body.email }).then((response) => {
      if (response) {
        return res.json({
          result: false,
          message: "L'adresse mail est déjà utilisée",
        });
      } else {
        // Enregistrement de l'admin en BDD
        const newAdmin = new Admin({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          position: req.body.position,
          role: req.body.role,
          pictureUrl: "",
          etablissement: data._id,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10),
          token: uid2(32),
        });

        newAdmin.save().then((response) => {
          return res.json({
            result: true,
            token: response.token,
            etablissement: response.etablissement,
            infoAdmin: {
              firstName: response.firstName,
              lastName: response.lastName,
              position: response.position,
              role: response.role,
              pictureUrl: response.pictureUrl,
              id: response._id,
            },
          });
        });
      }
    });
  });
});

// Route pour la connexion de l'admin (signin)
router.post("/signin", (req, res) => {
  const fields = ["email", "password"];

  // Vérification de la présence des données
  if (!checkBody(req.body, fields)) {
    return res.json({ result: false, message: "Champs manquants ou vides" });
  } else {
    Admin.findOne({ email: req.body.email }).then((response) => {
      if (
        response &&
        bcrypt.compareSync(req.body.password, response.password)
      ) {
        return res.json({
          result: true,
          token: response.token,
          etablissement: response.etablissement,
          infoAdmin: {
            firstName: response.firstName,
            lastName: response.lastName,
            position: response.position,
            role: response.role,
            pictureUrl: response.pictureUrl,
            id: response._id,
          },
        });
      } else {
        return res.json({
          result: false,
          message: "Mot de passe ou email incorrect",
        });
      }
    });
  }
});

// Route pour modifier les infos d'un admin (via son token)
router.put("/updateByToken", (req, res) => {
  const mandatoryFields = ["token"];

  // Vérification de la présence des données
  if (!checkBody(req.body, mandatoryFields)) {
    res.json({ result: false, message: "Token manquant ou vide" });
  } else {
    let modifiedObject = {};

    // Modification de firstName
    if (req.body.firstName) {
      modifiedObject.firstName = req.body.firstName;
    }

    // Modification de lastName
    if (req.body.lastName) {
      modifiedObject.lastName = req.body.lastName;
    }

    // Modification de position
    if (req.body.position) {
      modifiedObject.position = req.body.position;
    }

    // Modification de role
    if (req.body.role) {
      modifiedObject.role = req.body.role;
    }

    // Modification de pictureUrl
    if (req.body.pictureUrl) {
      modifiedObject.pictureUrl = req.body.pictureUrl;
    }

    // Modification de email
    if (req.body.email) {
      modifiedObject.email = req.body.email;
    }

    // Modification de etablissement
    if (req.body.etablissement) {
      modifiedObject.etablissement = req.body.etablissement;
    }

    // Modification de password
    if (req.body.password) {
      modifiedObject.password = bcrypt.hashSync(req.body.password, 10);
    }

    Admin.updateOne({ token: req.body.token }, modifiedObject).then((data) => {
      if (data.modifiedCount === 1) {
        Admin.findOne({ token: req.body.token })
          .select("-_id -password")
          .then((data) => {
            res.json({ result: true, data });
          });
      } else {
        res.json({ result: false, message: "Aucun champ modifié" });
      }
    });
  }
});

// Route pour gérer la mise à jour de la photo admin
router.put("/updatePicture/:token", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`; // Génération d'un nom de fichier unique avec chemin
  const resultMove = await req.files.newAdminPicture.mv(photoPath); // Déplacement vers dossier tmp

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath); // Upload sur Cloudinary
    fs.unlinkSync(photoPath); // On supprime la photo du dossier tmp

    // On va chercher l'admin à partir de son token pour pouvoir modifier sa photo en BDD
    let adminId = "";
    Admin.findOne({ token: req.params.token }).then((data) => {
      if (!data) {
        res.json({ result: false, error: "Aucun admin trouvé avec ce token" });
      } else {
        adminId = data._id;
        Admin.updateOne(
          { _id: adminId },
          { pictureUrl: resultCloudinary.secure_url }
        ).then((data) => {
          if (data.modifiedCount > 0) {
            Admin.findOne({ _id: adminId }).then((data) => {
              // On refait un findOne car on a besoin de renvoyer au frontend les infos complètes du document pour la mise à jour du reducer
              res.json({ result: true, data });
            });
          } else {
            res.json({ result: false, error: "Photo non modifiée en BDD" });
          }
        });
      }
    });
  } else {
    res.json({ result: false, error: resultCopy });
  }
});

module.exports = router;
