/*
	The code implementing the mdDialog is taken from the Angular
	website.
*/

'use strict';

cs142App.controller('ChatController', ['$scope', '$routeParams', '$resource', '$mdDialog',
	function ($scope, $routeParams, $resource, $mdDialog) {
		var userId = $routeParams.userId;
		$scope.response='placeholder';
    $scope.input = '';
		$scope.main.label = "Favorites View";
	    var localResource = $resource("http://localhost:3000/favoriteSecond");
	    localResource.query({}, function(favs) {
	    	$scope.userFavs = favs;
	    });
          $scope.$watch("response", {
      function() {
        console.log("response updated");
      }
    });
	$.ajaxSetup({
		async: true
	});

	//$scope.getResponse = function() {
    /*$.getJSON('http://127.0.0.1:5000/chat/' + "Where was I on tuesday?",
    function(data, textStatus, jqXHR) {
  		$scope.response = data;
  		console.log("DATA: " + JSON.stringify(data));
  		//console.log("DATA: " + data);
    });*/

    $scope.getResponse = function() {
      $.ajax('http://127.0.0.1:5000/chat/' + $scope.input, {
        dataType: "JSON",
        success: function (response, statusTExt, XHR) {
          console.log("IN CALLBACK FUNCTION: " + response);
          $scope.response = response;
        },
        error: function(response, statusText, XHR) {
          console.log("ERROR!! " + JSON.stringify(response) + JSON.stringify(statusText));
        }
      });
    }


  //};
  //console.log("response: " + $scope.response);
}]);


/*
function showDialog($event) {
       var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: $event,
         template:
           '<md-dialog aria-label="List dialog">' +
           '  <md-dialog-content>'+
           '    <md-list>'+
           '      <md-list-item ng-repeat="item in items">'+
           '       <p>Number {{item}}</p>' +
           '      '+
           '    </md-list-item></md-list>'+
           '  </md-dialog-content>' +
           '  <md-dialog-actions>' +
           '    <md-button ng-click="closeDialog()" class="md-primary">' +
           '      Close Dialog' +
           '    </md-button>' +
           '  </md-dialog-actions>' +
           '</md-dialog>',
         locals: {
           items: $scope.items
         },
         controller: DialogController
      });
      function DialogController($scope, $mdDialog, items) {
        $scope.items = items;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
      }
    }
  }
})(angular);/
*/