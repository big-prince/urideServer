import Joi from "joi";
import validate from './custom.validation.js';

export const bookJet = {
  params: Joi.object().keys({
    flightId: Joi.string().required().custom(validate.objectId),
  }),
  body: Joi.object().keys({
    scheduleIndex: Joi.number().integer().min(0).required(),
    selectedSeat: Joi.string().optional(),
    enableJetShare: Joi.boolean().optional(),
    maxJetSharePassengers: Joi.number().optional(),
    jetSharePricePerSeat: Joi.number().optional(),
    passengerInfo: Joi.object()
      .keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        passportNumber: Joi.string().required(),
        dateOfBirth: Joi.date().iso().required(),
        address: Joi.string().required(),
        country: Joi.string().required(),
      })
      .required(),
  }),
};
