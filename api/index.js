// Nest is compiled with decorator metadata before Vercel bundles this Node handler.
module.exports = require('../backend/dist/vercel-bundle.cjs').default;
