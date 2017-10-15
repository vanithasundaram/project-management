var DB = require('./db').DB;

var User = DB.Model.extend({
   tableName: 'users_table',
   idAttribute: 'userId',
});


var Project = DB.Model.extend({
   tableName: 'project_table',
   idAttribute: 'id',
});

module.exports = {
	User: User,
   	Project: Project
};
