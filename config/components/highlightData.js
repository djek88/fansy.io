const joi = require('joi');

const envVarsSchema = joi.object({
  HIGHLIGHT_THUMBPREF: joi.string()
    .uri()
    .required(),
  HIGHLIGHT_VIDEOPREF: joi.string()
    .uri()
    .required(),
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  highlightData: {
    thumbPref: envVars.HIGHLIGHT_THUMBPREF,
    videoPref: envVars.HIGHLIGHT_VIDEOPREF
  }
};

module.exports = config;
