const LDAPsetting = require("../model/modules/ldapsetting/LDAPsetting");

const checkLDAPSetting = async (req, res, next) => {
  try {
    const ldapData = await LDAPsetting.find();

    if (ldapData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Add LDAP Setting",
      });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = checkLDAPSetting;
