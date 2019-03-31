  const DATASIZE = 20;
  const INCR = 1;
  var rfData = [];
  var rfChart;
  var timerId = 0;

  var globalStationID;

  var mymap = L.map('station_map').setView([24.319058, 29.497109],3);
  L.tileLayer('https://api.mapbox.com/styles/v1/williammoehligap/cjr7sj0xl0t752sldpvyenv8m/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: 'pk.eyJ1Ijoid2lsbGlhbW1vZWhsaWdhcCIsImEiOiJjanI3c2c0bjMwOHAyNDJtcDdwZ2Z5ZWVqIn0.KUeqIhrbW8qMxFd1c0lMsA'
  }).addTo(mymap);

  let stationData = $.getJSON('stations.json', function(data) {
    $(data).each(function(){
      mark(this);
    });
  });

  function loadGraph(){

    var ctx = $("#rfGraph");
    rfChart = new Chart(ctx, {
        type: 'line',
        data: {

            labels: rfData.map(function (a) { return a.x; }),
            datasets: [{
                data: rfData.map(function (b) { return b.y; }),
                label: "Rainfall",
                borderColor: "#3e95cd",
                fill: true
            }]
        },
        options: {
            title: {
                display: true,
                text: ''
            },
            backgroundColor:'rgb(10,10,10)',
            animation: 0
        }
    });
  }

  loadGraph();


  function mark(item){
      let customMarker = L.Marker.extend({
          options: {
              stationID: '',
              name: '',
              country: ''
          }
      });
    var marker = new customMarker([item.latitude, item.longitude], {
        stationID: item.stn,
        name: item.name,
        country: item.country
    }).addTo(mymap);
    marker.bindPopup("<b>"+item.name+", "+item.country+"</b><br>");

  }

  mymap.on('popupopen', function(e) {
      if (rfData.length <= 1) {
          for (let i = 0; i <= DATASIZE; i++) {
              rfData = new Array(DATASIZE);
          }
      }
      else {
          for (let i = 0; i <= DATASIZE; i++) {
              removeData(rfChart);
          }
      }

      rfChart.options.title.text = "Real-time rainfall in " + e.popup._source.options.name + ", " +  e.popup._source.options.country;
      let date = new Date(new Date() - 1000*60*60);
      let dateApi = new Date(date - DATASIZE * 60000);



      callAPI(e.popup._source.options.stationID, dateApi);
      globalStationID = e.popup._source.options.stationID;


      $("#divDateTime").show();

      const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

      document.getElementById("txtDateTime").value  = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + date.getHours() + ":" + date.getMinutes();

      updateChart(rfChart,true, e.popup._source.options.stationID);
  });

  //event fires when popup closes
  mymap.on('popupclose', function(e) {
      $("#rfGraph").empty();
      $("#rfGraph").hide();
      $("#divDateTime").hide();
      updateChart(rfChart, false);
  });

  function changedDate() {
    updateChart(rfChart, false);
	  for (let i = 0; i <= DATASIZE; i++) {
              removeData(rfChart);
    }

	  console.log(Number(document.getElementById('txtDateTime').value));
	  let date = new Date(document.getElementById('txtDateTime').value);
	  date = new Date(date - DATASIZE * 60000);
	  console.log(date);
	  //callAPI(mymap.options.stationID, date);
    callAPI(globalStationID, date);
	  updateChart(rfChart,true, mymap.options.stationID);
  }

  function callAPI(station, datetime, bUpdate = false) {
      let type = "multiple";
      let token = "TEMP_token_001!";
      let datatype = "prcp"; // precipitation
      let count = DATASIZE;

      let form = new FormData();
      form.append("type", type);
      form.append("count", count);
      form.append("station", station);
      form.append("datetime", formatDateTime(datetime));
      form.append("datatype", datatype);

      let request = new XMLHttpRequest();
      //request.timeout = 2000;
      request.onreadystatechange = function(e) {
          if (request.readyState === 4) {
              if (request.status === 200) {
                  let pres = JSON.parse(request.response);
                  console.log(pres);
                  let res = pres.value;
                  if(bUpdate){
                    addToDataSet(res,datetime, bUpdate);
                  }
                  else
                  {
                    addToDataSet(res, datetime);
                  }

              } else {
                  console.log("An error has occured: " + request.response);
              }
          }
      };
      request.ontimeout = function () {
          console.log('Timeout');
      };
      request.open("POST", "api/getdata.php", true);
      request.setRequestHeader("token", token);
      request.send(form);
  }

  function formatDateTime(datetime) {
      let str = "";
      str += datetime.getFullYear();
      let months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
      str += months[datetime.getMonth()];

      if(datetime.getDate() < 10){
        str += '0'+ datetime.getDate();
      }
      else{
        str += datetime.getDate();
      }

      if(datetime.getHours() < 10){
        str += '0'+ datetime.getHours();
      }
      else{
        str += datetime.getHours();
      }

      if(datetime.getMinutes() < 10){
        str += '0'+ datetime.getMinutes();
      }
      else{
        str += datetime.getMinutes();
      }

      if(datetime.getSeconds() < 10){
        str += '0'+ datetime.getSeconds();
      }
      else{
        str += datetime.getSeconds();
      }

      return str;
  }

  function addToDataSet(res, datetime, bUpdate = false) {
    let arrayPoints = [];

    if(bUpdate == false){
       jQuery.each(res, function(index, point){
        let dataPoint = {
            x: point.x,
            y: point.y
        }

        arrayPoints.push(dataPoint);
      });

      arrayPoints.sort(function(a, b){
          a.hour = a.x.split(':')[0];
          a.minute = a.x.split(':')[1];

          b.hour = b.x.split(':')[0];
          b.minute = b.x.split(':')[1];

          if (a.hour < b.hour) return -1;
          if (a.hour > b.hour) return 1;

          if (a.minute < b.minute) return -1;
          if (a.minute > b.minute) return 1;

          return 0;
        });

      jQuery.each(arrayPoints, function(index, point){
        addData(rfChart, point.x, point.y);
      });

      $("#rfGraph").show();
    }
    else{
      addData(rfChart,res[res.length -1].x, res[res.length -1].y);
    }
  }

  function addData(chart, label, data) {
    chart.data.labels.push(label);
    jQuery.each(chart.data.datasets, function(index, dataset){
        dataset.data.push(data);
        chart.data.valuesCount++;
    });

    chart.update();
  }

  //chart gets updated every minute
  function updateChart(chart,on = true, stn = 0){
    if(on === false && timerId != 0){
      clearInterval(timerId);
      timerId = 0;
    }
    else
    {
      timerId = setInterval(function() {

      removeLastPoint(chart);

      if(stn !== 0){

          let date = new Date(new Date() - 1000*60*60);
          date = new Date(date.getTime() - DATASIZE  *60000);
          callAPI(stn, date, true);
        }
      }, 60 * 1000);
    }
  }

  function removeLastPoint(chart){
    chart.data.labels.shift();

    jQuery.each(chart.data.datasets, function(index, dataset){
        dataset.data.shift();
    });

    chart.update();
  }


  function removeData(chart) {
    chart.data.labels.pop();
    jQuery.each(chart.data.datasets, function(index, dataset){
        dataset.data.pop();
    });

    chart.update();
  }

  $.createElement = function(name)
  {
      return $('<'+name+' />');
  };

  $.fn.appendNewElement = function(name)
  {
      this.each(function(i)
      {
          $(this).append('<'+name+' />');
      });
      return this;
  };

  $(function() {
      $("#export").click(function() {

              var $root = $('<XMLDocument />');

              $root.append(
                  $('<RainfallData />').appendNewElement('DataSets')
              );

              var $dataSets = $root.find('RainfallData>DataSets');
            let labels = rfChart.data.labels;
          console.log(labels);
          jQuery.each(rfChart.data.datasets, function(index, dataset){
              if (dataset.data == null) {
                  alert("dataset is empty");
              }
                  var $newSet = $.createElement('Data');


                  for (let i = 0; i <= dataset.data.length; i++) {
                  var $newPoint = $.createElement('DataPoint');
                  $newPoint.append($.createElement('x').text(labels[i]));
                  $newPoint.append($.createElement('y').text(dataset.data[i]));
                  $newSet.append($newPoint);
                  }
                  $dataSets.append($newSet);

                  }
                  );

              download( "export.xml", $root.html().toString());
          }

      )
  });

  function download(filename, text){
      console.log(filename);
      console.log(text);
      var blob = new Blob([text], {type: "application/xml;charset=utf-8"});
      saveAs(blob, filename+".txt");

  }