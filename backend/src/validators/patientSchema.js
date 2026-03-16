const { z } = require('zod');

const patientSchema = z.object({
  patientName: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.string().optional(),
  age: z.string().regex(/^\d+$/).transform(Number).or(z.number()).optional(),
});

module.exports = patientSchema;
