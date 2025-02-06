const { I18n } = require('i18n');

const i18n=new I18n({
  locales: ['en'],
  defaultLocale: 'en',
  directory:'./locales',
  register: global,
  api:{
    __:'t',
    __n:'tn'
  },
   missingKeyFn: function (locale, value) {
    return "No Key Found"
  },
  header: 'accept-language',
  queryParameter: 'lang'
});
module.exports=i18n;