var express = require('express');
var router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const PassCate = require('../model/Passcategory');
const PassModel = require('../model/add_password');
const getpasscate = PassCate.find({});

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
/* GET home page. */
router.get('/', function (req, res, next) {
  var loginUser = localStorage.getItem('loginuser');
  console.log(loginUser)
  if (loginUser) {
    res.redirect('/dashboard');
  } else {
    res.render('index', { title: 'Password Management System', msg: '' });
  }

});

router.post('/', function (req, res, next) {
  const username = req.body.uname;
  const password = req.body.password;
  const checkuser = User.findOne({ username: username });
  checkuser.exec((err, data) => {
    if (err) throw err
    const getuserid = data._id;
    const getpassword = data.password;
    if (bcrypt.compareSync(password, getpassword)) {
      const token = jwt.sign({ userID: getuserid }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginuser', username);
      res.redirect('/dashboard');
    } else {
      res.render('index', { title: 'Password Management System', msg: 'Wrong Credentials' });
    }
  })
});

// middle ware to check is userlogin

function islogin(req, res, next) {
  let userToken = localStorage.getItem('userToken');
  try {
    const decoad = jwt.verify(userToken, 'loginToken')

  } catch (err) {
    res.redirect('/');
  }
  next();
}

// middle ware to check unique eamil
function checkEmail(req, res, next) {
  const email = req.body.email;
  const isexist = User.findOne({ email: email })
  isexist.exec((err, data) => {
    if (err) throw err
    if (data) {
      return res.render('singup', { title: 'Password Management System', msg: 'Already Email Exist' })
    }
    next();
  })
}

router.get('/dashboard', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  res.render('dashboard', { title: 'Password Management System', loginUser: loginUser, msg: '' })
})

router.get('/signup', (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  if (loginUser) {
    res.redirect('./dashboard');
  } else {
    res.render('singup', { title: 'Password Management System', msg: '' })
  }

})

router.post('/signup', checkEmail, (req, res) => {

  const username = req.body.uname;
  const email = req.body.email;
  const password = req.body.password;
  const confirmpassword = req.body.confpassword;
  if (confirmpassword != password) {
    res.render('singup', { title: 'Password Management System', msg: 'Password Not Macthed' })
  } else {

    const pass = bcrypt.hashSync(password, 10)
    const userDetails = User({
      username: username,
      email: email,
      password: pass
    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render('singup', { title: 'Password Management System', msg: 'Regersterd Succesfully' })
    })

  }
})
// route to logout
router.get('/logout', (req, res) => {
  localStorage.removeItem('loginuser');
  localStorage.removeItem('userToken');
  res.redirect('/');
})
// route to add category
router.post('/add-category', islogin, [body('passwordCategory', 'Enter Category').isLength({ min: 1 })], (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addnewcategory', { title: 'Password Management System', loginUser: loginUser, error: errors.mapped(), success: '' })

  } else {
    const passcate = req.body.passwordCategory;
    const data = new PassCate({
      Password_category: passcate
    })
    data.save((err, doc) => {
      if (err) throw err
    })
    res.render('addnewcategory', { title: 'Password Management System', loginUser: loginUser, error: '', success: 'Inserted Successfully' })
  }

})
// route to view password category list 
router.get('/pass-category', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  getpasscate.exec((err, data) => {
    if (err) throw err
    res.render('pCategory', { title: 'Password Management System', loginUser: loginUser, records: data })

  })
})

// route to delete password category
router.get('/passwordCategory/delete/:id', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');

  const userid = req.params.id
  const deletefunction = PassCate.findByIdAndDelete(userid)
  deletefunction.exec((err, data) => {
    if (err) throw err
    res.redirect('/pass-category')
  })
})
// route to update the password category
router.get('/passwordCategory/edit/:id', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');

  const userid = req.params.id

  const getpasscategory = PassCate.findById({ '_id': userid })
  getpasscategory.exec((err, data) => {
    console.log(data)
    if (err) throw err
    res.render('edit_pass_category', { title: 'Password Management System', loginUser: loginUser, records: data, error: '', success: '', id: userid })

  })
})
/// post route to update the category list
router.post('/passwordCategory/edit', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');

  const userid = req.body.id
  const passcate = req.body.passwordCategory
  const updatepasscate = PassCate.findByIdAndUpdate(userid, { Password_category: passcate })

  updatepasscate.exec((err, data) => {
    console.log(data)
    if (err) throw err
    res.redirect('/pass-category')

  })
})


// route to form of password category
router.get('/add-category', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  res.render('addnewcategory', { title: 'Password Management System', loginUser: loginUser, error: '', success: '' })
})
// route to view of add pass
router.get('/add-pass', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  getpasscate.exec((err,data)=>{
   if(err) throw err
   res.render('add-pass', { title: 'Password Management System', loginUser: loginUser,records:data ,success:''})

  })
  })
// post route to add insert password to DB
  router.post('/add-pass', islogin, (req, res) => {
    const loginUser = localStorage.getItem('loginuser');
    const pass_cate = req.body.pass_cat;
    const passvalue = req.body.pass_details;
    const pass_details = new PassModel({
      Password_category: pass_cate,
      Password_details:passvalue
    })
    pass_details.save((err,doc)=>{
      if(err) throw err
      getpasscate.exec((err,data)=>{
        if(err) throw err
        res.render('add-pass', { title: 'Password Management System', loginUser: loginUser,records:data,success:"Inserted Succefully" })
  
       })
      
    })
   
    })
// display password route
router.get('/view-all-pass', islogin, (req, res) => {
  const loginUser = localStorage.getItem('loginuser');
  res.render('view-all-pass', { title: 'Password Management System', loginUser: loginUser })
})
module.exports = router;
