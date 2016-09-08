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

	$scope.taskTypes = [];
	$scope.taskTypeName = '';

	// Find all task types from the database
	function getTaskTypes() {
		$http.get('/api/tasktypes')
			.success(function(results) {
				$scope.taskTypes = results;
			});
	}

	getTaskTypes();

	// Task types
	$scope.createNewTaskType = function() {
		$http.post('/api/tasktypes', {
			name: $scope.taskTypeName
		})
		.success(function(result) {
			$scope.settingsMessage ='';
			if(result.success === false) {
				$scope.settingsMessage = result.message;
			} else {
				$scope.settingsMessage = result.message;
				$scope.taskTypeName = '';
				getTaskTypes();
			}
		})
	}

	$scope.deleteTaskType = function(taskTypeId) {
		$http.delete('/api/tasktypes/' + taskTypeId + '/delete')
			.success(function(result){
				$scope.settingsMessage = '';
				if(result.success === false) {
					$scope.settingsMessage = result.message;
				} else {
					$scope.settingsMessage = result.message;
					getTaskTypes();
				}
			});
	}


	// SETTINGS VARIABLES AND METHODS

	$scope.settings = [];

	$scope.newSettingsName = '';
	$scope.newSettingsValue = '';
	
	$scope.createNewSetting = function() {
		$http.post('/api/create-new-setting', {
			name: $scope.newSettingName,
			value: $scope.newSettingValue
		})
		.success(function(result){
			$scope.settingsMessage = '';
			if(result.success === false) {
				$scope.settingsMessage = result.message;
			} else {
				$scope.settingsMessage = result.message;
				getTaskTypes();
			}
		});
	}

	function getAllSettings() {
		$http.get('/api/get-all-settings')
			.success((result) => {
				$scope.settings = result;
			})
	}

	getAllSettings();

	$scope.deleteSetting = function(settingId) {
		$http.delete('/api/delete-setting/' + settingId)
			.success((result) => {
				if(result.success === false) {
					$scope.settingsMessage = result.message;
				} else {
					$scope.settingsMessage = result.message;
					getAllSettings();
				}
			})
	}
}]);
