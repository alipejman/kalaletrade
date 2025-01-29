app.get('/', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        const cryptoData = await fetchCryptoData();
        res.render('index', { goldData, cryptoData, lastUpdated });
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در برقراری اتصال به سرور. لطفا اینترنت خود را بررسی کنید و دوباره تلاش کنید.');
    }
});

app.get('/refresh', async (req, res) => {
    try {
        const goldData = await fetchGoldData();
        const cryptoData = await fetchCryptoData();
        lastUpdated = moment().format('jYYYY/jMM/jDD - HH:mm:ss');
        res.json({ goldData, cryptoData, lastUpdated });
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در بروزرسانی داده‌ها. لطفا دوباره تلاش کنید.');
    }
});

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
