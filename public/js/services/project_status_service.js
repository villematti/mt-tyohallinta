theApp.service('StatusService', function($http, $log) {
	var statusServiceVar = {};

	statusServiceVar.getProjectStatusName = function(statusId) {

		var currentStatusName = '';
		$log.info(statusId);

		$http.get('/api/status/' + statusId)
			.success(function(result) {
				$log.info(result);
				return result.name;
			})

		return false;
	};

	return statusServiceVar;
})