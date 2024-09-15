const jwt = require('jsonwebtoken');
const JWT_SECRET = '!5mT;(AAr!}$,x17bB9Q"JG$b6{Z+m9|6(c6a9o|gro]1-1hI`';

exports.validateRequest = (req,res,next) => {
    const token = req.header('Authorization');
    if(!token)  {
        console.log('------token expired------');
        return res.status(401).json({
            message: 'Your session expired. please login!',
            status: 'UN_AUTHORIZED'});
    }
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        console.log('parsed response==========> ',decoded);
        req.loggedInPrincipal = decoded;
        next();
    }
    catch(err)  {
        return res.status(401).json({ message: 'Token is not valid',status: 'INVALID_TOKEN'});
    }
};