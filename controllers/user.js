const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../models/User')
require('dotenv').config()

const TOKEN = process.env.TOKEN;

/**  Fonction pour l'enregistrement ou la connexion **/

// Enregistrement 

exports.signup = (req, res, next) => {
  // Mot de passe ne respectant pas les indications
  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.{6,})/.test(req.body.password)) {  
    return res.status(401).json({ error: 'Le mot de passe doit contenir une lettre majuscule, une minuscule et au moins 1 chiffre (6 caractères min)' });
  } else {
    // Mot de passe OK
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        })
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => {
            console.log(error.message)
            return res.status(400).json({ error })
          });
      })
      .catch(error => res.status(500).json({ error }));
  }
};

// Identification 

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // Trouver l'utilisateur. 
    .then(user => {
      if (!user) { // Si il n'est pas trouvé
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password) // Si l'utilisateur est trouvé, on compare les mots de passes
        .then(valid => { 
          if (!valid) { //Faux
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({ //Vrai
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              TOKEN,
              { expiresIn: '8h' }
            )
          });
        })
        .catch(error => {
          console.log(error.message)
          return res.status(500).json({ error })});
    })
    .catch(error => res.status(500).json({ error }));
};


