var dbConfig={
	client:'mysql',
    connection:{
	 host:'localhost',
	 user:'root',
	 password:'kambaa',
	 database:'sampleTask',
	 charset:'utf8'
  }
};
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
var DB=bookshelf;
module.exports.DB = DB;