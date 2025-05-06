const { API_TOKEN } = process.env;

const authenticate = (req, res, next) => {
  const token = req.header('api-key');
    if (token !== API_TOKEN) {
        return res.status(401).json({ error: 'Token inválido ou ausente.' });
    }
    next();
};

module.exports = authenticate;