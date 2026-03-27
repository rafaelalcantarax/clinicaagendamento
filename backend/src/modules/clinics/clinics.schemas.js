
module.exports = {
  updateClinic: {
    name: (v) => typeof v === 'string' && v.length > 3,
    timezone: (v) => ['America/Sao_Paulo', 'UTC'].includes(v)
  }
};
