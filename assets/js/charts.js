
function initChart(labelArray, pesoArray){
    // Initialize the Chart Element on HTML
      var ctx = document.getElementById("pesoChart").getContext("2d");

      // Set the configuration of the Chart elements.
      // This is where we pass the data we captured from firebase to the chart label and data


      var config = {
  			type: 'line',
  			data: {
  				labels: labelArray,
  				datasets: [{
  					label: 'Peso',
                      fillColor: "#79D1CF",
                      strokeColor: "#79D1CF",
  					//data: pesoArray,
  					data: pesoArray,
  					fill: true,
  				}]
  			},
  			options: {
  				responsive: true,
  				title: {
  					display: true,
  					text: 'Histórico de Peso'
  				},
  				tooltips: {
  					mode: 'index',
  					intersect: false,
  				},
  				hover: {
  					mode: 'nearest',
  					intersect: true
  				},
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    }
                },
  				scales: {
  					xAxes: [{
  						display: true,
  						scaleLabel: {
  							display: true,
  							labelString: 'Data/Hora'
  						}
  					}],
  					yAxes: [{
  						display: true,
  						scaleLabel: {
  							display: true,
  							labelString: 'Peso'
  						},
  						ticks: {
  							min: 0,
  							max: 20,

  							// forces step size to be 5 units
  							stepSize: 2
  						}
  					}]
  				}
  			}
  		};

      // Create new  chart element context with refrence to the HTML element
      pesoChart = new Chart(ctx, config);
}

$(document).ready(function () {
    // initialize Global variables
    var dataArr = [];
    var newDataArray = [];
    var labelArray = [];
    var pesoArray = [];
    var previousVal = '';
    var compareVal ='';
    var chartCount ;
    var currentPeso='';
    var ref = firebase.database().ref().child('Transporte/Carga/1');



    ref.on('child_added', function(snapshot) {
        snapshot.forEach(function(childSnapshot){
            var timestamp = snapshot.key;
            var peso = childSnapshot.val();

            console.log(timestamp);

            var d = new Date(timestamp*1000);
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

            addData(pesoChart, datestring, peso);
            pesoChart.update();

            $('#varPesoAtual').val(peso);

            if( (pesoInicial < 0.8*peso || pesoInicial > 1.2*peso))
               ligarAlarme();
        });
    });


    ref.on('child_removed', function(snapshot) {
        snapshot.forEach(function(childSnapshot){
            if(typeof pesoChart !== 'undefined')
                removeData(pesoChart);
        });

        //pesoChart.update();
    });


    // Get data function reads the firebase database. Order the data by Child of key foodAndDrinks
    // It then traverses each value in the firebase and
    // for each record compares if the current value and previous value are same cuisine increments by 1
    // until all records of that type are counted.

    // If the search did not include a search for Restaurant or Cuisine then it ignores that record and resets
    // counter to 1. If the values current and previous values do not match.
    // We set add the 'label and 'value' into an array and set the previousVal to current value of cuisine.

    function getData() {

        ref.once("value", function (snapshot) {
            snapshot.forEach(function(childSnapshot) {
            var obj = childSnapshot.val();
            var timestamp = childSnapshot.key;
            var peso = Object.values(obj);


            for ( var pesoValor in peso ){
                pesoArray.push( peso[ pesoValor ] );
                peso = peso[ pesoValor ];
                console.log(peso);
            }

            currentPeso=obj.key;
            if (currentPeso === previousVal && typeof obj !=='undefined') {
                chartCount++;
                //currentPeso=obj.foodAndDrinks;
            }
            else if(typeof obj ==='undefined' || obj === ''){
                console.log(chartCount, obj.label);
                chartCount=0;
            }
            else if (currentPeso !== previousVal && typeof obj !=='undefined'  || obj !== ' ' || obj !== "null") {
                chartCount++;
                var d = new Date(timestamp*1000);
                var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

                dataArr = ({
                    label: datestring,
                    value: peso,
                });

                //newDataArray.push(dataArr);

                labelArray.push(datestring);

                console.log(peso);


                chartCount = 0;
                previousVal = peso;
            }
           pesoChart.update();
        });
    });

    initChart(labelArray, pesoArray);

    }

    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };



    // Put data into the dataset for the chart and update the chart
    function addData(chart, label, data) {
        chart.data.labels.push(label);
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });
        chart.update();
    }

    function removeData(chart) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
        chart.update();
    }
    // Call the function which initiates the chart setup
    getData();
});
