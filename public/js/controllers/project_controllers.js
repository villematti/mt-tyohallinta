theApp.controller('projectController', ['$scope', '$http', '$log', '$location', '$routeParams', 'StatusService', 
	function($scope, $http, $log, $location, $routeParams, StatusService) {

	$scope.projects = [];

	$scope.searchText = '';

	$scope.getAllProjects = function() {
		if(confirm('Oletko varma? Tämä kuormittaa tietokantaa erittäin paljon.')) {
			$http.get('/api/projects')
			.success(function(result) {
				$scope.projects = result;
			})
		}
	}

	$scope.getActiveProjects = function() {
		$http.get('/api/projects/active')
		.success(function(result) {
			$scope.projects = result
		})
	}

}]);

theApp.controller('showProjectController', ['$scope', '$http', '$log', '$location', '$routeParams', 
	function($scope, $http, $log, $location, $routeParams) {

	$scope.newProjectStatus = '';
	$scope.newProjectName = '';
	$scope.newProjectCustomer = '';
	$scope.newProjectType = '';

	$scope.projectDisplayName = '';

	$scope.projectStatuses = '';
	$scope.projectTypes = '';
	$scope.customers = '';

	function getCustomers() {
		$http.get('/api/customers')
			.success(function(result) {
				$scope.customers = result;
		});
	}

	function getStatuses() {
		$http.get('/api/statuses')
			.success(function(result) {
				$scope.projectStatuses = result;
		});
	}

	function getTypes() {
		$http.get('/api/types')
			.success((result) => {
				$scope.projectTypes = result;
			})
	}

	getStatuses();
	getCustomers();
	getTypes();

	$scope.project = '';

	function getProject() {
		$http.get('/api/project/' + $routeParams.id)
			.success(function(result) {

				$scope.newProjectStatus = result.statusId._id;
				$scope.newProjectName = result.name;
				$scope.newProjectCustomer = result.customerId;
				$scope.newProjectType = result.typeId;
				$scope.projectDisplayName = result.displayName
			})
	}

	getProject();

	$scope.updateProject = function() {
		$http.put('/api/update-project-with-id/' + $routeParams.id, {
			_id: $routeParams,
			name: $scope.newProjectName,
			statusId: $scope.newProjectStatus,
			typeId: $scope.newProjectType,
			customerId: $scope.newProjectCustomer
		})
		.success(function(result) {
			$log.info(result);
			$location.path('/projects');
		});
	};

	$scope.createNewVersion = function() {
		$location.path('/projects/new_version/' + $routeParams.id)
	}

	$scope.cancel = function() {
		$location.path('/projects');
	}

	$scope.deleteProject = function() {
		if(confirm('Are you sure?')) {
			$http.delete('/api/project/' + $routeParams.id)
				.success(function(result) {
					if(result.success) {
						$location.path('/projects');
					} else {
						$scope.projectDeleteErrorMessage = result.message;
					}
					
			})
		}
	}


}]);

theApp.controller('createNewProjectController', ['$scope', '$http', '$log', '$location', '$routeParams', 'store', 
	function($scope, $http, $log, $location, $routeParams, store) {

	var settings = store.get('settings');

	$scope.creationErrorMessage = '';
	$scope.projectStatuses = '';
	$scope.projectTypes = '';
	$scope.customers = '';

	function getCustomers() {
		$http.get('/api/customers')
			.success(function(result) {
				$scope.customers = result;
		});
	}

	function getStatuses() {
		$http.get('/api/statuses')
			.success(function(result) {
				$scope.projectStatuses = result;
		});
	}

	function getTypes() {
		$http.get('/api/types')
			.success((result) => {
				$scope.projectTypes = result;
			})
	}

	getStatuses();
	getCustomers();
	getTypes();

	$scope.newProjectStatus = '';
	$scope.newProjectName = '';
	$scope.newProjectCustomer = '';
	$scope.newProjectType = '';
	$scope.newProjectVersion = '';

	$scope.createNewProject = function() {
		// old api: '/api/projects'
		$http.post('/api/create-new-project', {
			name: $scope.newProjectName,
			statusId: $scope.newProjectStatus,
			customerId: $scope.newProjectCustomer,
			type: $scope.newProjectType,
			version: $scope.newProjectVersion,
			year: settings.year
		})
		.success(function(result) {
			if(result.success === false) {
				$scope.creationErrorMessage = result.message;
			} else {
				$location.path('/projects');
			}
		});
	}

}]);

theApp.controller('newVersionProjectController', ['$scope', '$http', '$log', '$location', '$routeParams', 'store', 
	function($scope, $http, $log, $location, $routeParams, store) {

	$scope.creationErrorMessage = '';

	$scope.newProjectName = '';
	$scope.newProjectVersion = '';
	$scope.oldProjectVersion = '';

	$scope.projectDisplayName = '';

	$scope.project = '';

	function getProject() {
		$http.get('/api/project/' + $routeParams.id)
			.success(function(result) {
				$scope.newProjectName = result.name;
				$scope.newProjectVersion = result.version;
				$scope.oldProjectVersion = result.version;
				$scope.projectDisplayName = result.displayName
			})
	}

	getProject();

	$scope.createNewProjectVersion = function() {
		if ($scope.newProjectVersion !== '' && $scope.newProjectVersion !== '00' && $scope.newProjectVersion !== $scope.oldProjectVersion) {

			$scope.creationErrorMessage = '';

			$http.post('/api/create-new-project-version', {
				name: $scope.newProjectName,
				version: $scope.newProjectVersion,
				parentProjectId: $routeParams.id
			})
			.success(function(result) {
				if (result.success === false) {
					$scope.creationErrorMessage = result.message;
				} else {
					$scope.creationErrorMessage = '';
					$location.path('/projects');
				}
			})
		} else {
			$scope.creationErrorMessage = 'Aseta uusi projektinumero!';
		}
		
	}
}]);