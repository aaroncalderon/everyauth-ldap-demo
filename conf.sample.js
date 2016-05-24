module.exports = {
    ldap: {
        ldapUrl: 'ldap(s)://ldap.url.com:andport'
      , adminDn: 'adminuser'
      , adminpassword: 'adm!nP@&&w0rd'
      , searchBase: 'DC=SAMPLE,DC=com'
      , searchFilter: '(&(objectClass=person)(mail={{username}}))'
      , RequireGroupDn: 'dc=sample,dc=com'
    }
};
