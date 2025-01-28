const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 4000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        res.render('index', { goldData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching data');
    }
});

app.get('/refresh', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        res.json(goldData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching data');
    }
});

async function fetchGoldData() {
    const { data } = await axios.get('https://alanchand.com/gold-price');
    const $ = cheerio.load(data);
    const goldData = [];

    $('.col-lg-12').each((i, elem) => {
        const title = $(elem).find('.persian strong').text().trim();
        const price = $(elem).find('.cell').eq(0).text().trim();
        const change = $(elem).find('.cell').eq(1).text().trim();
        const bubble = $(elem).find('.cell').eq(2).text().trim();

        if (title && price && change && bubble) {
            goldData.push({ title, price, change, bubble });
        }
    });

    return goldData;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});