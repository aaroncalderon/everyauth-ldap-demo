# Install

Like always, you can do the following:

`git clone --depth=0 https://github.com/aaroncalderon/everyauth-ldap-demo.git`

Then do:

`npm install`

# Run 

To run the example do:

```
cd everyauth-ldap-demo
node index
```

Then go to `http://localhost:3000` to see the demo. Do not forget to configure it, see below.

# INFO

Please note that I am not using the original `everyauth` module, I am using my fork for the purpose to illustrate the
feature of `ldapfork` to overwrite the `.authenticate()` method.

See `package.json`. 

# Configuration (conf.js)

How to configure the the demo

## Option 1:

Please create your own `conf.js` file and add the values as needed for your situation. You can use the `conf.sample.js` 
as a template.

## Option 2:

OR just go to the `index.js` file to line 38 and replace the references to the `conf` variable

```javascript
everyauth.ldapfork // line 38
  .ldapUrl(conf.ldapUrl) // replace these `conf.ldapUrl`
  .adminDn(conf.adminDn)
  .adminPassword(conf.adminpassword)
  .searchBase(conf.searchBase)
  .searchFilter(conf.searchFilter)
  .requireGroupDn(conf.RequireGroupDn)
```

and do not forget to comment out line 3.

```javascript
var express = require('express')
  , everyauth = require('everyauth')
  , conf = require('./conf') // this one
  , everyauthRoot = __dirname + '/';
```
