const joi = require('joi');

const envVarsSchema = joi.object({
  STRIPE_PUBLIC_KEY: joi.string()
    .required(),
  STRIPE_SECRET_KEY: joi.string()
    .required()
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  stripe: {
    publicKey: envVars.STRIPE_PUBLIC_KEY,
    secretKey: envVars.STRIPE_SECRET_KEY,
  }
};

module.exports = config;
