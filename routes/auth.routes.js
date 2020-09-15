const express = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/User.model.js');
const { Mongoose } = require('mongoose');

const router = express.Router();

// Signup Routes
router.get('/signup', (req, res, next) => {
	res.render('auth/signup', {});
});

const salt = bcryptjs.genSaltSync(10);

router.post('/signup', (req, res, next) => {
	console.log('valeurs', req.body);
	// enregistrer notre user en base
	// Validation server manuelle

  // vérifier que req.body.username non-vide
  // if (!username || !email || !password) {
  //   res.render('auth/signup', {
  //     errorMessage: 'Merci de remplir tous les champs'
  //   })
  //   return; // STOP
	// }
	
	const plainPassword = req.body.password;

	const hashed = bcryptjs.hashSync(plainPassword, salt);
	console.log('hashed=', hashed);

	User.create({
		username: req.body.username,
		email: req.body.email,
		passwordHash: hashed
	}).then(userFrromDB => {
		res.send('user créé!');
	}).catch(err => {
		console.log('💥', err);

		// new mongoose.Error.validationError()

		if(err instanceof mongoose.Error.ValidationError || err.code === 11000){
			console.log('Error de validation mongoose !');

			res.render('auth/signup', {
				errorMessage: err.message
			})
		} else {
			next(err)
		}
	});
});

// Login Routes
router.get('/login', (req, res, next) => {
	res.render('auth/login');
})

router.post('/login', (req, res, next) => {
	const {email, password} = req.body;
	console.log('SESSION ====>', req.session);

	// Validation que email et password sont pas vides
	if(!email || !password){
		res.render('auth/login', {
			errorMessage: 'Please enter both email and password to login.'
		});
		return; // STOP
	}

	User.findOne({email: email})
		.then(user => {
			if(!user){
				res.render('auth/login', {errorMessage: 'Incorrect email/password'})
				return; // STOP
			}
			// Comparer le password fourni avec le password (hashé) en base
			if(bcryptjs.compareSync(password, user.passwordHash)){
				console.log('user ok', user);
				
				req.session.user = user

				res.send('loggué!')
			}else{
				res.render('auth/login', {errorMessage: 'Incorrect email/password'})
			}
		})
		.catch(err => {
			next(err);
		})
})

router.get('/profile', (req, res, next) => {
	if(!req.session.user){
		res.redirect('/login');
	}

	res.render('users/userProfile', {
		user: req.session.user
	})
})

router.post('/logout', (req, res, next) => {
	console.log('logout works');
	req.session.destroy()
  res.send('ok delogged')
});

module.exports = router;