const redisClient = require("../config/dbconfig/cachedbconfig/redisconfig");
const dbconfig = require("../config/dbconfig/dbconfigmain");
const { Company } = dbconfig.models;

const checkDomainLicense = async (req, res) => {
  const { companyDomain } = req;
  let companyDomainArray = [];
  try {
    const key = process.env.COMPANY;

    // Check if the requested company domain exists in the Redis Set
    const companyDetailsList = await redisClient.HGETALL(key);
    for (const companyId in companyDetailsList) {
      companyDomainArray.push(companyDetailsList[companyId]);
    }

    if (companyDomainArray.includes(companyDomain)) {
      res.status(200).json("Company license found");
    } else {
      res.status(404).json("Company or license doesn't exits");
    }
  } catch (error) {
    console.error("Error checkDomainLicense ", error);
    res.status(500).json("Internal Server Error");
  }
};

const addLicensedCompanyInRedis = async () => {
  try {
    let companyIdWiseDomainNameMap = new Map();
    const companyData = await Company.findAll();

    // Check for Data in Company
    if (companyData.length === 0) {
      console.warn("No data found in Company table");
      return;
    }

    // Extract company domain from the company data
    let companyDomainSubDomainSet= new Set();

    companyData.map((company) =>
        (companyDomainSubDomainSet.add(company.company_domain))
    );
    
    const key = process.env.COMPANY;

    // Delete the old Company Names
    await redisClient.del(key);

    // Add Company Names to the Redis Set
    companyData.forEach((company_data) => {
      const { company_domain, id } = company_data;
      companyIdWiseDomainNameMap.set(id, company_domain);
    });

    if (companyIdWiseDomainNameMap) {
      redisClient.hSet(key, companyIdWiseDomainNameMap, (err, reply) => {
        if (err) {
          console.error("No new Licensed Companies added in Redis");
          console.error(err);
        } else {
          console.log("Licensed Companies added in Redis");
        }
      });
    }

  } catch (error) {
    console.error("Error adding Licensed Companies in Redis", error);
    throw error;
  }
};

module.exports = {
  checkDomainLicense,
  addLicensedCompanyInRedis,
};
