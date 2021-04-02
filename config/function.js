const ejs = require('ejs');
const path = require('path');
let pdf = require("html-pdf");


var topdf = function(req, res, data, keys) {

    ejs.renderFile(path.join(__dirname, '../views/', "data.ejs"), { result: data, keys: keys }, (err, html) => {
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
            pdf.create(html, options).toFile("report.pdf", function(err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.download(path.join(__dirname, "../report.pdf"), "report.pdf", (err, data) => {
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

module.exports = { topdf }