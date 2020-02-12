
/**Node Packages and Global Object - Declaration / Instantiation */
// let express = require('express');
// let router = express.Router();
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

exports.getAllTrafficCamsByIDs = (req, res, next) => {
    const site_id_list = convertFilterList(req.body.site_id_list);
    const query = `SELECT location_code, site_id, lat, lng, street_one, street_two, direction_short, direction_long, status, construction,
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'issued') as 'issued',
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'paid') as 'paid',
    (select  (sum(total) * 50) as 'EYTD' from yonkers.tickets where siteid = site_id and type = 'paid') as 'total_earnings',
    (select  ((sum(total) * 50) * (0.41) - 885 ) from yonkers.tickets where siteid = site_id and type = 'paid') as 'ats_fees',
    (select  ((select sum(total) from yonkers.tickets where type = 'paid' and siteid = site_id)/(select sum(total) from yonkers.tickets where type = 'issued' and siteid = site_id))) as 'collection_rate'
     from yonkers.cameras WHERE site_id IN ` + ` (${site_id_list});`; 

    // pool.query(query2, (err, response, fields) => {
    //     res.send(response);
    // });
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

exports.getAllTrafficCams = (req, res, next) => {
    const street_list = convertFilterList(req.body.street_list);
    // const query = `select * from yonkers.cameras where street_one IN ` + ` (${street_list}) ` + ` OR street_two IN ` + ` (${street_list});`; 
    const query = `SELECT location_code, site_id, lat, lng, street_one, street_two, direction_short, direction_long, status, construction,
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'issued') as 'issued',
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'paid') as 'paid',
    (select  (sum(total) * 50) as 'EYTD' from yonkers.tickets where siteid = site_id and type = 'paid') as 'total_earnings',
    (select  ((sum(total) * 50) * (0.41) - 885 ) from yonkers.tickets where siteid = site_id and type = 'paid') as 'ats_fees',
    (select  ((select sum(total) from yonkers.tickets where type = 'paid' and siteid = site_id)/(select sum(total) from yonkers.tickets where type = 'issued' and siteid = site_id))) as 'collection_rate'
     from yonkers.cameras WHERE  street_one IN ` + ` (${street_list}) ` + ` OR street_two IN ` + ` (${street_list});`; 

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

};

exports.getAllSiteIds = (req, res, next) => {
    const query = `select distinct site_id from yonkers.cameras;`; 
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

};

/**
 * Returns the siteid,total,type,monthOfEntry,dayOfEntry,and yearOfEntry
 * for a speciic siteid e.g. 'YK01', 'YK02', etc. 
 */
exports.getPaymentsForCam = (req,res,next) => {

    const site_id = req.body.site_id
    const query = `SELECT siteid, total, type, monthOfEntry, dayOfEntry, yearOfEntry 
    FROM yonkers.tickets where siteid = '` + site_id +"'";

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

exports.getDistinctStreets = (req,res,next) => {
    const street_column = req.body.street
    const query = `select distinct ` + street_column + ` from yonkers.cameras;` ;
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

exports.getViewDetailsRevenue = (req,res,next) => {
    const id_list = convertFilterList(req.body.site_id_list);
    const query = `select monthOfEntry as "month", sum(total) * 50 as total_earnings from yonkers.tickets where type = 'paid'  
    AND siteid IN ` +  ` (${id_list}) ` + `group by monthOfEntry; `;

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

exports.getComparissonTable = (req,res,next) => {
    const id_list = convertFilterList(req.body.site_id_list);
    // console.log(id_list);
    const query = `SELECT site_id, direction_short, street_one, street_two, lat, lng, status, 
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'issued') as 'issued',
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'paid') as 'paid',
    (select  (sum(total) * 50) as 'EYTD' from yonkers.tickets where siteid = site_id and type = 'paid') as 'total_earnings',
    (select  ((sum(total) * 50) * (0.41) - 885 ) from yonkers.tickets where siteid = site_id and type = 'paid') as 'ats_fees',
    (select  ((select sum(total) from yonkers.tickets where type = 'paid' and siteid = site_id)/(select sum(total) from yonkers.tickets where type = 'issued' and siteid = site_id))) as 'collection_rate'
    from yonkers.cameras WHERE site_id IN ` + ` (${id_list});`;

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

exports.getAllStats = (req,res,next) => {
    const query = `SELECT * from yonkers.stats;`
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

exports.getAllyearsFilters = (req,res,next) => {
    const query = `select distinct stats_year from yonkers.stats;`;
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

exports.getAllStatsFiltered = (req,res,next) => {
    const yearsFilter = convertFilterList(req.body.years_filter);
    const monthsFilter = convertFilterList(req.body.months_filter);
    const query = `select * from yonkers.stats where stats_year in ` + ` (${yearsFilter}) ` + ` and stats_month in ` + `(${monthsFilter});`;
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

function convertFilterList(arrayList) {
    return "'" + arrayList.join("\', \'") + "' ";
}

