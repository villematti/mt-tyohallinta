theApp.controller('authController', ['$scope', 'store', '$location', '$http', '$log',
		function($scope, store, $location, $http, $log) {

	$scope.username = '';
	$scope.password = '';

	$scope.errorMessage = '';
	
	$scope.login = function() {
		var username = $scope.username;
		$http.post('/api/auth', {
			name: username,
			password: $scope.password
		})
		.success(function(result) {
			if(result.success === false) {
				$log.info(result.message);
				$scope.errorMessage = result.message;
			} else {
				store.set('token', result.token);
				store.set('userid', result.userid);
				store.set('admin', result.admin);
				store.set('username', result.username)
				$log.info(store.get('token'));
				$location.path('/');
			}
		});
	}

	$scope.$watch(function(newValue, oldValue) {
		if($location.path() === '/auth/logout') {
		store.remove('token');
		store.remove('userid');
		store.remove('username');
		store.remove('admin');
		$location.path('/auth/login');
	}
	})
}]);