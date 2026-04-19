const verifyAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ mesaj: 'Acces interzis, necesita rol de admin' });
    }
    next();
};

export default verifyAdmin;