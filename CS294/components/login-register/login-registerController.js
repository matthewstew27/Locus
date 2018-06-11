'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$location', '$resource',
  function ($scope, $location, $resource) {
    $scope.main.login_name = '';
    $scope.main.password='';
    $scope.main.passwordOne = '';
    $scope.main.passwordTwo = '';
    $scope.main.loginNew = '';
    $scope.main.first_name = '';
    $scope.main.last_name = '';
    $scope.main.location = '';
    $scope.main.description = '';
    $scope.main.occupation = '';
    $scope.main.registrationMessage = '';

    var localResourceLogin = $resource("http://localhost:3000/admin/login");
    $scope.login = function() {
        console.log("trying to log in");
        localResourceLogin.save({login_name: $scope.main.login_name, password: $scope.main.password}, function (response) {
                $scope.main.loggedIn = true;
                $scope.main.userFirstName = response.first_name;
                $location.path("/favorites");
                console.log("USER ID" + response._id);
                console.log("logged in successfully");
        }, function (err) {
            if (err) {
                console.log("login_name:" + $scope.main.login_name);
                $scope.main.loggedIn = false;
                $scope.main.loginMessage = "Login failed, please try again";
                console.log("log in failed");
            }
        });
    };
    $scope.logout = function() {
        console.log("Trying to logout");
        var localResourceLogout = $resource("http://localhost:3000/admin/logout");
        localResourceLogout.save({}, function(response) {
            $scope.main.loggedIn = false;
            console.log("logged out");
            $scope.main.label = "";

        }, function (err) {
            console.log("error logging out");
        });
    };

    $scope.register = function() {
        if ($scope.main.passwordTwo !== $scope.main.passwordOne) {
            $scope.main.registrationMessage = 'Passwords do not match, please try again';
            console.log("Passwords did not match");
            return;
        }
        if ($scope.main.first_name.length === 0 || $scope.main.last_name.length === 0 || $scope.main.passwordOne.length === 0 ) {
            $scope.main.registrationMessage = "Please fill out your name and password";
        }
        var registerResource = $resource("http://localhost:3000/user");
        var data = {first_name: $scope.main.first_name,
            last_name: $scope.main.last_name,
            location: $scope.main.location,
            description: $scope.main.description,
            occupation: $scope.main.occupation, login_name: $scope.main.loginNew,
            password: $scope.main.passwordOne
        };
        registerResource.save(data, function() {
            console.log('registered new user');
            $scope.main.registrationMessage = 'Successfully registered new user!';
            document.getElementById('usernameInput').value='';
            document.getElementById('passwordInput').value='';
            document.getElementById('retypePasswordInput').value='';
            document.getElementById('firstnameInput').value='';
            document.getElementById('lastnameInput').value='';
            document.getElementById('occupationInput').value='';
            document.getElementById('descriptionInput').value='';
            document.getElementById('locationInput').value='';
        }, function(err) {
            console.log("failed to register");
        });
    };
  }]);
