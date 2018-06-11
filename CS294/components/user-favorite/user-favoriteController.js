/*
	The code implementing the mdDialog is taken from the Angular
	website.
*/

'use strict';

cs142App.controller('UserFavoriteController', ['$scope', '$routeParams', '$resource', '$mdDialog',
	function ($scope, $routeParams, $resource, $mdDialog) {
		var userId = $routeParams.userId;
		$scope.places ='';
		$scope.main.label = "Favorites View";
	$.ajaxSetup({
		async: false
	});
	$.getJSON('http://127.0.0.1:5000/favs/6/',
    function(data, textStatus, jqXHR) {
		$scope.places = data;
		console.log("Data inside func: " + JSON.stringify(data));
		for (var i = 0; i < data.length; i ++) {
			var index = data[i][0].indexOf("CA");
			//console.log($scope.places[i][0]);
			$scope.places[i][0] = data[i][0].substring(0, index +2);
		}

    });
	console.log("Data: " + JSON.stringify($scope.places));
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