var express = require('express'),
    router  = express.Router(),
    config  = require('../config/config'),
    User    = require('../models/user.model'),
    TemplateQuote    = require('../models/templateQuote.model'),
    Form    = require('../models/form.model'),
    fs      = require('fs'),
    jwt     = require('jsonwebtoken');
    mongoose                = require('mongoose'),
    Schema                  = mongoose.Schema,

// this process does not hang the nodejs server on error
process.on('uncaughtException', function (err) {
  console.log(err);
});





// Checking if user is authenticated or not, security middleware
router.use('/', function (req, res, next) {
  var token = req.headers['authorization'];
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        message: 'Authentication failed',
        error: err
      })
    }
    if (!decoded) {
      return res.status(404).json({
        title: 'Authentication Failed',
        error: {message: 'Authentication failed, malformed jwt. Please login or refresh Page'}
      });
    }
    if (decoded) {
      User
      .findById(decoded.user._id)
      .populate({ path: 'rights', model: 'Right'})
      .exec(function (err, doc) {
        if (err) {
          return res.status(500).json({
            message: 'Fetching user failed',
            err: err
          });
        }
        if (!doc) {
          return res.status(404).json({
            title: 'User not found',
            error: {message: 'The user was not found'}
          })
        }
        if(!shared.isCurentUserHasAccess(doc, 'quote', 'read')) {
          return res.status(404).json({
            title: 'No rights',
            error: {message: 'No rights'}
          })
        }
        if (doc) {
          req.user = doc;
          next();
        }
      })
    }
  })
});






router.get('/:id', function (req, res, next) {
  TemplateQuote.findById((req.params.id), function (err, obj) {
    if (err) {
      return res.status(500).json({
        message: 'An error occured',
        err: err
      })
    }
    if (!obj) {
      return res.status(404).json({
        title: 'No form found',
        error: {message: 'Form not found!'}
      })
    }
    let findQuery = {}
    findQuery['_id'] = req.params.id

    TemplateQuote
    .findOne(findQuery)
    .populate({path: 'projects', model: 'Project'})
    .populate({path: 'clients', model: 'User'})

    .exec(function (err, item) {
      if (err) {
        return res.status(404).json({
          message: '',
          err: err
        })
      } if (!item) {
        return res.status(404).json({
          title: 'No obj found',
          error: {message: 'Obj not found!'}
        })
      } else {
        res.status(200).json({
          message: 'Success',
          item: item
        });
      }
    })
  })
})







//update
router.put('/:id', function (req, res, next) {
  TemplateQuote.findById(({_id: req.params.id}), function (err, item) {
    if (err) {
      return res.status(404).json({
        message: '',
        err: err
      })
    }



    for (var prop in req.body) {
      if(prop !== '__v' && prop !== 'updatedAt' && prop !== 'createdAt')
        item[prop] = req.body[prop]
    }


    item.save(function (err, result) {
      if (err) {
        return res.status(404).json({
          message: 'There was an error, please try again',
          err: err
        });
      }
      res.status(201).json({
        message: '',
        obj: result
      });
    });

  })
});

router.post('/', function (req, res, next) {
  if(!req.user.ownerCompanies.length) {
    return res.status(404).json({
      message: 'You must belong to a companie',
      err: ''
    })
  }
  var templateQuote = new TemplateQuote(req.body);
  templateQuote.ownerCompanies = req.user.companies
  templateQuote.save(function (err, result) {
    if (err) {
      return res.status(403).json({
        title: 'There was an issue',
        error: {message: 'The email you entered already exists'}
      });
    }
    res.status(200).json({
      message: 'Registration Successfull',
      obj: result
    })
  })
});



// get all forms from database
router.get('/page/:page', function (req, res, next) {
  var itemsPerPage = 5
  var currentPage = Number(req.params.page)
  var pageNumber = currentPage - 1
  var skip = (itemsPerPage * pageNumber)
  //var limit = (itemsPerPage * pageNumber) + itemsPerPage

  let nameQuery = {}
  let cityQuery = {}
  let searchQuery = {}
  searchQuery['ownerCompanies'] = req.user.ownerCompanies

  let arrObj = []
  if(req.query.search) {
  //  nameQuery['name'] = new RegExp(req.query.search, 'i')
  //  cityQuery['address.city'] = new RegExp(req.query.search, 'i')
    arrObj.push({'nameTemplate' : new RegExp(req.query.search, 'i')})
    // arrObj.push({'address.city' : new RegExp(req.query.search, 'i')})
    // arrObj.push({'address.address' : new RegExp(req.query.search, 'i')})
    searchQuery = {$or:arrObj}
    //findQuery['address.city'] = new RegExp(req.query.search, 'i')
  }


  if(req.query.userId)
    searchQuery['clients'] = mongoose.Types.ObjectId(req.query.userId)

  if(req.query.projectId)
    searchQuery['projects'] = mongoose.Types.ObjectId(req.query.projectId)




  TemplateQuote
  .find(searchQuery)
  .populate({ path: 'clients', model: 'User'})
  .limit(itemsPerPage)
  .skip(skip)
  .sort(req.query.orderBy)
  .exec(function (err, item) {
    if (err) {
      return res.status(404).json({
        message: 'No results',
        err: err
      })
    } else {
      TemplateQuote
      .find(searchQuery)
      .count().exec(function (err, count) {
      res.status(200).json({
          paginationData : {
            totalItems: count,
            currentPage : currentPage,
            itemsPerPage : itemsPerPage
          },
          data: item
        })
      })
    }
  })
})





router.delete('/:id', function (req, res, next) {
  TemplateQuote.findById((req.params.id), function (err, item) {

    if (err) {
      return res.status(500).json({
        message: 'An error occured',
        err: err
      })
    }
    if (!item) {
      return res.status(404).json({
        title: 'No form found',
        error: {message: 'Form not found!'}
      });
    }


    // deleting the form from the database
    item.remove(function (err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occured',
          error: err
        });
      }
      res.status(200).json({
        message: 'Item is deleted',
        obj: result
      });
    })
  });
});



module.exports = router;
