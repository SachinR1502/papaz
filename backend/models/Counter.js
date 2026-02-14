const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    sequence: { type: Number, default: 0 }
});

// Method to get next sequence number
counterSchema.statics.getNextSequence = async function (counterName) {
    const counter = await this.findOneAndUpdate(
        { name: counterName },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );
    return counter.sequence;
};

module.exports = mongoose.model('Counter', counterSchema);
