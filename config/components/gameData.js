const joi = require('joi');

const envVarsSchema = joi.object({
  GAME_THUMBPREF: joi.string()
    .uri()
    .required(),
  GAME_HIGHLIGHTS_VIDEOPREF: joi.string()
    .uri()
    .required(),
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  gameData: {
    thumbPref: envVars.GAME_THUMBPREF,
    highlightsVideoPref: envVars.GAME_HIGHLIGHTS_VIDEOPREF
  }
};

module.exports = config;
