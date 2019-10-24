class Session {

  static requireLogin(req, res, next){
    if(!req.session.user) res.redirect('/user/login');
    else next();
  };

  static redirect(url) {
    return (req, res, next) => {
      if(req.session && req.session.user) res.redirect(url);
      else next();  
    }
  };

  static destroy(req, res, next) {
    if(req.session) {
      req.session.destroy((error) => {
        if(error) return next(error);
        res.redirect('/');
      });
    }
  };
}

module.exports = Session;
