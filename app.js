const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const app = express();
const PORT = 4000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('title', 'My Site');

let lastUpdated = moment().format('jYYYY/jMM/jDD - HH:mm:ss'); // زمان اولیه

app.get('/', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        const cryptoData = await fetchCryptoData();
        const currencyData = await fetchCurrencyData(); // دریافت داده‌های ارزها
        res.render('index', { goldData, cryptoData, currencyData, lastUpdated });
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در برقراری اتصال به سرور. لطفا اینترنت خود را بررسی کنید و دوباره تلاش کنید.');
    }
});

app.get('/refresh', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        const cryptoData = await fetchCryptoData();
        const currencyData = await fetchCurrencyData(); // دریافت داده‌های ارزها
        lastUpdated = moment().format('jYYYY/jMM/jDD - HH:mm:ss');
        res.json({ goldData, cryptoData, currencyData, lastUpdated });
    } catch (error) {
        console.error(error);
        res.status(500).send("خطا در بروزرسانی داده ها ‼️")
    }
});

// تابع دریافت داده‌های ارزها از TGJU
async function fetchCurrencyData() {
    try {
        const { data } = await axios.get('https://www.tgju.org/');
        const $ = cheerio.load(data);
        const currencyData = [];

        $('table.dataTable tbody tr').each((i, elem) => {
            const title = $(elem).find('th').text().trim(); // نام ارز
            const price = $(elem).find('td.market-price').text().trim(); // قیمت
            const change = $(elem).find('td').eq(2).text().trim(); // تغییرات
            const low = $(elem).find('td.market-low').text().trim(); // کمترین
            const high = $(elem).find('td.market-high').text().trim(); // بیشترین
            const time = $(elem).find('td.market-time').text().trim(); // زمان

            if (title && price && change && low && high && time) {
                currencyData.push({ title, price, change, low, high, time });
            }
        });

        return currencyData;
    } catch (error) {
        console.error('خطا در دریافت داده‌های ارز:', error);
        throw new Error('خطا در دریافت داده‌های ارز. لطفا دوباره تلاش کنید.');
    }
}

// توابع fetchGoldData و fetchCryptoData (بدون تغییر)
async function fetchGoldData() {
    try {
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
    } catch (error) {
        console.error('خطا در دریافت داده‌های طلا:', error);
        throw new Error('خطا در دریافت داده‌های طلا. لطفا دوباره تلاش کنید.');
    }
}

async function fetchCryptoData() {
    try {
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
    } catch (error) {
        console.error('خطا در دریافت داده‌های ارز دیجیتال:', error);
        throw new Error('خطا در دریافت داده‌های ارز دیجیتال. لطفا دوباره تلاش کنید.');
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});