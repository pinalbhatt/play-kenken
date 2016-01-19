(function() {
    'use strict';

    angular
        .module('kenApp', ['ui.bootstrap'])
        .factory('APIService', APIService)
        .controller("kenController", kenController);

    APIService.$inject = ['$http', '$q'];
    function APIService($http, $q){

        var baseUrl = "http://rsvc.pbdesk.io/roken/custom/";

        var service = {
            get: _get
        };

        return service;



        function _makeHttpCall(options){
            /*options = {
             method: "",
             data: "",
             url: ""
             }*/
            var deferred = $q.defer();
            var apiUrl = baseUrl +  options.url;

            var req = {
                method: options.method,
                url: apiUrl,
                headers: {
                    "Content-Type": "application/json"
                }
            }
            if(options.data !== undefined){
                req.data = options.data;
            }

            $http(req)
                .then(function(response){
                        deferred.resolve(response);
                    },
                    function(error){
                        deferred.reject(error);
                    });
            return deferred.promise;
        }

        function _get(partialUrl){

            var options = {
                method: "GET",
                url: partialUrl
            }
            var deferred = $q.defer();
            _makeHttpCall(options)
                .then(function(response){
                        if (response.status === 200) {
                            deferred.resolve(response);
                        }
                        else{
                            deferred.reject(response);
                        }
                    },
                    function(error){
                        deferred.reject(error);
                    });
            return deferred.promise;
        }


    }


    kenController.$inject = ["APIService", "$q"];
    function kenController(APIService){
        var self = this;

        self.currentPosition = 0;
        self.currentAnswerBox = "";

        self.sizeOptions = [
            {value: 3, label: "3 x 3"}, {value: 4, label: "4 x 4"}, {value: 5, label: "5 x 5"},
            {value: 6, label: "6 x 6"}, {value: 7, label: "7 x 7"}, {value: 8, label: "8 x 8"},
            {value: 9, label: "9 x 9"}
        ];

        self.operatorsOptions =  [
            {value: 1, label: " + "}, {value: 2, label: " + - "},
            {value: 3, label: " + - x "}, {value: 4, label: " + - x / "}
        ];

        self.levelOptions = [
            {value: 1, label: "Beginners"}, {value: 2, label: "Easy"},
            {value: 3, label: "Medium"}, {value: 4, label: "Hard"},{value: 5, label: "Prodigy"}
        ];

        self.input = {
           size: '4',
            ops: '2',
            level: '2'
        }

        self.viewBoard = {};





        function getCustomKenken(){
            return APIService.get(self.input.size + "/" + self.input.ops + "/" + self.input.level);
        }

        self.checkboxSelection = 2;


        self.check = function(){
            console.log(self.answers);
        }
        self.PlayClicked = function(b){
            //self.input.size = b;
            //alert("size: " + self.input.size + " ops: " + self.input.ops + " level: " + self.input.level);
            getCustomKenken().then(function(success){
                self.game = success.data;
                self.viewBoard = success.data.viewBoard;
                self.inputButtons = [];
                self.answers = new Array(self.viewBoard.length);
                for(var i = 1; i<= self.viewBoard.length; i++){
                    self.inputButtons.push(i);
                    self.answers[i-1] = new Array(self.viewBoard.length);
                }
                console.log(self.answers.length);

            }, function(error){
                alert(error);
            });

        }

        self.isNumber = function($event){
            $event = ($event) ? $event : window.event;
            var charCode = ($event.which) ? $event.which : $event.keyCode;
            if (charCode > 31 && (charCode < 49 || charCode > 57 - (9-self.input.size))) {
                $event.preventDefault();
            }
        }

        self.selectCell = function(pos){
            var id = "answerTxt" + pos;
            document.getElementById(id).focus();
        }

        self.selectAnswerBox =function(pos){
            self.currentAnswerBox  = "answerTxt" + pos;
            self.currentPosition = pos;
        }

        self.inputButtonClicked = function(val){
            document.getElementById(self.currentAnswerBox).value = val;
            document.getElementById("btnCheckAnswer").focus();


        }

        self.changeAnswerBox = function(){
            console.log(validateGrid());
        }

        self.globalClick = function($event){
            if($event.target.id){
                if($event.target.id.indexOf("answer") !== 0 ){
                    self.currentPosition = 0;
                }
            }
            else {
                self.currentPosition = 0;
                self.currentAnswerBox = "";
            }

        }

        function isGridComplete(){
            var size = self.answers.length;
            for(var r=0; r<size; r++) {
                for (var c=0; c<size; c++) {
                    if (typeof (self.answers[r][c]) === "undefined") {
                        return false;
                    }
                    else if (self.answers[r][c] < 1 || self.answers[r][c] > self.answers.length) {
                        return false;
                    }
                }
            }
            return true;
        }

        function validateGrid(){
            if(isGridComplete()){
                var validLatinSquare = isValidLatinSquare(self.answers);
                if(validLatinSquare === ""){
                    var invalidCages = validateCages();
                    if(invalidCages.length > 0){
                        return "Some cages are invalid";
                    }
                }
                else {
                    return "Some value(s) are not unique accross row or column."
                }
                return "";
            }
        }

        function  validateCages(){
            var invalidCages = [];
            for(var cageCoutner = 0; cageCoutner < self.game.cages.length; cageCoutner++){
                var cage = self.game.cages[cageCoutner];
                var valueArr = [];
                for(var i in cage.cells){
                    valueArr.push(parseInt(self.answers[cage.cells[i].row][cage.cells[i].col]));
                }
                var calcualtedValue = doCageOpOnValues(cage.op, valueArr);
                if(calcualtedValue !== cage.value){
                    invalidCages.push(cage);
                }

            }
            return invalidCages;

        }
        function isValidLatinSquare(lSquare){
            var size = lSquare.length;
            for(var r = 0; r < size; r++){
                for(var c = 0; c < size; c++){
                    var item = lSquare[r][c];
                    for(var r1 = 0; r1< size; r1++){
                        if(r !== r1 && lSquare[r1][c] === lSquare[r][c])   {
                            return item + " repeated in column " + c;
                        }
                    }
                    for(var c1 = 0; c1< size; c1++){
                        if(c !== c1 && lSquare[r][c1] === lSquare[r][c])   {
                            return item + " repeated in row " + r;
                        }

                    }

                }
            }
            return "";
        }

        function doCageOpOnValues(op, valueArr){
            var i, result;
            valueArr.sort();
            valueArr.reverse();
            switch(op){
                case "A":{
                    result = 0;
                    for(i = 0; i< valueArr.length; i++){
                        result += valueArr[i];
                    }
                    break;
                }
                case "S":{
                    result = valueArr[0];
                    for(i = 1; i< valueArr.length; i++){
                        result -= valueArr[i];
                    }
                    break;
                }
                case "M":{
                    result = 1;
                    for(i = 0; i< valueArr.length; i++){
                        result *= valueArr[i];
                    }
                    break;
                }
                case "D":{
                    result = valueArr[0];
                    for(i = 1; i< valueArr.length; i++){
                        result /= valueArr[i];
                    }
                    break;
                }
                case "N":{
                    result = valueArr[0];
                    break;
                }
            }
            return result;
        }

    }



})();
