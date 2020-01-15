
/**Node Packages and Global Object - Declaration / Instantiation */
// let express = require('express');
// let router = express.Router();
let mySql = require('mysql');
let _ = require('lodash');
let env = require('../config.js');
var config = {
    user: env.user,
    password:env.password,
    host: env.host,
    port: env.port,
    database: env.database
}

const availableMonthsArray = ['JAN','FEB', 'MAR', 'APR', 'MAY', 'JUN','JUL','AUG','SEP','OCT','NOV','DEC'];


const pool = new mySql.createConnection(config)
pool.connect(err => {
    if (err) console.log(err);
    else console.log('connected to MySQL database:', config.database + 'on host: ' + config.host);
});

exports.getDashboardTotals = (req,res,next) => {
    const yearsFilter = convertFilterList(req.body.years_filter);
    const monthsFilter = convertFilterList(req.body.months_filter);

    const query = `select 
    sum(net_revenue) as revenue_net,
    sum(total_revenue) as revenue_total,
    sum(county_disabled_tix_fee) as fee_county_disabled_tix,
    sum(ypa_fee) as fee_ypa,
    sum(marshal) as fee_marshal,
    sum(ats_rlc_fee) as fee_ats_rlc,
    sum(total_pkg_revenue) as revenue_total_pkg,
    sum(total_redlight_camera_rev) as revenue_redlight,
    sum(total_code_enf_rev) as revenue_total_code_enf,
    sum(total_code_enf_rev_courts) as revenue_total_code_enf_courts,
    sum(total_pkg_issued) as tickets_total,
    sum(issued_peo) as tickets_peo,
    sum(issued_ypd) as tickets_ypd,
    sum(issued_ypa) as tickets_ypa,
    sum(issued_other) as tickets_other,
    sum(totaltix_rlc) as tix_rlc,
    sum(totaltix_code) as tix_code,
    sum(late_notices_sent) as notices_total,
    sum(boot_tow) as notices_boot,
    sum(susp_reg) as notices_suspended,
    sum(meter_violations) as notices_meter
    from yonkers.stats where stats_year IN ` + ` (${yearsFilter}) ` + ` and stats_month IN ` + `(${monthsFilter});`;

     pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

exports.getTableData = (req,res,next) => {
    const yearsFilter = convertFilterList(req.body.years_filter);
    const monthsFilter = convertFilterList(req.body.months_filter);

    const query = `select 
    stats_year as year,
    sum(net_revenue) as revenue_net,
    sum(total_revenue) as revenue_total,
    sum(county_disabled_tix_fee) as fee_county_disabled_tix,
    sum(ypa_fee) as fee_ypa,
    sum(marshal) as fee_marshal,
    sum(ats_rlc_fee) as fee_ats_rlc,
    sum(total_pkg_revenue) as revenue_total_pkg,
    sum(total_redlight_camera_rev) as revenue_redlight,
    sum(total_code_enf_rev) as revenue_total_code_enf,
    sum(total_code_enf_rev_courts) as revenue_total_code_enf_courts,
    sum(total_pkg_issued) as tickets_total,
    sum(issued_peo) as tickets_peo,
    sum(issued_ypd) as tickets_ypd,
    sum(issued_ypa) as tickets_ypa,
    sum(issued_other) as tickets_other,
    sum(totaltix_rlc) as tix_rlc,
    sum(totaltix_code) as tix_code,
    sum(late_notices_sent) as notices_total,
    sum(boot_tow) as notices_boot,
    sum(susp_reg) as notices_suspended,
    sum(meter_violations) as notices_meter
    from yonkers.stats where stats_year IN ` + ` (${yearsFilter}) ` + ` and stats_month IN ` + `(${monthsFilter})` + ` GROUP by stats_year;`;

     pool.query(query, (err, response, fields) => {
        res.send(response);
    });
}

// Returns for Kendo Chart Series and Categories
exports.getBreakDownByMonth = (req,res,next) => {
    const length =  req.body.months_filter.length;
    const allMonths = availableMonthsArray
    const month = req.body.months_filter;
    month.sort(function(a,b){
        return allMonths.indexOf(a) > allMonths.indexOf(b);
    });
    let newArr = ['','','','','','','','','','','',''];
    for (let i = 0; i < allMonths.length; i++) {
        let toFind = allMonths[i].toLowerCase();
        
        for (let k = 0; k < month.length; k++) {
            if (toFind === month[k].toLowerCase()) {
                newArr[i] = month[k]
            }
        }
    }
    let monthNew = newArr.filter(Boolean);

    const yearsFilter = convertFilterList(req.body.years_filter);
    const monthsFilter = convertFilterList(req.body.months_filter);
    const type = req.body.type;

    const query = `SELECT stats_year, stats_month, ` + `${type} ` +  `from yonkers.stats 
    WHERE stats_year IN ` + ` (${yearsFilter}) ` + ` and stats_month IN ` + `(${monthsFilter});`;

    pool.query(query, (err, response, fields) => {
        let dataResponse = Object.values(JSON.parse(JSON.stringify(response)));
        res.send({
            series: getKendoChartSeries(dataResponse, length, monthNew),
            categories: monthNew
          });
    });

}

exports.getBreakDownByMonthWithDetails = (req,res,next) => {

    const length =  req.body.months_filter.length;
    const allMonths = availableMonthsArray
    const month = req.body.months_filter;
    month.sort(function(a,b){
        return allMonths.indexOf(a) > allMonths.indexOf(b);
    });
    let newArr = ['','','','','','','','','','','',''];
    for (let i = 0; i < allMonths.length; i++) {
        let toFind = allMonths[i].toLowerCase();
        
        for (let k = 0; k < month.length; k++) {
            if (toFind === month[k].toLowerCase()) {
                newArr[i] = month[k]
            }
        }
    }
    let monthNew = newArr.filter(Boolean);


    const yearsFilter = convertFilterList(req.body.years_filter);
    const monthsFilter = convertFilterList(req.body.months_filter);
    const subtype1 = req.body.type1;
    const subtype2 = req.body.type2;
    const subtype3 = req.body.type3;
    const subtype4 = req.body.type4;

    const query = `SELECT stats_year, stats_month, ` + ` ${subtype1} ,` +  ` ${subtype2} ,` + ` ${subtype3} ,` +  ` ${subtype4} ` + `from yonkers.stats 
    WHERE stats_year IN ` + ` (${yearsFilter}) ` + ` and stats_month IN ` + `(${monthsFilter});`;

    pool.query(query, (err, response, fields) => {
        let dataResponse = Object.values(JSON.parse(JSON.stringify(response)));
        res.send(getBreakDownByMonthWithDetails(length, monthNew, dataResponse, subtype1, subtype2, subtype3, subtype4));
    });
}

function getBreakDownByMonthWithDetails(length, month, data, subtype1, subtype2, subtype3, subtype4) {
    // console.log("HERE", length, month);
    let groupedByMonth = _.groupBy(data, function(item) {return item.stats_month});
    let keys = Object.keys(groupedByMonth);
    let values = Object.values(groupedByMonth);
    let newArr = [];

    for (let i = 0; i < keys.length; i++) {
      newArr.push({month: keys[i], values: values[i]});
    }

    let arrayValue1 = [];
    for (let i = 0; i < length; i++) { arrayValue1.push(0); }
    for (let i = 0; i < month.length; i++) {
      let toFind = month[i].toLowerCase();
      for (let k = 0; k < newArr.length; k++) {
        if (newArr[k].month.toLowerCase() === toFind) {
            arrayValue1[i] = newArr[k].values.map(ele => {
                const key = Object.keys(ele)[2];
                return getValueOf(ele, key);
          }).reduce(function(a, b) { return a + b; }, 0);
        }
      }
    }



    let arrayValue2 = [];
    for (let i = 0; i < length; i++) { arrayValue2.push(0); }
    for (let i = 0; i < month.length; i++) {
      let toFind = month[i].toLowerCase();
      for (let k = 0; k < newArr.length; k++) {
        if (newArr[k].month.toLowerCase() === toFind) {
            arrayValue2[i] = newArr[k].values.map(ele => {
                const key = Object.keys(ele)[3];
                return getValueOf(ele, key);
          }).reduce(function(a, b) { return a + b; }, 0);
        }
      }
    }

    let arrayValue3 = [];
    for (let i = 0; i < length; i++) { arrayValue3.push(0); }
    for (let i = 0; i < month.length; i++) {
      let toFind = month[i].toLowerCase();
      for (let k = 0; k < newArr.length; k++) {
        if (newArr[k].month.toLowerCase() === toFind) {
            arrayValue3[i] = newArr[k].values.map(ele => {
                const key = Object.keys(ele)[4];
                return getValueOf(ele, key);
          }).reduce(function(a, b) { return a + b; }, 0);
        }
      }
    }

    let arrayValue4 = [];
    for (let i = 0; i < length; i++) { arrayValue4.push(0); }
    for (let i = 0; i < month.length; i++) {
      let toFind = month[i].toLowerCase();
      for (let k = 0; k < newArr.length; k++) {
        if (newArr[k].month.toLowerCase() === toFind) {
            arrayValue4[i] = newArr[k].values.map(ele => {
                const key = Object.keys(ele)[5];
                return getValueOf(ele, key);
          }).reduce(function(a, b) { return a + b; }, 0);
        }
      }
    }

    const arrayValue1Totals = arrayValue1.reduce((a, b) => a + b, 0);
    const arrayValue2Totals = arrayValue2.reduce((a, b) => a + b, 0);
    const arrayValue3Totals = arrayValue3.reduce((a, b) => a + b, 0);
    const arrayValue4Totals = arrayValue4.reduce((a, b) => a + b, 0);
    const totals = arrayValue1Totals + arrayValue2Totals + arrayValue3Totals + arrayValue4Totals;

     const totalPackage = {
      subtype1 : arrayValue1Totals,
      subtype2: arrayValue2Totals,
      subtype3: arrayValue3Totals,
      subtype4: arrayValue4Totals,
      subtypeTotal: totals
    }

    const completePackage = {
        totalPackage: totalPackage,
        kendoData: [
            {name: subtype1.toString(), data: arrayValue1 },
            {name: subtype2.toString(), data: arrayValue2 },
            {name: subtype3.toString(), data: arrayValue3 },
            {name: subtype4.toString(), data: arrayValue4 },
        ],
        categories: month
    }

    // console.log(completePackage);

    return completePackage;
}

function getKendoChartSeries(data, length, calendar) {
    let groupedByYear = _.groupBy(data, function(item) {return item.stats_year});
    let keys = Object.keys(groupedByYear);
    let values = Object.values(groupedByYear);
    let newArr = [];
    for (let i = 0; i < keys.length; i++) {
      newArr.push({year: keys[i], values: values[i]});
    }
    let kendoNetRevenue = newArr.map(ele => {
      return {
        name: ele.year,
        data: cleanData(ele.values, length, calendar)
      }
    });
    return kendoNetRevenue;
}

function cleanData(values, length, calendar) {
    let categoriesArr = [];
    for (let i = 0; i < length; i++) {
        categoriesArr.push(0);
    }

    for (let i = 0; i < calendar.length; i++) {
      let toFind = calendar[i].toLowerCase();
      for (let k = 0; k < values.length; k++) {
        if (values[k].stats_month.toLowerCase() === toFind) {
            // console.log(values[k]);
            const key = Object.keys(values[k])[2];
            categoriesArr[i] = getValueOf(values[k], key);
        }
      }
    }
    // console.log(categoriesArr);
    return categoriesArr;
}

function getValueOf(value, type) {
    switch(type) {
        case 'net_revenue':
            return value.net_revenue;
        case 'total_revenue':
            return value.total_revenue;
        case 'county_disabled_tix_fee':
            return value.county_disabled_tix_fee;
        case 'ypa_fee':
            return value.ypa_fee;
        case 'marshal':
            return value.marshal;
        case 'ats_rlc_fee':
            return value.ats_rlc_fee;
        case 'total_pkg_revenue':
            return value.total_pkg_revenue;
        case 'total_redlight_camera_rev':
            return value.total_redlight_camera_rev;
        case 'total_code_enf_rev':
            return value.total_code_enf_rev;
        case 'total_code_enf_rev_courts':
            return value.total_code_enf_rev_courts;
        case 'total_pkg_issued':
            return value.total_pkg_issued;
        case 'issued_peo':
            return value.issued_peo;
        case 'issued_ypd':
            return value.issued_ypd;
        case 'issued_ypa':
            return value.issued_ypa;
        case 'issued_other':
            return value.issued_other;
        case 'totaltix_rlc':
            return value.totaltix_rlc;
        case 'totaltix_code':
            return value.totaltix_code;
        case 'late_notices_sent':
            return value.late_notices_sent;
        case 'boot_tow':
            return value.boot_tow;
        case 'susp_reg':
            return value.susp_reg;
        case 'meter_violation':
            return value.meter_violation;
        default:
            return 0;
        
    }
}

function convertFilterList(arrayList) {
    return "'" + arrayList.join("\', \'") + "' ";
}

