
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
    $scope.lastFive = [];
   
    //Вытягиваем все лиги, следующий и предыдущий туры в массив  $scope.leagues
	    
    for (var i = 0; i < $scope.leagues.length; i++) {
        (function (i) {

	    $scope.rootUrl = "http://api.football-data.org/v1/soccerseasons/";
                              
	    $http.get($scope.rootUrl + $scope.leagues[i].id + "/leagueTable").then(function (response) {
            
	        $scope.leagues[i].matchday = response.data.matchday;
            $scope.leagues[i].table = response.data.standing;

            $scope.lastUrl = $scope.rootUrl + $scope.leagues[i].id + "/fixtures?matchday=" + ($scope.leagues[i].matchday - 1);
            $scope.nextUrl = $scope.rootUrl + $scope.leagues[i].id + "/fixtures?matchday=" + $scope.leagues[i].matchday;

           $http.get($scope.lastUrl).then(function (response) {
	          $scope.leagues[i].lastFixtures = response.data.fixtures;
	       });

           $http.get($scope.nextUrl).then(function (response) {
	         $scope.leagues[i].nextFixtures = response.data.fixtures;
           });
           
        });
        })(i);
    };

    // Получение последних пяти результатов команды
    $scope.teamStat = function (url) {
        var teamUrl = url + "/fixtures";
            
        
        $http.get(teamUrl).then(function (response) {

            //Получаем название команды для заголовка
            $http.get(url).then(function (response) {
                $scope.teamName = response.data.name;
            });

            var teamFixtures, last,
                j = 0;

            teamFixtures = response.data.fixtures;
            

            for (var i = 0; i < teamFixtures.length; i++) {
                if (teamFixtures[i].status == "FINISHED") {
                    last = i;
                }
            }

            for (i = last - 4; i<=last; i++){
                $scope.lastFive[j] = teamFixtures[i];
                j++;
            }

        });
                 
    };


}]);

//Выявленное заподло:
//- Названия команд на немецком, иногда со странными лишними словами и цифрами
//- Счет null-null в перенесенных матчах
//- В запросе по команде типа http://api.football-data.org/v1/teams/8/fixtures возвращаются не только матчи чемпа, но и ЛЧ => по matchday вытягивается не то что надо
//