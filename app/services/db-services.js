// service to DB storage
octoblogServices.factory('dataService',['$q',function($q){

	var localStorage = {};

	var Datastore = require('nedb');
	var db = {};
  db.users = new Datastore({ filename: 'db/users.db', autoload: true });

	return {

		storeToken : function(user,token){
			var deferred = $q.defer();
			if(user && token){
				localStorage[user] = token;
				db.users.update(
					{ user: user },
					{ user: user, token: token },
					{ upsert: true },
					function (err, numReplaced, upsert) {
						if(err){
							deferred.reject('error!',err);
						} else {
							userCommitsDb = user + 'Commits';
							userEventsDb = user + 'Events';
							userReposDb = user + 'Repos';

							userCommitsPath = 'db/' + userCommitsDb + '.db';
							userEventsPath = 'db/' + userEventsDb + '.db';
							userReposPath = 'db/' + userReposDb + '.db';

							db[userCommitsDb] = new Datastore({ filename: userCommitsPath, autoload: true });
							db[userEventsDb] = new Datastore({ filename: userEventsPath, autoload: true });
							db[userReposDb] = new Datastore({ filename: userReposPath, autoload: true });

							deferred.resolve(localStorage);
						}
					});
			} else {
				deferred.reject('error!');
			}
			return deferred.promise;
		},

		getToken : function(user){
			var deferred = $q.defer();
			db.user.find({ user: user }).sort({user : 1}).exec(function (err, docs) {
				if(err){
					deferred.reject('Error geting token',err);
				} else {
					console.log('what is comming?',docs);
					deferred.resolve(docs);
				}
			});
			return deferred.promise;
		},

		getRepos : function(user){
			var deferred = $q.defer();
			userReposDb = user + 'Repos';
			console.log('db',db);
			db[userReposDb].find({}).sort({name : 1}).exec(function (err, docs) {
				if (err) {
					deferred.reject('err');
				} else {
					console.log('repos from db',docs);
					deferred.resolve(docs);
				}
			});
			return deferred.promise;
		},

		storeRepos : function(user,repos){
			var deferred = $q.defer();
			userReposDb = user + 'Repos';
			console.log('repos comming',repos);
			db[userReposDb].insert(repos,function(err, newDocs){
				console.log('newDocs',newDocs);
				console.log('err',err);
				if(err){
					deferred.reject(err)
				} else {
					deferred.resolve(newDocs);
				}
			});
			return deferred.promise;
		},

		storeCommits : function(user,commits){
			var deferred = $q.defer();
			userCommitsDb = user + 'Commits';
			db[userCommitsDb].insert(commits,function(err, newDocs){
				if(err){
					deferred.reject(err)
				} else {
					deferred.resolve(newDocs);
				}
			});
			return deferred.promise;
		},

		getCommits : function(user,repo){
			var deferred = $q.defer();
			userCommitsDb = user + 'Commits';
			db[userCommitsDb].find({ 'repo.name': repo }).sort({date : -1}).exec(function (err, docs) {
				if (err) {
					deferred.reject(err);
				} else {
					deferred.resolve(docs);
				};
			});
			return deferred.promise;
		}
	};
}]);
