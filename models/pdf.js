const pdf = require('html-pdf')
const template = require('../templates/first')

const makePdf = (req, res) => {
    pdf.create(template(), {}).toFile('result.pdf', (err, res)=> err? console.log(err): console.log(res))
}

module.exports = {
    makePdf
}