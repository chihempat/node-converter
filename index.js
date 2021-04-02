'use strict';
var path = require('path');
const express = require('express')
const fs = require('fs')
const multer = require('multer')
    //const xlsx = require('xlsx');
    //const pathxlsxFile = require('read-excel-file/node')
const mongoose = require('mongoose');
//const excelToJson = require('convert-excel-to-json');
const { MongoClient } = require("mongodb");
//const csv = require('csv-parser');
const CSVToJSON = require('csvtojson');
//const excel2json = require('excel2json');
const node_xj = require("xls-to-json");
//const xlsxtojson = require('xlsx-to-json');
var exphbs = require('express-handlebars');
// const pdf = require('express-pdf');
let pdf = require("html-pdf");
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');

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
        cb(null, file.fieldname + '-' + Date.now())
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
app.post('/convert', upload.single('file'), (req, res) => {
    console.log("coverted")
})


app.get("/csvtopdf", async(req, res) => {
    const data = await CSVToJSON().fromFile('uploads/grades.csv');
    xlpdf(req, res, data, "template.ejs")
})




app.get("/xltopdf", upload.single('file'), (req, res) => {
    console.log(req.body.file)

    if (fs.existsSync('./product.json')) {
        let rawdata = fs.readFileSync('product.json');
        let data = JSON.parse(rawdata);
        xlpdf(req, res, data, "template2.ejs");
        // console.log(data);
    } else {
        node_xj({
                input: "./uploads/Product.xlsx", // input xls
                output: "product.json", // output json
                allowEmptyKey: false,
                lowerCaseHeaders: true
            },
            function(err, result) {
                if (err) {
                    console.error(err);
                } else {
                    let rawdata = fs.readFileSync('product.json');
                    let data = JSON.parse(rawdata);
                    xlpdf(req, res, data, "template2.ejs");
                }
            }
        );
    }
})

// console.log(data);



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








app.listen(PORT, () => {
    console.log('Mongoose listening on port ' + PORT);
})



var xlpdf = function(req, res, data, h, w) {

    ejs.renderFile(path.join(__dirname, './views/', "template2.ejs"), { result: data, route: "xlsx" }, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            let options = {
                "height": "10in",
                "width": "16in",
                "header": {
                    "height": "20mm"
                },
                "footer": {
                    "height": "20mm",
                },
            };
            pdf.create(data, options).toFile("report.pdf", function(err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.download(path.join(__dirname, "report.pdf"), "report.pdf", (err) => {
                        if (err) {
                            res.status(500).send({
                                message: "Could not download the file. " + err,
                            });
                        }
                    });
                }
            });
        }
    });

}