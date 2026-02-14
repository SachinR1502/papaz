const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    vehicleType: { type: String, default: 'Car' }, // Car, Bike, Scooter, Truck, Bus, Tractor, Van, Rickshaw, Earthmover, EV Vehicle, Other
    year: { type: String },
    registrationNumber: { type: String, required: true, unique: true },
    chassisNumber: { type: String },
    engineNumber: { type: String },
    fuelType: { type: String },
    bsNorm: { type: String },
    color: { type: String },
    mileage: { type: String },
    qrCode: { type: String }, // For generated QR
    images: [{ type: String }],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
