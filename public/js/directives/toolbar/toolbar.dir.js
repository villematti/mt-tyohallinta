theApp.directive('toolbar', toolbar);

function toolbar() {
		return {
			templateUrl: '/assets/js/directives/toolbar/toolbar.tpl.html',
			controller: 'toolbarController',
			controllerAs: 'toolbar'
		};
	};

theApp.controller('toolbarController', ['$scope', '$http', 'store', '$location', '$log', 'AuthService',
	function($scope, $http, store, $location, $log, AuthService) {
	if (!AuthService.isAuthenticated) {
		if($location.path() !== '/auth/login') {
			$location.path('/auth/login');
		}
	}

	$log.info(store.get('token'));
	$scope.token = AuthService;
	$scope.username = store.get('username');

}]);