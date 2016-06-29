theApp.controller('settingsController', ['$scope', '$http', '$log',
	function($scope, $http, $log) {

	// STATUS VARIABLES AND METHODS

	function getStatuses() {
		$http.get('/api/statuses')
		.success(function(result) {
			$scope.statuses = result;
		})
	}

	getStatuses();
	$scope.settingsMessage = '';
	$scope.newStatusName = '';
	$scope.statuses = [];

	$scope.createNewStatus = function() {
		$http.post('/api/statuses', {
			name: $scope.newStatusName
		})
		.success(function(result) {
			if(result.success === "Failure") {
				$scope.settingsMessage = result.message;
			} else {
				$scope.settingsMessage = result.message;
				$scope.newStatusName = '';
				getStatuses();
			}
		})
		.error(function(data, code) {
			$log.error(data);
		});
	}

	$scope.deleteStatus = function(statusId) {
		$http.delete('/api/statuses/' + statusId)
		.success(function(result){
			$scope.settingsMessage = '';
			if(result.success === false) {
				$scope.settingsMessage = result.message;
			} else {
				$scope.settingsMessage = result.message;
				getStatuses();
			}
		});
	}

	// TYPE VAIABLES AND METHODS

	function getTypes() {
		$http.get('/api/types')
		.success(function(result) {
			$scope.types = result;
		})
	}

	getTypes();
	$scope.newTypeName = '';
	$scope.types = [];

	$scope.createNewType = function() {
		$http.post('/api/types', {
			name: $scope.newTypeName
		})
		.success(function(result) {
			if(result.success === "Failure") {
				$scope.settingsMessage = result.message;
			} else {
				$scope.settingsMessage = result.message;
				$scope.newTypeName = '';
				getTypes();
			}
		})
		.error(function(data, code) {
			$log.error(data);
		});
	}

	$scope.deleteType = function(typeId) {
		$http.delete('/api/types/' + typeId)
			.success(function(result){
				$scope.settingsMessage = '';
				if(result.success === false) {
					$scope.settingsMessage = result.message;
				} else {
					$scope.settingsMessage = result.message;
					getTypes();
				}
			});
	}

}]);