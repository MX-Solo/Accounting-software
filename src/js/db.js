let knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./data.sqlite"
    },
    useNullAsDefault : true
});

module.exports = knex;