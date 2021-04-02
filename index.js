'use strict';
var path = require('path');
const express = require('express')
const fs = require('fs')
const multer = require('multer')
const xlsx = require('xlsx');
const xlsxFile = require('read-excel-file/node')
const mongoose = require('mongoose');
const excelToJson = require('convert-excel-to-json');
const { MongoClient } = require("mongodb");
//const csv = require('csv-parser');
const CSVToJSON = require('csvtojson');
//const excel2json = require('excel2json');
const node_xj = require("xls-to-json");
//const xlsxtojson = require('xlsx-to-json');
// const pdf = require('express-pdf');
let pdf = require("html-pdf");
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const { topdf } = require('./config/function')

const PORT = process.env.PORT || 5000;
const uri = process.env.URI || 'mongodb+srv://Chintan:helloworld@cluster0.w12fo.mongodb.net/filesdb?retryWrites=true&w=majority'
var upload = multer({ dest: 'uploads/' })

let xljson = [];
let csvjson = [];
let cv = {}

const app = express();
const client = new MongoClient(uri, { useUnifiedTopology: true });
const connect = client.connect().then((res) => console.log("connected")).catch()

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + file.originalname.split('.')[1])
    }
})

var upload = multer({ storage: storage })


//app.use(pdf);

app.use(express.urlencoded({ extended: false })); //handle body requests
app.use(express.json()); // let's make JSON work too!
app.use('/', express.static(__dirname + '/public'));

//views EJS
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
        res.render('index')
    })
    // app.post('/convert', upload.single('file'), (req, res) => {

//     console.log("coverted")
// })


app.post("/upload", upload.single('file'), async(req, res) => {
    var ext = req.file.originalname.split('.')[1];
    var og = req.file.originalname.split('.')[0];

    if (ext == "xlsx") {
        console.log(1)

        console.log(2)
        try {
            console.log(3)
            var data = excelToJson({
                source: fs.readFileSync(req.file.path),
                columnToKey: {
                    '*': '{{columnHeader}}'
                }
            });
            data = data.Sheet1
            const database = client.db("filesdb");
            const db = database.collection(og);
            const options = { ordered: true };
            console.log(4)
            const result = await db.insertMany(data, options);
            console.log(`${result.insertedCount} documents were inserted`);
        } catch (err) {
            console.error(err);
        } finally {
            console.log("done")
            res.redirect('/')
        }

    } else if (ext == "csv") {
        console.log(5)

        console.log(6)
        try {
            console.log(7)
            const data = await CSVToJSON().fromFile('uploads/grades.csv');
            const database = client.db("filesdb");
            const db = database.collection(og);
            const options = { ordered: true };
            console.log(8)
            const result = await db.insertMany(data, options);
            console.log(`${result.insertedCount} documents were inserted`);
        } catch (err) {
            console.error(err);
        } finally {
            console.log("done")
            res.redirect('/')
        }
    }

})


app.post("/csvtopdf", upload.single('file'), async(req, res) => {
    var keys = [];
    console.log(req.file)
    const data = await CSVToJSON().fromFile(req.file.path);
    keys = Object.keys(data[0])
    topdf(req, res, data, keys);
})

app.post("/xltopdf", upload.single('file'), (req, res) => {
    console.log(req.body.file)
    var keys = [];
    var data = excelToJson({
        source: fs.readFileSync(req.file.path),
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });
    data = data.Sheet1;
    Object.keys(data[0]).forEach(function(key) {
        var value = data[0][key];
        keys.push(value)
    });
    console.log(keys)
    topdf(req, res, data, keys);
})

app.get("/excelltojson", (req, res) => {

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

    async() => {
        try {
            await client.connect();
            const database = client.db("filesdb");
            const grades = database.collection("products");
            const options = { ordered: true };
            const result = await grades.insertMany(xl, options);
            console.log(`${result.insertedCount} documents were inserted`);
        } finally {
            console.log("done")
        }
    }

})

app.get("/csvtojson", (req, res) => {
    async() => {
        try {
            const database = client.db("filesdb");
            const grades = database.collection("grades");
            const options = { ordered: true };
            const result = await grades.insertMany(xl, options);
            console.log(`${result.insertedCount} documents were inserted`);
        } finally {
            console.log("done")
        }
    }

})

app.listen(PORT, () => {
    console.log('Mongoose listening on port ' + PORT);
})