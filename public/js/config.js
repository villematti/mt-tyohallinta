theApp.config(function($routeProvider, $httpProvider, paginationTemplateProvider) {

	paginationTemplateProvider.setPath('assets/js/directives/dirpagination/dirPagination.tpl.html');

	$routeProvider

		.when('/dashboard', {
			templateUrl: 'assets/pages/dashboard.html',
			controller: 'dashboardController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/auth/login', {
			templateUrl: 'assets/pages/auth/login.html',
			controller: 'authController'
		})

		.when('/auth/logout', {
			templateUrl: 'assets/pages/auth/login.html',
			controller: 'authController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/users/create', {
			templateUrl: 'assets/pages/users/create_user.html',
			controller: 'userController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/users/:id/edit', {
			templateUrl: 'assets/pages/users/edit_user.html',
			controller: 'editUserController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/users/:id', {
			templateUrl: 'assets/pages/users/show_user.html',
			controller: 'showUserController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/users', {
			templateUrl: 'assets/pages/users/index_users.html',
			controller: 'userController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/customers/create', {
			templateUrl: 'assets/pages/customers/create_customer.html',
			controller: 'createCustomerController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/customers/:id', {
			templateUrl: 'assets/pages/customers/show_customers.html',
			controller: 'showCustomerController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/customers', {
			templateUrl: 'assets/pages/customers/index_customers.html',
			controller: 'customerController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/settings', {
			templateUrl: 'assets/pages/settings/index_settings.html',
			controller: 'settingsController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/projects/create', {
			templateUrl: 'assets/pages/projects/create_project.html',
			controller: 'createNewProjectController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/projects/:id', {
			templateUrl: 'assets/pages/projects/show_project.html',
			controller: 'showProjectController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/projects', {
			templateUrl: 'assets/pages/projects/index_projects.html',
			controller: 'projectController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/task/:id', {
			templateUrl: 'assets/pages/tasks/show_task.html',
			controller: 'showTaskController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.when('/tasks', {
			templateUrl: 'assets/pages/tasks/index_tasks.html',
			controller: 'allTasksController',
			resolve : {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth' : function(Authenticate){
                    return Authenticate.authenticate();
                }
            }
		})

		.otherwise({
        	redirectTo: '/dashboard'
    	});

	$httpProvider.interceptors.push('httpRequestInterceptor');	
});