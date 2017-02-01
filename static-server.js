//setting up a static server
// INCLUDE A STATIC SERVER TO SERVE UP OUR FILES
//go in and check all the files in your current directory and reads them in as needed
//serves static files in its local directory
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8081, ()=>{
    console.log('Static server is running on port 8081')    
});