const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongoURI = 'mongodb+srv://shubhamkdutt7:ReE1g8NxASuf8vn3@SmartMirror.iuebqix.mongodb.net/SmartMirror?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Defining schemas
const dataSchema = new mongoose.Schema({
    event: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
});

// Defining models
const WeatherData = mongoose.model('WeatherData', dataSchema, 'Weather API calls');
const TransportData = mongoose.model('TransportData', dataSchema, 'Transport API calls');
const ReverseGeoData = mongoose.model('ReverseGeoData', dataSchema, 'Reverse Geo API calls');
const NewsData = mongoose.model('NewsData', dataSchema, 'News API calls');
const CurrencyData = mongoose.model('CurrencyData', dataSchema, 'Currency API calls');

// Endpoint to receive data
app.post('/data', async (req, res) => {
    const { event, data, eventType } = req.body;

    try {
        let dataEntry;
        if (eventType === 'weather') {
            dataEntry = new WeatherData({ event, data });
        } else if (eventType === 'transport') {
            dataEntry = new TransportData({ event, data });
        } else if (eventType === 'reverseGeo') {
            dataEntry = new ReverseGeoData({ event, data });
        } else if (eventType === 'news') {
            dataEntry = new NewsData({ event, data });
        } else if (eventType === 'currency') {
            dataEntry = new CurrencyData({ event, data });
        } else {
            return res.status(400).send('Invalid event type');
        }

        await dataEntry.save();
        res.status(200).send('Data saved');
    } catch (error) {
        console.error('Error saving data to MongoDB', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
