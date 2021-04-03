const ejs = require('ejs');
const path = require('path');
let pdf = require("html-pdf");
const node_xj = require("xls-to-json");



var topdf = function(req, res, data, keys) {
    console.log(11)
    ejs.renderFile(path.join(__dirname, '../views/', "data.ejs"), { result: data, keys: keys }, (err, html) => {
        if (err) {
            res.send(err);
        } else {
            console.log(12)
            let options = {
                // "height": "10.5in", // allowed units: mm, cm, in, px
                // "width": "8in", // allowed units: mm, cm, in, px
                "format": "A2", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                "orientation": "landscape",
                "header": {
                    "height": "20mm"
                },
                "footer": {
                    "height": "20mm",
                },
                "timeout": 120000,
            };
            pdf.create(html, options).toFile("report.pdf", function(err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.download(path.join(__dirname, "../report.pdf"), "report.pdf", (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({
                                message: "Could not download the file. " + err,
                            });

                        } else {
                            console.log(13)
                            console.log("Download")
                        }

                    });
                }
            });
            console.log(14)

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