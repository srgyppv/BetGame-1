
var app = angular.module("betApp", []);

app.config(function ($httpProvider) {
$httpProvider.defaults.headers.get = { 'X-Auth-Token' : 'aee34f9cd2604cad82a814f6afcba692' };	
});

app.controller("betCtrl",['$scope', '$http', function ($scope, $http) {
	        
			
    $scope.leagues = [{ name: "Germany", id: "394", lastFixtures: {}, nextFixtures: {}},
                      {name : "England", id: "398", lastFixtures: {}, nextFixtures: {}}, 
                      {name : "Spain", id: "399", lastFixtures: {}, nextFixtures: {}}, 
                      {name : "Italy", id: "401", lastFixtures: {}, nextFixtures: {}}];
    $scope.selectedLeague = $scope.leagues[0];
    
	    
    for (var i = 0; i < $scope.leagues.length; i++) {
        (function (i) {

	    $scope.rootUrl = "http://api.football-data.org/v1/soccerseasons/";
                              
	    $http.get($scope.rootUrl + $scope.leagues[i].id + "/leagueTable").then(function (response) {
            
            $scope.matchday = response.data.matchday;
            $scope.leagues[i].table = response.data.standing;

            $scope.lastUrl = $scope.rootUrl + $scope.leagues[i].id + "/fixtures?matchday=" + ($scope.matchday - 1);
            $scope.nextUrl = $scope.rootUrl + $scope.leagues[i].id + "/fixtures?matchday=" + $scope.matchday;

           $http.get($scope.lastUrl).then(function (response) {
	          $scope.leagues[i].lastFixtures = response.data.fixtures;
	       });

           $http.get($scope.nextUrl).then(function (response) {
	         $scope.leagues[i].nextFixtures = response.data.fixtures;
           });
           
        });
        })(i);
    };
}]);
