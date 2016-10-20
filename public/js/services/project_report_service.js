theApp.service('projectReport', ['$http', function($http) {
	return {
		endOfMonth: function() {
			var promise = $http.get('/api/report-from-active-projects')
				.then(function(results) {
					return results.data;
				})
			return promise;
		}
	}
}])