import CookieHelper from './cookie-helper';
import Request from 'superagent';
import config from './config.js';

module.exports = {
  login(username, password, cb) {
    cb = arguments[arguments.length - 1]
    tryLogin(username, password, (res) => {
      if (res.authenticated) {
        CookieHelper.setItem('buldreinfo_is_admin', res.admin);
        CookieHelper.setItem('buldreinfo_is_super_admin', res.superadmin);
        if (cb) cb(true)
        this.onChange(true)
      } else {
        if (cb) cb(false)
        this.onChange(false)
      }
    })
  },

  getToken: function () {
    return CookieHelper.getItem('buldreinfo');
  },

  logout: function (cb) {
    Request.get(config.getUrl("logout")).withCredentials().end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Logged out");
      }
      CookieHelper.removeItem('buldreinfo');
      if (cb) cb();
      this.onChange(false);
    });
  },

  loggedIn: function () {
    return CookieHelper.hasItem('buldreinfo');
  },

  isAdmin: function () {
    if (CookieHelper.hasItem('buldreinfo_is_admin')) {
      return (CookieHelper.getItem('buldreinfo_is_admin')=='true');
    }
    return false;
  },

  isSuperAdmin: function () {
    if (CookieHelper.hasItem('buldreinfo_is_super_admin')) {
      return (CookieHelper.getItem('buldreinfo_is_super_admin')=='true');
    }
    return false;
  },

  onChange: function () {}
}

function tryLogin(username, password, cb) {
  setTimeout(() => {
    Request.post(config.getUrl("users/login"))
    .type('form')
    .withCredentials()
    .send({username: username})
    .send({password: password})
    .send({regionId: config.getRegion()})
    .set('Accept', 'application/json')
    .end((err, res) => {
      var isAuthenticated = false;
      var isAdmin = false;
      var isSuperadmin = false;
      if (err) {
        console.log(err);
      } else if (res && res.text) {
        const lvl = parseInt(res.text);
        if (lvl>=0) {
          isAuthenticated = true;
          isAdmin = lvl>=1;
          isSuperadmin = lvl===2;
        }
      }
      cb({ authenticated: isAuthenticated, admin: isAdmin, superadmin: isSuperadmin });
    });
  }, 0)
}
