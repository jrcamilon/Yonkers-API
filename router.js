// let authentication = require('./controllers/authentication');
// const passportService = require('./services/passport');
// const passport = require('passport');

// const requireAuth = passport.authenticate('jwt', { session: false });
// const requireSignIn = passport.authenticate('local', { session: false });
// const images = require('./controllers/images');
const traffic = require('./controllers/traffic');
const health = require('./controllers/health');
const dashboard = require('./controllers/dashboard');
// const infoburst = require('./controllers/infoburst');

module.exports = function (app) {
       app.get('/', health.health);
       app.get('/heartbeat', health.heartbeat);
       app.post('/traffic',traffic.getAllTrafficCams);
       app.post('/payments', traffic.getPaymentsForCam);
       app.get('/siteids', traffic.getAllSiteIds);
       app.post('/streets', traffic.getDistinctStreets);
       app.post('/compare', traffic.getComparissonTable);
       app.get('/statistics', traffic.getAllStats);
       app.post('/allcamsbyid', traffic.getAllTrafficCamsByIDs);
       app.post('/viewdetails/revenue', traffic.getViewDetailsRevenue);
       app.get('/statistics/yearfilters', traffic.getAllyearsFilters);
       app.post('/statistics/statsfiltered', traffic.getAllStatsFiltered);

       // app.get('/infoburst/test', infoburst.getInfoburstStats);

       app.post('/dashboard/totals', dashboard.getDashboardTotals);
       app.post('/dashboard/charts/bymonth', dashboard.getBreakDownByMonth);
       app.post('/dashboard/charts/bymonthbreakdown', dashboard.getBreakDownByMonthWithDetails);
       app.post('/dashboard/table', dashboard.getTableData);
}
