const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency;

const leaderSchema = new Schema({
    name: {
        type: String,
        required: true,
        unigue: true 
    },
    image: {
        type: String,
        default: true
    },
    designation: {
        type: String,
        default: '' 
    },
    abbr: {
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


const Leaders = mongoose.model('Leader', leaderSchema);

module.exports = Leaders