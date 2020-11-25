const path = require('path');

const routes = [
  {
    path: '',
    template: path.resolve(__dirname, '../templates/home.hbs')
  }
];

module.exports = {
  routes
};
