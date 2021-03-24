let mySql = require('mysql');
let _ = require('lodash');
let env = require('../config.js');
let HttpStatus = require('http-status-codes');
let Errors = require('../errors');

var pool = mySql.createPool({
    connectionLimit: 10,
    host: env.host,
    user: env.user,
    password: env.password,
    database: env.database,
    connectionLimit: 100,
    charset: 'utf8mb4',
    debug: false
});

exports.getAllComments = (req, res, next) => {
    const query = `SELECT PS.id, PS.author, PS.post, PS.timestamp, PR.timestamp as 'replyTimestamp' ,PR.author as 'replyAuthor', PR.reply
    FROM yonkers.posts PS
    LEFT JOIN yonkers.post_replies PR ON PR.postId = PS.id
    `;

    pool.getConnection((connectionError, conn) => {
        if (connectionError) {
            if (connectionError instanceof Errors.NotFound) {
                return res.status(HttpStatus.NOT_FOUND).send({message: connectionError.message});  
            }
            console.log(connectionError);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); // 500
        } else {
            pool.query(query, (queryError, response) => {
                if (!queryError) {
                    // console.log(response)
                    // let test = [{"id":1,"author":"Eliseo Camilon","post":"Code Enforcement to go live with Gretchna-1st ticket approved","timestamp":"2020-12-11T18:34:34.955Z","replyTimestamp":"2020-12-11T18:34:34.955Z","replyAuthor":"Eliseo Camilon","reply":"Did Dave approve as well? I have reached out to check"},{"id":1,"author":"Eliseo Camilon","post":"Code Enforcement to go live with Gretchna-1st ticket approved","timestamp":"2020-12-11T18:34:34.955Z","replyTimestamp":"2020-12-11T18:34:34.955Z","replyAuthor":"Westin Short","reply":"I think Dave did approve, let me double check"},{"id":2,"author":"Rakesh Grewal","post":"Code Enforcement is about to go live, waiting on approval","timestamp":"2020-12-11T18:34:34.955Z","replyTimestamp":"2020-12-11T18:34:34.955Z","replyAuthor":"Westin Short","reply":"Please wait for approval from Dave as well"}];

                    // console.log(data);
                    res.status(200).send(response);
                } else {
                    res.status(400).send(queryError);
                }
                conn.release();
                console.log('connection released for query:', query);
            });
        }
    });

}

exports.postReply = (req, res, next) => {

    const id = req.body.id;
    const reply = req.body.reply;
    const timestamp = req.body.timestamp;
    const author = req.body.author;

    // res.send({
    //     id: id,
    //     reply: reply,
    //     timestamp: timestamp,
    //     author: author
    // });

    const query = `INSERT INTO yonkers.post_replies(postId,timestamp,author,reply) 
    values (${id},'${timestamp}', '${author}', '${reply}');`;

    // res.send({query: query});

    pool.getConnection((connectionError, conn) => {
        if (connectionError) {
            if (connectionError instanceof Errors.NotFound) {
                return res.status(HttpStatus.NOT_FOUND).send({message: connectionError.message});  
            }
            console.log(connectionError);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); // 500
        } else {
            pool.query(query, (queryError, response) => {
                if (!queryError) {
                    res.status(200).send(response);
                } else {
                    res.status(400).send(queryError);
                }
                conn.release();
                console.log('connection released for query:', query);
            });
        }
    });

}