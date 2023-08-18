
// routes defination

// dependencies 
const { samplehandler } = require('./handler/routes-handler/sample-handler')
const { userhandler } = require('./handler/routes-handler/userHandler')
const {tokenhandler} = require('./handler/routes-handler/tokenHandler')
const {checkhandler} = require('./handler/routes-handler/checkHandler')

const routes = {
    sample : samplehandler,
    user : userhandler,
    token : tokenhandler,
    check : checkhandler,

};

module.exports = routes;