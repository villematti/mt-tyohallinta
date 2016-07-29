theApp.controller('customerController', ['$scope', '$http', '$log', '$location', '$routeParams', 'StatusService', 
	function($scope, $http, $log, $location, $routeParams, StatusService) {

	$scope.customers = [];

	function getCustomers() {
		$http.get('/api/customers')
			.success(function(result) {
				$log.info(result);
				$scope.customers = result;
			})
	}

	getCustomers();
}]);

theApp.controller('showCustomerController', ['$scope', '$http', '$log', '$location', '$routeParams', 'StatusService', 
	function($scope, $http, $log, $location, $routeParams, StatusService) {

}]);

theApp.controller('createCustomerController', ['$scope', '$http', '$log', '$location', '$routeParams', 'StatusService', 
	function($scope, $http, $log, $location, $routeParams, StatusService) {

	$scope.creationErrorMessage = '';
	$scope.customerName = '';

	$scope.createNewCustomer = function() {
		$http.post('/api/customers', {name: $scope.customerName})
			.success(function(result) {
				if(result.success === "Failure") {
					$scope.creationErrorMessage = result.message;
				} else {
					$location.path('/customers');
				}
			});
	}

}]);