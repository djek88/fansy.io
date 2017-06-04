const joi = require('joi');

const envVarsSchema = joi.object({
  HERO_ICONPREF: joi.string()
    .uri()
    .required(),
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  heroData: {
    iconPref: envVars.HERO_ICONPREF
  }
};

module.exports = config;
