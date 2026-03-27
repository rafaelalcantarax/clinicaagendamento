
module.exports = {
  info: (msg, meta = {}) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`, meta),
  error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`, err),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()}: ${msg}`)
};
