const licenseService = require("../service/LicenseService");

const checkDomainLicense = async (req, res) => {
  return licenseService.checkDomainLicense(req.body, res);
};

const addLicensedCompanyInRedis = async (req, res) => {
  return licenseService.addLicensedCompanyInRedis(req.body, res);
};

module.exports = {
  checkDomainLicense,
  addLicensedCompanyInRedis,
};
