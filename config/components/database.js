const joi = require('joi');

const envVarsSchema = joi.object({
  DB_HOST: joi.string()
    .hostname()
    .required(),
  DB_LOGIN: joi.string()
    .required(),
  DB_PASSWORD: joi.string()
    .required(),
  DB_NAME: joi.string()
    .required()
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  database: {
    host: envVars.DB_HOST,
    login: envVars.DB_LOGIN,
    password: envVars.DB_PASSWORD,
    dbName: envVars.DB_NAME,
  }
};

module.exports = config;
