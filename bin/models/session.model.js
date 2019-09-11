exports.requireLogin = (req, res, next) => {
  if(!req.session.user) {
    res.redirect('/user/login');
  } else {
    next();
  }
};

exports.redirect = (url) => {
  return (req, res, next) => {
    if(req.session && req.session.username) {
        res.redirect(url);
    } else {
        next();
    }   
  }
};

exports.destroy = (req, res, next) => {
  if(req.session) {
    req.session.destroy((error) => {
      if(error) {
        return next(error);
      } else {
        res.redirect('/');
      }
    });
  }
};
