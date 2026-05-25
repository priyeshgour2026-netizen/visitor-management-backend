const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔐 Auth check - Token present:', !!token);
    
    if (!token) {
        console.log('❌ No token, returning 401');
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for:', decoded.email);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('❌ Invalid token:', error.message);
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Invalid token, but optional so continue
        }
    }
    next();
};

module.exports = { authenticateJWT, optionalAuth };