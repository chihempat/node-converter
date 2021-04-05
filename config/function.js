const ejs = require('ejs');
const path = require('path');
let pdf = require("html-pdf");
const node_xj = require("xls-to-json");
var pdftohtml = require("pdftohtml");
var i = 0


var topdf = function(req, res, data, keys) {
    console.log(i++);
    ejs.renderFile(path.join(__dirname, '../views/', "data.ejs"), { result: data, keys: keys }, (err, html) => {
        console.log(i++);
        if (err) {
            res.send(err);
        } else {
            console.log(i++);
            let options = {
                // "height": "10.5in", // allowed units: mm, cm, in, px
                // "width": "8in", // allowed units: mm, cm, in, px
                "format": "A3", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                "orientation": "landscape",
                "header": {
                    "height": "20mm"
                },
                "footer": {
                    "height": "20mm",
                },
                "timeout": 180000,
            };
            console.log(i++);
            pdf.create(html, options).toFile("report.pdf", function(err, data) {
                if (err) {
                    res.send(err);
                } else {
                    console.log(data)
                    res.download(path.join(__dirname, "../report.pdf"), "report.pdf", (err, data) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send({
                                message: "Could not download the file. " + err,
                            });
                        }
                        console.log(data)
                    });
                }
            });
        }
    });

}

var xltojson = function() {
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

module.exports = { topdf }