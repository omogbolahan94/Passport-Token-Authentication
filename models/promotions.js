const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency;

// const commentSChema = new Schema({
//     rating: { //rafting field 
//         type: Number,
//         min: 1,
//         max: 5,
//         required: true
//     },
//     comment: { //comment field
//         type: String,
//         required: true,
//     },
//     author: {
//         type: String,
//         required: true,
//     }
//   }, 
//   {timestamps: true} //timestamps is a document on its own
// );

const promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unigue: true 
    },
    image: {
        type: String,
        default: true
    },
    label: {
        type: String,
        default: '' 
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    } 
}, {timestamps: true} );

const Promotions = mongoose.model('Promotion', promotionSchema);
module.exports = Promotions