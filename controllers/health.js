exports.heartbeat = (req,res,next) => {
    res.send({message: 'connected to Yonkers API V1.0'});
}

exports.health = (req,res,next) => {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello FROM Yonkers API Service!, Shockwave");
}

exports.secured = (req,res,next) => {
    res.send({accessTokenFromAPI: req.jwt});
}


