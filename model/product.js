const mongoose = require('mongoose')
const Schema = require('mongoose').Schema

const ProductSchema = new Schema({
    segment: String,
    country: String,
    product: String,
    discount: String,
    unitsSold: Number,
    manufacturingPrice: Number,
    salePrice: Number,
    grossSales: Number,
    discount: Number,
    sales: Number,
    COGS: Number,
    profit: Number,
    date: Date,
    monthNumber: Number,
    monthName: String,
    year: Number
}, { collection: 'products' })

module.exports = mongoose.model('Products', ProductSchema);