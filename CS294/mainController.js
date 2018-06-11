'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            when("/favorites", {
                templateUrl: "components/user-favorite/user-favoriteTemplate.html",
                controller: "UserFavoriteController"
            }).
            when("/cities", {
                templateUrl: "components/cities/citiesTemplate.html",
                controller: "CitiesController"
            }).
            when("/restaurants", {
                templateUrl: "components/restaurants/restaurantsTemplate.html",
                controller: "RestaurantsController"
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$resource', '$rootScope', '$location', '$http',
    function ($scope, $resource, $rootScope, $location, $http) {
        $scope.main = {};
        $scope.main.label = "";
        $scope.main.loggedIn = false;
        $scope.main.loginMessage = "Please Login";
        $scope.main.currView = "favorites";
        $scope.main.places ='';
        var localResource = $resource("http://localhost:3000/test/info");
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if (!$scope.main.loggedIn) {
            // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }
        });

        var selectedPhotoFile;   // Holds the last file selected by the user

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            console.log("file name changed called");
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            console.log("file name selected called");
            return !!selectedPhotoFile;
        };

        // Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.uploadPhoto = function () {
            if (!$scope.inputFileNameSelected()) {
                console.error("uploadPhoto called will no selected file");
                return;
            }
            console.log('fileSubmitted', selectedPhotoFile);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function successCallback(response){
                // The photo was successfully uploaded. XXX - Do whatever you want on success.
            }, function errorCallback(response){
                // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                console.error('ERROR uploading photo', response);
            });

        };

        localResource.get( function (info) {
          $scope.main.version = info.__v;
          console.log("INFO: " + $scope.main.response);
        });
        //$scope.FetchModel("http://localhost:3000/test/info", version);
    }]);
