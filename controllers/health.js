exports.heartbeat = (req,res,next) => {
    res.send({message: 'connected'});
}

exports.health = (req,res,next) => {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello FROM Yonkers API Service!, Shockwave");
}

