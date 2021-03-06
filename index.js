'use strict';
const path = require('path');
const express = require('express')
const fs = require('fs')
const multer = require('multer')
const excelToJson = require('convert-excel-to-json');
const { MongoClient } = require("mongodb");
const CSVToJSON = require('csvtojson');
let pdf = require("html-pdf");
var cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
const paginate = require('express-paginate');

const { topdf } = require('./config/function')

const PORT = process.env.PORT || 8080;
const uri = process.env.URI || 'mongodb://localhost:27017';
const url = process.env.URL || 'mongodb+srv://Chintan:helloworld@cluster0.w12fo.mongodb.net/filesdb?retryWrites=true&w=majority'


const app = express();


var i = 0;
var f = 1;
setInterval(intervalFunc, 1000);


const client = new MongoClient(uri, { useUnifiedTopology: true });
client.connect().then((res) => {
    console.log("connected")
}).catch(err => console.log(err))



var upload = multer({ dest: 'uploads/' })
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + file.originalname.split('.')[1])
    }
})
var upload = multer({ storage: storage })
var ssn;

//sessions
app.use(cookieParser());
app.use(session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}, ));

//[aginaiton]
app.use(paginate.middleware(10, 50));


//parsers
app.use(express.urlencoded({ extended: false })); //handle body requests
app.use(express.json()); // let's make JSON work too!
app.use('/', express.static(__dirname + '/public'));

//views EJS
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts);
app.set('view engine', 'ejs');

//set global vars
app.use(function(req, res, next) {
    next();
});

//@desc     for fetching index
//@route    GET:/
app.get("/", (req, res) => {
    ssn = req.session;
    res.render('index')
})

//@desc     for uploading to DB
//@route    POST:/upload
app.post("/upload", upload.single('file'), async(req, res) => {
    var keys = []
    f = 0;
    console.log("in")
    let ext = req.file.originalname.split('.')[1];
    let og = req.file.originalname.split('.')[0];
    const database = client.db("filesdb");
    const db = database.collection(og);
    const options = { ordered: true, checkKeys: false };
    var bulk = db.initializeOrderedBulkOp();

    if (ext == "xlsx" || ext == "xls") {
        var data = excelToJson({
            source: fs.readFileSync(req.file.path),
            columnToKey: {
                '*': '{{columnHeader}}'
            }
        });
        var k1 = Object.keys(data);
        data = data[k1];
        db.insertMany(data, options).then((result) => {
            console.log(`${result.insertedCount} documents were inserted`);
            f = 1;
            clearInterval(intervalFunc);
            res.redirect('/');
        });


    } else if (ext == "csv") {
        const data = await CSVToJSON().fromFile(req.file.path);
        for (var j = 0; j < data.length; ++j) {
            bulk.insert(data[j])
        }
        bulk.execute(function(err, result) {
            if (result) {
                console.dir(result);
                res.redirect('/');
                f = 1;
            } else if (err) {
                console.dir(err);
                res.render('./partials/error')
                f = 1;
            }
        });

    }
})

//@desc     for converting cvs to PDF
//@route    POST:/csvtopdf
app.post("/csvtopdf", upload.single('file'), async(req, res) => {
    var keys = [];
    console.log(req.file)
    const data = await CSVToJSON().fromFile(req.file.path);
    keys = Object.keys(data[0])
    topdf(req, res, data, keys);
})

//@desc     for converting Excell to PDF
//@route    POST:/xltopdf
app.post("/xltopdf", upload.single('file'), (req, res) => {
    //console.log(req.body.file)
    var keys = [];
    var data = excelToJson({
        source: fs.readFileSync(req.file.path),
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });
    var k1 = Object.keys(data);
    data = data[k1];
    Object.keys(data[0]).forEach(function(key) {
        var value = data[0][key];
        keys.push(value)
    });
    console.log(keys)
    topdf(req, res, data, keys);
})

//@desc     for converting Excell to JSON File
//@route    POST:/excelltojson
app.post("/excelltojson", upload.single('file'), (req, res) => {
    var coverttojson = function() {
        node_xj({
                input: "./output/Product.xlsx", // input xls
                output: "output.json", // output json
                allowEmptyKey: false,
                lowerCaseHeaders: true
            },
            function(err, result) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result);
                }
            }
        );
    }
})


app.listen(PORT, () => {
    console.log('Mongoose listening on port ' + PORT);
})


function intervalFunc() {
    if (!f)
        console.log(i++);
    else
        i = 0;
}