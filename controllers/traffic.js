
/**Node Packages and Global Object - Declaration / Instantiation */
// let express = require('express');
// let router = express.Router();
let mySql = require('mysql');
let _ = require('lodash');
var config = {
    user: "sa",
    password: "ft3t7pgz",
    host: "demo.infosol.com",
    port: "3306",
    database: 'yonkers'
}

const pool = new mySql.createConnection(config)
pool.connect(err => {
    if (err) console.log(err);
    else console.log('connected to MySQL database:', config.database + 'on host: ' + config.host);
});

exports.getAllTrafficCamsByIDs = (req, res, next) => {
    const site_id_list = convertFilterList(req.body.site_id_list);
    const query2 = `SELECT location_code, site_id, lat, lng, street_one, street_two, direction_short, direction_long, status, construction,
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'issued') as 'issued',
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'paid') as 'paid',
    (select  (sum(total) * 50) as 'EYTD' from yonkers.tickets where siteid = site_id and type = 'paid') as 'total_earnings',
    (select  ((sum(total) * 50) * (0.41) - 885 ) from yonkers.tickets where siteid = site_id and type = 'paid') as 'ats_fees',
    (select  ((select sum(total) from yonkers.tickets where type = 'paid' and siteid = site_id)/(select sum(total) from yonkers.tickets where type = 'issued' and siteid = site_id))) as 'collection_rate'
     from yonkers.cameras WHERE site_id IN ` + ` (${site_id_list});`; 

    pool.query(query2, (err, response, fields) => {
        res.send(response);
    });
}

exports.getAllTrafficCams = (req, res, next) => {
    const street_list = convertFilterList(req.body.street_list);
    const query = `select * from yonkers.cameras where street_one IN ` + ` (${street_list}) ` + ` OR street_two IN ` + ` (${street_list});`; 
    const query2 = `SELECT location_code, site_id, lat, lng, street_one, street_two, direction_short, direction_long, status, construction,
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'issued') as 'issued',
    (select sum(total) from yonkers.tickets where siteid = site_id and type = 'paid') as 'paid',
    (select  (sum(total) * 50) as 'EYTD' from yonkers.tickets where siteid = site_id and type = 'paid') as 'total_earnings',
    (select  ((sum(total) * 50) * (0.41) - 885 ) from yonkers.tickets where siteid = site_id and type = 'paid') as 'ats_fees',
    (select  ((select sum(total) from yonkers.tickets where type = 'paid' and siteid = site_id)/(select sum(total) from yonkers.tickets where type = 'issued' and siteid = site_id))) as 'collection_rate'
     from yonkers.cameras WHERE  street_one IN ` + ` (${street_list}) ` + ` OR street_two IN ` + ` (${street_list});`; 

    pool.query(query2, (err, response, fields) => {
        res.send(response);
    });
};

exports.getAllSiteIds = (req, res, next) => {
    const query = `select distinct site_id from yonkers.cameras;`; 
    pool.query(query, (err, response, fields) => {
        res.send(response);
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

    pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

exports.getDistinctStreets = (req,res,next) => {
    const street_column = req.body.street
    const query = `select distinct ` + street_column + ` from yonkers.cameras;` ;

    pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

exports.getViewDetailsRevenue = (req,res,next) => {
    const id_list = convertFilterList(req.body.site_id_list);
    const query = `select monthOfEntry as "month", sum(total) * 50 as total_earnings from yonkers.tickets where type = 'paid'  
    AND siteid IN ` +  ` (${id_list}) ` + `group by monthOfEntry; `;

     pool.query(query, (err, response, fields) => {
        res.send(response);
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

     pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

exports.getAllStats = (req,res,next) => {
    const query = `SELECT * from yonkers.stats;`

     pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

exports.getAllyearsFilters = (req,res,next) => {
    const query = `select distinct stats_year from yonkers.stats;`;
     pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

exports.getAllStatsFiltered = (req,res,next) => {
    const yearsFilter = convertFilterList(req.body.years_filter);
    const monthsFilter = convertFilterList(req.body.months_filter);
    const query = `select * from yonkers.stats where stats_year in ` + ` (${yearsFilter}) ` + ` and stats_month in ` + `(${monthsFilter});`;
     pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

function convertFilterList(arrayList) {
    return "'" + arrayList.join("\', \'") + "' ";
}

