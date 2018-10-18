const formatDate = require('./formatDate');

exports.getDate = function getDate(formateStyle) {
    let currentDate = new Date();
    return formateStyle ? formatDate(currentDate, formateStyle) : formatDate(currentDate, 'yyyyMMdd');
};