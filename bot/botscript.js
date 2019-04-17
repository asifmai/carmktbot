const puppeteer = require('puppeteer');
// const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
// const data = {
//   name: 'iqbal',
//   email: 'asifmai@hotmail.com',
//   telephone: '+923462440717',
//   message: 'This is a test message',
//   url: 'https://www.autoscout24.it/lst/bmw/x4/ancona?sort=standard&desc=0&ustate=N%2CU&lon=13.51874&lat=43.615846&zip=Ancona&zipr=50&cy=I&priceto=75000&atype=C'
// }
// https://www.autoscout24.it/lst/bmw/serie-5-(tutto)?desc=0&size=20&custtype=P&page=1&fc=0&cy=I&pricefrom=10000&offer=U&sort=standard&ustate=N%2CU&atype=C

module.exports.runBot = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        // executablePath: chromePath,
        headless: false,
        args: [
          '--window-size=1366,768', 
          '--disable-notifications']
      });
      const page = await browser.newPage();
      
      const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
      const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
      await page.setUserAgent(chromeUserAgent);
      await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.8'
      });

      page.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.dismiss();
      });

      await page.setViewport({
        width: 1366,
        height: 600
      });

      await page.setRequestInterception(true);

      page.on('request', (req) => {
          if(req.resourceType() === 'image' || req.resourceType() === 'font'){
              req.abort();
          }
          else {
              req.continue();
          }
      });
      
      await page.goto(data.url, {
        timeout: 0,
        waitUntil: 'load'
      });
      
      let noofPages;
      if (await page.$('.sc-pagination')) {
        await page.waitForSelector('.sc-pagination');
        const pages = await page.$$('.sc-pagination li');
        noofPages = parseInt(await page.evaluate(el => el.innerText , pages[pages.length - 2]));
      } else {
        noofPages = 1;
      }
      
      console.log('No of Pages: ', noofPages);
      // let noofOptions;
      let items;
      let currentPage;
      for (let a = 0; a < noofPages; a++) {
        console.log('Now on Page: ', a + 1);
        if (a == 0) {
          currentPage = data.url;
        } else {
          // await page.goto(currentPage, {
            // timeout: 0,
            // waitUntil: 'load'
          // });
          
          // await page.waitForSelector('.sc-pagination');
          // const nextpageAnchor = await page.$('.sc-pagination .next-page a');
          currentPage = currentPage.replace(`page=${a}`, `page=${a + 1}`)
        }

        await page.goto(currentPage, {
          timeout: 0,
          waitUntil: 'load'
        });
        // await page.waitForSelector('.cl-list-elements .cl-list-element.cl-list-element-gap');
        // noofOptions = await page.$$('.cl-list-element.cl-list-element-gap');
        const noofOptions = await page.$$('.cl-list-elements .cl-list-element.cl-list-element-gap')

        console.log(`No of Items on page ${a + 1}: ${noofOptions.length}`);
        for (let i = 0; i < noofOptions.length; i++) {
          console.log(`Now on page: ${a + 1}, item: ${i + 1}`);
          if (i !== 0) {
            await page.goto(currentPage, {
              timeout: 0,
              waitUntil: 'load'
            });
            // await page.waitForSelector('.cl-list-elements .cl-list-element.cl-list-element-gap');
          }
          
          items = await page.$$('.cl-list-element.cl-list-element-gap');
          await Promise.all([
            page.waitForNavigation({
              timeout: 0,
              waitUntil: 'load'
            }),
            items[i].click(),
          ]);
  
          const contactButton = await page.$('.sc-btn-bob.cldt-stage-send-btn')
          // await page.waitForSelector('.sc-btn-bob.cldt-stage-send-btn', { timeout: 0 });
          // await page.click('.sc-btn-bob.cldt-stage-send-btn');
          await contactButton.click()
  
          // await page.waitForSelector('input[name="senderName"]');
          await page.evaluate( () => document.querySelectorAll('input[name="senderName"]')[1].value = "")
          const senderName = await page.$$('input[name="senderName"]');
          await senderName[1].type(data.name);
          
          // await page.waitForSelector('input[name="senderEmail"]');
          await page.evaluate( () => document.querySelectorAll('input[name="senderEmail"]')[1].value = "")
          const senderEmail = await page.$$('input[name="senderEmail"]');
          await senderEmail[1].type(data.email);
          
          // await page.waitForSelector('input[name="fullPhoneNumber"]');
          await page.evaluate( () => document.querySelectorAll('input[name="fullPhoneNumber"]')[1].value = "")
          const fullPhoneNumber = await page.$$('input[name="fullPhoneNumber"]');
          await fullPhoneNumber[1].type(data.telephone);
          
          // await page.waitForSelector('textarea[name="comment"]');
          await page.evaluate( () => document.querySelectorAll('textarea[name="comment"]')[1].value = "");
          const comment = await page.$$('textarea[name="comment"]');
          await comment[1].type(data.message);
  
          // await page.waitForSelector('label[for="privacyAgreement_checkbox2');
          const privacyCheck = await page.$('label[for="privacyAgreement_checkbox2');
          // await page.click('label[for="privacyAgreement_checkbox2');
          await privacyCheck.click();
  
          const delay = Math.round(Math.random()*60000) + 30000;
          console.log(`Delay before Submit: ${Math.round(delay/1000)} seconds`);
          await page.waitFor(delay);
  
          // await page.waitForSelector('input[type="submit"]');
          const submit = await page.$$('input[type="submit"]');
          await Promise.all([
            page.waitForNavigation({
              timeout: 0,
              waitUntil: 'load'
            }),
            submit[1].click()
          ])
          console.log(`Page ${a + 1}, Item ${i + 1} submitted...`);
        }
      }
      resolve('done');
    } catch (error) {
      reject(error);
    }
  });
}