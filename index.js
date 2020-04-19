const puppeteer = require('puppeteer');

const email = 'example@email.com';           //Enter your own email address here
const password = 'examplePassword';          //Enter your own password here
const company = 'label[for = "sf-currentCompany-1441"]' ; // Enter the current company out of the given companies
                                                          // described in the readme

(async () => {
  const browser = await puppeteer.launch({
   headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1536,
    height: 760,
    deviceScaleFactor : 1
  });

  //navigation till the add people page
  await page.goto('https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin');
  await page.waitForSelector('#username');
  await page.type('#username', email , {delay: 100});    //loging in
  await page.type('#password', password, {delay: 100});
  await page.click('.btn__primary--large');
  await page.waitForSelector('.search-global-typeahead__input');
  await page.click('.search-global-typeahead__input');

  await page.waitFor(3000);
  const peopleBtn = await page.$x('/html/body/header/div/form/div/div/div/div/div[1]/div[3]/div/div[2]/ul/li[1]');  //have to use the full XPath cause of dynamic ids
  await peopleBtn[0].click();

  await page.waitFor('button[data-control-name = "all_filters"]');
  await page.click('button[data-control-name = "all_filters"]');

  await page.waitForSelector(company);
  await page.click(company);
  await page.click('button[data-control-name = "all_filters_apply"]');
  await page.waitFor(5000);

  await page.evaluate(()=> {
  window.scrollTo({
    top: document.body.scrollHeight,
    left: 0,
    behavior: 'smooth'
  });
  });

  await page.waitFor('button[aria-label="Next"]');


   await page.evaluate( async () => {

    // finds connect buttons on the page and stores it in an array and returns that
    const btnFinder = async () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
      await new Promise ((resolve) => {setTimeout(resolve,2000);});
    const buttonsList = document.querySelectorAll('.search-result__actions--primary');
    console.log(buttonsList);
    const buttonsArr = Array.from(buttonsList);
    const connectBtns = buttonsArr.filter( cur => {
     if(cur.ariaLabel.startsWith("Connect")){
       return cur ;
     }
    });
    console.log(connectBtns);
    return connectBtns;

   };

    // clicks on the connect buttons and clicks next once all are clicked
    const clickingConnects = async(cbtns) => {
      for(var i = 0; i < cbtns.length ; i++){
        cbtns[i].click();
        await new Promise ((resolve) => {setTimeout(resolve,2000);});
        document.querySelector('button[aria-label = "Send invitation"]').click();
        await new Promise ((resolve) => {setTimeout(resolve,2000);});
        console.log(cbtns[i]);
      }
    document.querySelector('button[aria-label="Next"]').click();
    await new Promise ((resolve) => {setTimeout(resolve,4000);});
     };

   // main-controller
    const controller = async () => {
        let cnctBtns = await btnFinder();
        if(cnctBtns.length === 0){
          document.querySelector('button[aria-label="Next"]').click();
          await new Promise ((resolve) => {setTimeout(resolve,4000);});
          await controller();
        }
        await clickingConnects(cnctBtns);
    }

    for (var i = 0; i < 2; i++){   //Enter the number of pages you want to send invites to (skips the all sent pages) (each page has 10 people)
      await controller() ;
    }

 });

  await page.waitFor(5000);
  await page.screenshot({path: 'ss/screenshot1.png' });
  await browser.close();
})();
