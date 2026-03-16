const prisma = require('../prisma/client');
const { z } = require('zod');
const patientSchema = require('../validators/patientSchema');

exports.getPatients = async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = search ? {
    OR: [
      { patientName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  } : {};

  try {
    const [patients, count] = await prisma.$transaction([
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);
    
    res.json({
      data: patients,
      meta: {
        total: count,
        page: parseInt(page),
        last_page: Math.ceil(count / take)
      }
    });

  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await prisma.patient.findUnique({
      where: { patientId: parseInt(id) },
      include: { 
          appointments: {
              include: { doctor: true, medicalRecord: true },
              orderBy: { appointmentDateTime: 'desc' }
          },
          bills: {
              include: { items: true },
              orderBy: { createdAt: 'desc' }
          }
      }
    });
    if (!patient) return res.status(404).json({ error: { message: 'Patient not found' } });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const data = patientSchema.parse(req.body);
    const patient = await prisma.patient.create({ data });
    res.status(201).json(patient);
  } catch (error) {
     if (error instanceof z.ZodError) {
         return res.status(400).json({ error: { message: 'Validation error', details: error.errors } });
     }
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const data = patientSchema.parse(req.body);
    const patient = await prisma.patient.update({
      where: { patientId: parseInt(id) },
      data
    });
    res.json(patient);
  } catch (error) {
     if (error instanceof z.ZodError) {
         return res.status(400).json({ error: { message: 'Validation error', details: error.errors } });
     }
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.patient.delete({ where: { patientId: parseInt(id) } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
