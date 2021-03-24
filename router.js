// let authentication = require('./controllers/authentication');
// const passportService = require('./services/passport');
// const passport = require('passport');

// const requireAuth = passport.authenticate('jwt', { session: false });
// const requireSignIn = passport.authenticate('local', { session: false });
// const images = require('./controllers/images');
const traffic = require('./controllers/traffic');
const health = require('./controllers/health');
const dashboard = require('./controllers/dashboard');
const comments = require('./controllers/comments');
// const infoburst = require('./controllers/infoburst');
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
       issuer: 'https://dev-456721.oktapreview.com/oauth2/default',
       clientId: '0oairuqk2i2gqj7mZ0h7',
       assertClaims: {
         aud: 'api://default',
       },
     });
     
/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
function authenticationRequired(req, res, next) {
const authHeader = req.headers.authorization || '';
const match = authHeader.match(/Bearer (.+)/);

if (!match) {
       return res.status(401).end();
}

const accessToken = match[1];
const expectedAudience = 'api://default';

return oktaJwtVerifier.verifyAccessToken(accessToken, expectedAudience)
       .then((jwt) => {
       req.jwt = jwt;
       next();
       })
       .catch((err) => {
       res.status(401).send(err.message);
       });
}

module.exports = function (app) {
       app.get('/', health.health);
       app.get('/secured', health.secured);
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

       app.get('/comments/all', comments.getAllComments)
       app.post('/comments/reply', comments.postReply)
       // app.get('/infoburst/test', infoburst.getInfoburstStats);

       app.post('/dashboard/totals', dashboard.getDashboardTotals);
       app.post('/dashboard/charts/bymonth', dashboard.getBreakDownByMonth);
       app.post('/dashboard/charts/bymonthbreakdown', dashboard.getBreakDownByMonthWithDetails);
       app.post('/dashboard/table', dashboard.getTableData);
}
