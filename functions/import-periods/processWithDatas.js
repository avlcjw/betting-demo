const fs = require('fs');
const cheerio = require('cheerio');

module.exports = function processWithDatas(arrayOrTxtFile) {
    try {
        if(typeof arrayOrTxtFile === 'object') {
            //新浪途径爬虫处理
            arrayOrTxtFile.resultHtml = '<table>' + arrayOrTxtFile.resultHtml + '</table>';
            let $ = cheerio.load(arrayOrTxtFile.resultHtml);
            let t = $('body').find('tr');
            return Array.from(t.map((i, v) => {
                let tds = $(v).find('td');
                return {
                    expect: tds.eq(0).html().replace('&#x671F;', '').replace('-', ''),
                    opentime: tds.eq(1).html(),
                    opencode: tds.eq(2).html().split('|'),
                    opentimestamp: new Date(tds.eq(1).html()).getTime(),
                };
            }));
        } else {
            //文本读取途径处理
            let txtRows = fs.readFileSync(arrayOrTxtFile, 'utf-8');
            return txtRows.split('\r\n').map((v, i) => {
                let arr = v.split('                         ');
                return {
                    expect: arr[0],
                    opencode: arr[1].split('|'),
                    opentime: arr[2].trim(),
                    opentimestamp: new Date(arr[2]).getTime(),
                };
            });
        }
    } catch (e) {
        console.error(e, 'processWithDatas.error');
    }
};
