
const Admin = require("../models/admins");

function checkToken(token) {
  return Admin.findOne({ token: token }).then((data) => {
    if (data) {
      return true;
    } else {
      return false;
    }
  });
}

module.exports = { checkToken };
