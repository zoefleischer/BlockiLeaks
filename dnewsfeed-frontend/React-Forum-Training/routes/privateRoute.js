const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Acces Denied");

  try {
    // const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    // Bypassing the verification step (NOT for production use)
    req.user = { id: '654e6337f621dd1644c3a587', name: 'test1234' }; // Mocked user object
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
