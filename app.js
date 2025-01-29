const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-jalaali');

const app = express();
const PORT = 4000;



app.set('view engine', 'ejs');
app.use(express.static('public'));

let lastUpdated = moment().format('jYYYY/jMM/jDD - HH:mm:ss'); // زمان اولیه
app.get('/', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        const cryptoData = await fetchCryptoData(); // اضافه کردن این خط
        res.render('index', { goldData, cryptoData, lastUpdated }); // ارسال cryptoData به view
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در برقراری اتصال ، لطفا اینترنت خود را بررسی کنید .');
    }
});

app.get('/refresh', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        const cryptoData = await fetchCryptoData(); // اضافه کردن این خط
        lastUpdated = moment().format('jYYYY/jMM/jDD - HH:mm:ss'); // بروزرسانی زمان
        res.json({ goldData, cryptoData, lastUpdated }); // ارسال هر دو داده
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در برقراری اتصال ، لطفا اینترنت خود را بررسی کنید .');
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

async function fetchCryptoData() {
    const { data } = await axios.get('https://alanchand.com/crypto-price');
    const $ = cheerio.load(data);
    const cryptoData = [];

    $('.col-12').each((i, elem) => {
        const titlePersian = $(elem).find('.persian').text().trim();
        const titleEnglish = $(elem).find('.english').text().trim();
        const priceToman = $(elem).find('.toman').text().trim();
        const priceDollar = $(elem).find('.crypto_sync').first().text().trim();
        const change = $(elem).find('.crypto_change').text().trim();

        if (titlePersian && priceToman && priceDollar && change) {
            cryptoData.push({ titlePersian, titleEnglish, priceToman, priceDollar, change });
        }
    });

    return cryptoData;
}


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});