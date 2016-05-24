var express = require('express')
  , everyauth = require('everyauth')
  , conf = require('./conf')
  , everyauthRoot = __dirname + '/';

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  console.log(user)
  return user;
}

var usersByLogin = {
  'brian@example.com': addUser({ login: 'brian@example.com', password: 'password'})
};

everyauth
  .everymodule
    .findUserById( function (id, callback) {
      callback(null, usersById[id]);
    });
    
// seems this line is useless
everyauth.helpExpress(app);

everyauth.ldapfork
  .ldapUrl(conf.ldapUrl)
  .adminDn(conf.adminDn)
  .adminPassword(conf.adminpassword)
  .searchBase(conf.searchBase)
  .searchFilter(conf.searchFilter)
  .requireGroupDn(conf.RequireGroupDn)

  // The `ldap` module inherits from the `password` module, so 
  // refer to the `password` module instructions several sections above
  // in this README.
  // You do --not-- need to configure the `authenticate` step as instructed
  // by `password` because the `ldap` module --already-- does [not] that for you.
  // in this _fork_ of this module, I have chossen to allow the authenticate step
  // to be __optional__. So, you cah use the the default, or clone it if you need
  // special handling of the authentication. See below... [USERID] 
  // Moreover, all the registration related steps and configurable parameters
  // are no longer valid
  .loginWith('email')
  .loginFormFieldName('login')       // Defaults to 'login' 
  .passwordFormFieldName('password') // Defaults to 'password' 
  .getLoginPath('/login')
  .postLoginPath('/login')
  .loginView('login.jade')
  .loginLocals( function (req, res, done) {
    setTimeout( function () {
      done(null, {
        title: 'Async login',
        everyauth: everyauth
      });
    }, 200);
  })
  .loginSuccessRedirect('/')
  .authenticate( function (login, password, req, res) {
    var promise = this.Promise();
    var ldapauth = this.ldapAuth;
   
    ldapauth.authenticate(login, password, function (err, result) {
      var user, errors;
      if (err) {
        // return promise.fail(err);
        // debug
        if (typeof err == 'string') {
          return promise.fulfill(['LDAP Error: ' + err]);
        } else {
          return promise.fulfill(['LDAP Error: ' + err.message]);        
        }
      }
      if (result === false) {
        errors = ['Login failed.'];
        return promise.fulfill(errors);
      } else if (typeof result == 'object') {
        // RESULT.UID
        // in my case I was not able to use the comparison `result.uid == login`
        // since in my organization, there is no `uid` assigned to the users
        // instead I used the `mail` and I used the `.toLowerCase()` to make
        // sure my app is abit more flexible, sice emails are saved with Camel
        // case, but it is not for sure that the user will use a cammel case
        // email address, ussualy they use lowercase.
        if (result.uid == login || result.mail.toLowerCase() == login.toLowerCase()) {
          user = {};
          user['id'] = login;
          console.log("LDAP: positive authorization for user " + login + "")
          userAttributes = {
            name: result.name,
            eID: result.employeeID,
            permissions: result.memberOf,
            dpt: result.description
          }
          // lets add the user
          // I am not sure if this is supposed to happen here or not
          // but for my testing it worked ok so far, so I left it there
          user[login] = addUser(login, userAttributes);
          
          return promise.fulfill(user);
        } else {
          return promise.fulfill(['LDAP Error: result does not match username', result])
        }
      } else {
        console.log('ldapauth returned an unknown result:');
        console.log(result);
        return promise.fulfill(['Unknown ldapauth response']);        
      }
    });
    return promise;
  });
  // I have not figured out how to do this part yet.
  // .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
  //   console.log('[findOrCreateuser>>>>>>>>>>>>>]\n',session); // find or create user logic goes here
  // });
  
var routes = function (app) {
  // Define your routes here
};

var app = express();
app
  .use(express.static(__dirname + '/public'))
  .use(express.favicon())
  .use(express.bodyParser())
  .use(express.cookieParser('htuayreve'))
  .use(express.session())
  .use(everyauth.middleware());

app.configure( function () {
  app.set('view engine', 'jade');
  app.set('views', everyauthRoot + '/views');
});

app.get('/', function (req, res) {
  res.render('home');
});

app.timeout = 0;
app.listen(3000);

console.log('Go to http://local.host:3000');

module.exports = app;
