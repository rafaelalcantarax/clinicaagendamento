
// Mock de validação simples (pode ser expandido com Joi ou Zod)
module.exports = {
  login: {
    email: (v) => v && v.includes('@'),
    password: (v) => v && v.length >= 6
  },
  register: {
    name: (v) => !!v,
    email: (v) => v && v.includes('@'),
    clinicName: (v) => !!v
  }
};
