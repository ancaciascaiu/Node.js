const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
	res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
	res.render('register', { title: 'Register' })
};

//middleware for validating the registration data before post to register for additional checks besides the model validations
exports.validateRegister = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'You must spply a name!').notEmpty();
	req.checkBody('email', 'That Email is not valid!').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Password Cannot be black!').notEmpty();
	req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
	req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg));
		res.render('register', { title: 'Register', body: req.body, 
			flashes: req.flash() });
		return;
	}
	next(); //there were no errors
};

//middleware to register the user
exports.register = async (req, res, next) => {
	const user = new User({ email: req.body.email, name: req.body.name });
	const register = promisify(User.register, User); //promisify library
	await register(user, req.body.password);
	next(); //pass to authController.login
};