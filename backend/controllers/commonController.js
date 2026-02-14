const Settings = require('../models/Settings');

// @desc    Get Public Platform Settings
// @route   GET /api/common/settings
const getPublicSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // Return clear defaults if no settings exist
        if (!settings) {
            return res.json({
                currency: 'INR',
                serviceZones: [],
                maintenanceMode: false,
                allowRegistrations: true
            });
        }

        // Return only safe public fields
        res.json({
            currency: settings.currency || 'INR',
            serviceZones: settings.serviceZones || [],
            maintenanceMode: settings.maintenanceMode || false,
            allowRegistrations: settings.allowRegistrations,
            // Don't expose sensitive fields like commission rates or payout schedules here if not needed
        });
    } catch (error) {
        console.error('Common getPublicSettings Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getPublicSettings };
