
module.exports = {
  sanitize: (phone) => phone.replace(/\D/g, ''),
  isValid: (phone) => {
    const clean = phone.replace(/\D/g, '');
    return clean.length >= 10 && clean.length <= 11;
  }
};
