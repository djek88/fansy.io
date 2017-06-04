const joi = require('joi');

const envVarsSchema = joi.object({
  SERVER_PORT: joi.number()
    .integer()
    .positive()
    .required()
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  server: {
    port: envVars.SERVER_PORT
  }
};

module.exports = config;
