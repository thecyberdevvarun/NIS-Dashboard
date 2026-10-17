/** Reads ?page & ?pageSize safely and returns SQL offset values. */
module.exports = (req, defaultSize = 10) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || defaultSize, 1), 200);
  return { page, pageSize, offset: (page - 1) * pageSize };
};
