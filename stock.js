
const puppeteer = require("puppeteer");
let link = "https://www.bseindia.com";
let cTab;
let NoOfCompanies= process.argv[2];
(async function fn() {
    try {
        let browserOpenPromise = puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"],
                                                                             //executablePath: '/path/to/Chrome' 
        });
        let browser = await browserOpenPromise;
        let allTabsArr = await browser.pages();
        cTab = allTabsArr[0];
        let ans;
        for(let i=0;i<NoOfCompanies;i++){
            let cName= process.argv[i+3];
             ans=await priceFromBSE(link,cName);
             console.log(ans);
        }
        
    } catch (err) {
        console.log(err);
    }
})();
async function priceFromBSE(link,cName){
    try{
        await cTab.goto(link,{waitUntil: 'networkidle0'});
        await cTab.type("input[type='text']",cName,{delay:20});
        await waitandpress(".quotemenu");                           // our function so no cTab use
        await cTab.waitForSelector('.sensexbluetext.ng-binding');
        let inputsel='.sensexbluetext.ng-binding';
        let sel= await cTab.evaluate(chooseSelector,inputsel);
        await cTab.waitForSelector(sel);
        return  cTab.evaluate(BseFn,sel,".textsr",".textvalue.ng-binding",cName);
    }
    catch(err){
        console.log(err);
    }
}
async function BseFn(currentShare,keysElem,valuesElem,cName){
    let list =[];
    currentShare=currentShare+" .ng-binding";
    let currentShareprice=document.querySelectorAll(currentShare);//we will get an array of queries even if its a one value
    list.push("Details of => "+cName);
    list.push({"currentPrice ":currentShareprice[0].innerText});
    let keysarr=document.querySelectorAll(keysElem);
    let valuesarr=document.querySelectorAll(valuesElem);
    for(let i=0;i<5;i++)
    list.push({
        [keysarr[i].innerText]:valuesarr[i].innerText
    })
    return list;
}
async function waitandpress(selector){
    try{
        await cTab.waitForSelector(selector);
        await cTab.keyboard.press('Enter');
    }
    catch(err){
        console.log(err);
    }
}
async function chooseSelector(inputsel){
        let CurrentShareSel=document.querySelectorAll(inputsel);    //current share selector positive or negative
        let value=CurrentShareSel[0].innerText;
        let di=value.split('(');                                    // decreasing or increasing
        let sel;
         if(di[0]<0){
            sel=".viewsensexvalue.redtext.ng-scope"
         }
         else {
             sel=".viewsensexvalue.greentext.ng-scope"
         }
         return sel;
}
async function priceFromNSE(link){
    await cTab.goto(link,{waitUntil: 'networkidle0'});
    await cTab.type(".searchbox  input[type='text']","dabur",{delay:20});
    await cTab.keyboard.press('ArrowDown');
    await cTab .keyboard.press('Enter');

}
