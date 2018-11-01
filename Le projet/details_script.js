compt = 1;
function displayNav() {
	$('nav').toggle();
	if(compt%2 == 0)
		$('.bloc').css('margin-left','85px');
	else
		$('.bloc').css('margin-left','10px');

	compt++;
}

function getDataTime(sensor = "all") {
  lastDataReceived = 0

  if(isNaN(sensor)) {
    for(i = 0; i<numberOfSensor; i++) {
      if(sensorsData[i].length == 0)
        continue;

      lastDataReceived = Math.max(lastDataReceived, Date.parse(sensorsData[i][0].date))
    }
  } else {
    if(sensorsData[sensor].length > 0)
      lastDataReceived = Date.parse(sensorsData[sensor][0].date)
  }

  if(lastDataReceived == 0)
    return "Aucune donnée reçue"

  timeElapsed = new Date(Date.now() - lastDataReceived);

  str = "Dernières données reçues : "

  if(timeElapsed.getSeconds() <= 10)
    return str + "il y a quelques secondes"
  else if(timeElapsed.getSeconds() < 60)
    return str + "il y a " + timeElapsed.getSeconds() + " secondes"
  else if(timeElapsed.getMinutes() < 60)
    return str + "il y a " + timeElapsed.getMinutes() + " minutes"
  else if(timeElapsed.getHours() < 24)
    return str + "il y a " + timeElapsed.getHours() + " heures"
  else
    return str + "il y a " + timeElapsed.getDay() + " jours"
}

setValueInBlocsInterval = null;
sensorsExpanded = [true, true, true, true, true, true, true]
function setValueInBlocs() {
  if(sensorsAvg[0]) {
  $(".d").text(getDataTime());
    $(".donnée1 > p").html(
      "Moyenne : "+sensorsAvg[0].temperature.avg+" °C" +
      "<br> Minimum : "+sensorsAvg[0].temperature.min+" °C"+
      "<br> Maximum : "+sensorsAvg[0].temperature.max+" °C <br>")

    $(".donnée2 > p").html(
      "Moyenne : "+sensorsAvg[0].humidity.avg+" %" +
      "<br> Minimum : "+sensorsAvg[0].humidity.min+" %"+
      "<br> Maximum : "+sensorsAvg[0].humidity.max+" % <br>")
  }

  for(i=0; i<numberOfSensor; i++) {
		if(!sensorsData[i][0])
			continue;

    if(sensorsExpanded[i]) {
      $(".Capteur:eq("+i+") > p:eq(0)").html(
        "<b>Température : "+(sensorsData[i][0].temperature.current).toFixed(2)+" °C</b>" +
        "<br> Moyenne : "+(sensorsData[i][0].temperature.avg).toFixed(2)+" °C" +
        "<br> Minimum : "+(sensorsData[i][0].temperature.min).toFixed(2)+" °C"+
        "<br> Maximum : "+(sensorsData[i][0].temperature.max).toFixed(2)+" °C <br>")

      $(".Capteur:eq("+i+") > p:eq(1)").html(
        "<b>Humidité : "+(sensorsData[i][0].humidity.current).toFixed(2)+" %</b>" +
        "<br> Moyenne : "+(sensorsData[i][0].humidity.avg).toFixed(2)+" %" +
        "<br> Minimum : "+(sensorsData[i][0].humidity.min).toFixed(2)+" %"+
        "<br> Maximum : "+(sensorsData[i][0].humidity.max).toFixed(2)+" % <br>")

      $(".Capteur:eq("+i+") > p:eq(2)").text(getDataTime(i))
    } else {
      //console.log(sensorsExpanded[i])
      $(".Capteur:eq("+i+") > p").text(
        "Tempérture : "+(sensorsData[i][0].temperature.current).toFixed(2) + " °C - " +
        "Humidité : "+(sensorsData[i][0].humidity.current).toFixed(2) + " % "
      )
    }
  }

  if(setValueInBlocsInterval)
    clearInterval(setValueInBlocsInterval)
  setValueInBlocsInterval = setInterval(setValueInBlocs, 5000);
}

function detectErrors() {
  $("#Erreurs").hide();
  $(".Capteur:eq("+i+") > img").hide()
  $("#Erreurs").html("<h3>Erreurs</h3>")

  for(i=0; i<numberOfSensor; i++) {
		if(!sensorsData[i][0])
			continue;
			
    diff = Date.now() - sensorsData[i][0].date
    if(diff > 600000) {
      $("#Erreurs").append(
        "<div class='err'><img src='../icons/warning.png' height='60' width='60'>" +
        "<span>Le capteur n°"+(i+1)+" n'a pas envoyé de données depuis plus de 10 minutes.</span></div>"
      )

      $(".Capteur:eq("+i+") > img").attr("src", "../icons/warning.png")
      $(".Capteur:eq("+i+") > img").attr("title", "Erreur : Réception")

      $("#Erreurs").show();
      $(".Capteur:eq("+i+") > img").show();
    } else if(!sensorsData[i][0].isValid) {
      $("#Erreurs").append(
        "<div class='err'><img src='../icons/critical.png' height='60' width='60'>" +
        "<span>Le capteur n°"+(i+1)+" envoie des données incohérentes : "+sensorsData[i][0].error+".</span></div>"
      )

      $(".Capteur:eq("+i+") > img").attr("src", "../icons/critical.png")
      $(".Capteur:eq("+i+") > img").attr("title", "Erreur : Données")

      $("#Erreurs").show();
      $(".Capteur:eq("+i+") > img").show();
    }
  }

  $("#Erreurs").append("<br />")
}

function expandCollapse(sensor) {
  sensor = sensor.parentElement;
  idx = $(".Capteur").index(sensor)

  if(sensorsExpanded[idx]) {
    $(".Capteur:eq("+idx+")").attr("class", "bloc Capteur collapsed")
    $(".Capteur:eq("+idx+")").html(
      "<h3 onclick='expandCollapse(this)'> Λ Capteur n°"+(idx+1)+"</h3>"+
      "<p>"+
      "Tempérture : "+(sensorsData[idx][0].temperature.current).toFixed(2) + " °C - " +
      "Humidité : "+(sensorsData[idx][0].humidity.current).toFixed(2) + " % " +
      "</p>" +
      "<img src='../icons/critical.png' class='warning' style='display: none;'>"
    )
    sensorsExpanded[idx] = false;
  } else {
    $(".Capteur:eq("+idx+")").attr("class", "bloc Capteur")
    $(".Capteur:eq("+idx+")").html(
      "<h3 onclick='expandCollapse(this)'> V </span>Capteur n°"+(idx+1)+"</h3>"+
      "<p>"+
        "<b>Température: "+(sensorsData[idx][0].temperature.current).toFixed(2)+" °C </b>"+
        "<br> Moyenne : "+(sensorsData[idx][0].temperature.avg).toFixed(2)+" °C "+
        "<br> Minimum : "+(sensorsData[idx][0].temperature.min).toFixed(2)+" °C "+
        "<br> Maximum : "+(sensorsData[idx][0].temperature.max).toFixed(2)+" °C <br>"+
      "</p>"+
      "<p>"+
        "<b>Humidité: "+(sensorsData[idx][0].humidity.current).toFixed(2)+" % </b>"+
        "<br> Moyenne : "+(sensorsData[idx][0].humidity.avg).toFixed(2)+" % "+
        "<br> Minimum : "+(sensorsData[idx][0].humidity.min).toFixed(2)+" % "+
        "<br> Maximum : "+(sensorsData[idx][0].humidity.max).toFixed(2)+" % <br>"+
      "</p>"+
      "<img src='../icons/critical.png' width='50' height='50' class='warning' style='display: none;'>"+
      "<p>"+getDataTime(idx)+"</p>"
    )
    sensorsExpanded[idx] = true;
  }
}

function generateJSONData(minT, maxT, minH, maxH, cpt) {
  var date = new Date()
  var data = {
    "id": "D"+(cpt+1),
    "date": date,
    "temperature": {
      "avg": Math.random()*(maxT-minT)+minT,
      "min": Math.random()*(maxT-minT)+minT,
      "max": Math.random()*(maxT-minT)+minT,
      "stddev": Math.random()*30,
      "current": Math.random()*(maxT-minT)+minT
    },
    "humidity": {
      "avg": Math.random()*(maxH-minH)+minH,
      "min": Math.random()*(maxH-minH)+minH,
      "max": Math.random()*(maxH-minH)+minH,
      "stddev": Math.random()*30,
      "current": Math.random()*(maxH-minH)+minH
    }
  }

  return JSON.stringify(data)
}

generateData = true
function autoGenerateData() {
  for(j=0; j<numberOfSensor; j++) {
    data = generateJSONData(0, 50, 0, 100, j)
    if(storeData(data))
      main();
  }
}

//Global var
thermometerImg = null
hygrometerImg = null
sensorsData = []
sensorsAvg = []
numberOfSensor = 7
tempChart = null
humChart = null
function loadWebpageData() {
  thermometerImg = new Image()
  thermometerImg.src = "../icons/thermometer_empty.png"
  hygrometerImg = new Image()
  hygrometerImg.src = "../icons/hygrometer_empty.png"

  $(".warning").hide();
  $("#Erreurs").hide();

  for(i=0; i<numberOfSensor; i++)
    sensorsData.push([])

  if(generateData) {
    autoGenerateData();
    setInterval(autoGenerateData, 1000);
    return;
  }

  getDataFromDatabase(0)

  ws = new WebSocket('ws://51.38.239.114:8080');
  ws.onopen = function () {console.log('Connected to the broker');};
  ws.onmessage = function (evt) {
    if(storeData(evt.data))
      main();
  };
  ws.onclose = function () {console.log('Socket closed');};
}

function main() {
  if(sensorsAvg.length > 50)
    sensorsAvg.pop()

  setValueInBlocs();
  detectErrors();

  avg = getSensorsDataAverage()
  if(!avg)
    return;

  sensorsAvg.unshift(avg)

  refreshCanvasHeader(sensorsAvg[0].temperature.current, sensorsAvg[0].humidity.current)
}

function getSensorsDataAverage() {
  var sAvg = {
    date: 0,
    temperature: {
      current: 0,
      avg: 0,
      min: 0,
      max: 0
    },
    humidity: {
      current: 0,
      avg: 0,
      min: 0,
      max: 0
    }
  }

  validData = 0
  for(i=0; i<sensorsData.length; i++) {
    if(sensorsData[i].length == 0) {
      continue;
    }

    if(!sensorsData[i][0].isValid)
      continue;

    validData++;

    if(sAvg.date == 0)
      sAvg.date = sensorsData[i][0].date

    sAvg.temperature.current += sensorsData[i][0].temperature.current
    sAvg.temperature.avg += sensorsData[i][0].temperature.avg
    sAvg.temperature.min += sensorsData[i][0].temperature.min
    sAvg.temperature.max += sensorsData[i][0].temperature.max
    sAvg.humidity.current += sensorsData[i][0].humidity.current
    sAvg.humidity.avg += sensorsData[i][0].humidity.avg
    sAvg.humidity.min += sensorsData[i][0].humidity.min
    sAvg.humidity.max += sensorsData[i][0].humidity.max
  }

  if(validData == 0)
    return null;

  sAvg.temperature.current /= validData
  sAvg.temperature.avg /= validData
  sAvg.temperature.min /= validData
  sAvg.temperature.max /= validData
  sAvg.humidity.current /= validData
  sAvg.humidity.avg /= validData
  sAvg.humidity.min /= validData
  sAvg.humidity.max /= validData

  sAvg.temperature.current = Number(sAvg.temperature.current.toFixed(2))
  sAvg.temperature.avg = Number(sAvg.temperature.avg.toFixed(2))
  sAvg.temperature.min = Number(sAvg.temperature.min.toFixed(2))
  sAvg.temperature.max = Number(sAvg.temperature.max.toFixed(2))
  sAvg.humidity.current = Number(sAvg.humidity.current.toFixed(2))
  sAvg.humidity.avg = Number(sAvg.humidity.avg.toFixed(2))
  sAvg.humidity.min = Number(sAvg.humidity.min.toFixed(2))
  sAvg.humidity.max = Number(sAvg.humidity.max.toFixed(2))

  return sAvg;
}

function refreshCanvasHeader(currTemp, currHum) {
  therCanv = document.getElementById("thermometer")
  ctx = therCanv.getContext("2d")
  ctx.beginPath()
  ctx.fillStyle = "#333333"
  ctx.fillRect(0, 0, therCanv.width, therCanv.width)

  if(currTemp < 0) currTemp = 0
  if(currTemp > 50) currTemp = 50
  fillHeight = therCanv.height/5 + 4*currTemp*therCanv.height/250

  ctx.beginPath()
  ctx.fillStyle = "#BF1226"
  ctx.fillRect(10, therCanv.height, therCanv.width - 120, -fillHeight)
  ctx.drawImage(thermometerImg, 0, 0, therCanv.width-100, therCanv.height)
  ctx.font = "40px Calibri"
  if(isNaN(currTemp))
    ctx.fillText("No data", 2.2*therCanv.width/4, 100)
  else
    ctx.fillText(currTemp.toFixed(1) + " °C", 2.2*therCanv.width/4, 100)


  hygrCanv = document.getElementById("hygrometer")
  ctx = hygrCanv.getContext("2d")
  ctx.beginPath()
  ctx.fillStyle = "#333333"
  ctx.fillRect(0, 0, hygrCanv.width, hygrCanv.width)
  if(currHum < 0) currHum = 0
  if(currHum > 100) currHum = 100
  fillHeight = hygrCanv.height/8 + 7*currHum*hygrCanv.height/800

  ctx.beginPath()
  ctx.fillStyle = "#097479"
  ctx.fillRect(10, hygrCanv.height, hygrCanv.width - 120, -fillHeight)
  ctx.drawImage(hygrometerImg, 0, 0, hygrCanv.width-100, hygrCanv.height)
  ctx.font = "40px Calibri"
  if(isNaN(currHum))
    ctx.fillText("No data", 2.2*hygrCanv.width/4, 100)
  else
    ctx.fillText(currHum.toFixed(1) + " %", 2.2*hygrCanv.width/4, 100)
}

function storeData(data) {
  try {
    parsedData = JSON.parse(data)
  } catch(e) {return false;}

  for(i=0; i<numberOfSensor; i++)
    if(Number(parsedData.id.slice(-1)) === (i+1)) {
      parsedData.isValid = false

      parsedData.error = "no_err"
      if(parsedData.temperature.stdev > 40)
        parsedData.error = "Écart type de température trop élevé"
      else if(parsedData.temperature.current < -10)
        parsedData.error = "Température trop basse"
      else if(parsedData.temperature.current > 50)
        parsedData.error = "Température trop haute"
      else if(!(parsedData.temperature.min <= parsedData.temperature.avg && parsedData.temperature.avg <= parsedData.temperature.max))
        parsedData.error = "Incohérence des relevés : Tmin <= Tavg <= Tmax n'est pas respecté"

      else if(parsedData.humidity.stdev > 40)
        parsedData.error = "Écart type d'humidité trop élevé"
      else if(parsedData.humidity.current < 0)
        parsedData.error = "Humidité trop basse"
      else if(parsedData.humidity.current > 100)
        parsedData.error = "Humidité trop haute"
      else if(!(parsedData.humidity.min <= parsedData.humidity.avg && parsedData.humidity.avg <= parsedData.humidity.max))
        parsedData.error = "Incohérence des relevés : Hmin <= Havg <= Hmax n'est pas respecté"

      if(parsedData.error === "no_err")
        parsedData.isValid = true

      //We limit the number of data stored on client side for each sensor to avoid lag
      if(sensorsData[i].length > 50)
        sensorsData[i].pop()

      sensorsData[i].unshift(parsedData)
    }

  if(Number(parsedData.id.slice(-1)) === 3 && parsedData.isValid)
    postOnDatabase(parsedData)

  if(Number(parsedData.id.slice(-1)) === numberOfSensor) {
    return true
  }

  return false
}

function postOnDatabase(parsedData) {
  var dbData = {
    sensor: parsedData.id,
    timestamp: parsedData.date,
    tcurrent: parsedData.temperature.current,
    tmin: parsedData.temperature.min,
    tmax: parsedData.temperature.max,
    tavg: parsedData.temperature.avg,
    tstddev: parsedData.temperature.stddev,
    hcurrent: parsedData.humidity.current,
    hmin: parsedData.humidity.min,
    hmax: parsedData.humidity.max,
    havg: parsedData.humidity.avg,
    hstddev: parsedData.humidity.stddev
  }

	for(key in dbData)
		if(!dbData[key])
			dbData[key] = 0;

  $.ajax({
    url: "http://51.38.239.114/db3",
    type: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZGIzIn0.RjMVon_kqMN2bZd2qzJI7MfRqDmWi7MX28ZnyXk1DGw")
    },
    data: dbData,
    error: function(err) {console.log("[ERROR] ", err.responseText, "\n", dbData)}
  });
}

function clearDatabase() {
  $.ajax({
    url: "http://51.38.239.114/db3",
    type: "DELETE",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZGIzIn0.RjMVon_kqMN2bZd2qzJI7MfRqDmWi7MX28ZnyXk1DGw")
    },
    success: function() {console.log("Database cleared")},
    error: function(err) {console.log("[ERROR] ", err.responseText)}
  });
}

function getDataFromDatabase(db) {
  $.ajax({
    url: "http://51.38.239.114/db"+(db+1),
    type: "GET",
    success: function(dbData) {
      for(j=0; j<dbData.length; j++) {
        var sensorData = {
          id: dbData[j].sensor,
          date: dbData[j].timestamp,
          isValid: true,
          temperature: {
            avg: dbData[j].tavg,
            min: dbData[j].tmin,
            max: dbData[j].tmax,
            stddev: dbData[j].tstddev,
            current: dbData[j].tcurrent
          },
          humidity: {
            avg: dbData[j].havg,
            min: dbData[j].hmin,
            max: dbData[j].hmax,
            stddev: dbData[j].hstdev,
            current: dbData[j].hcurrent
          }
        }

        id = Number(sensorData.id.substring(1)) - 1
        if(!isNaN(id))
          if(id >= 0 && id < numberOfSensor && id == db) {
            sensorsData[id].unshift(sensorData)
          }
      }

      if(db < numberOfSensor-1)
        getDataFromDatabase(db+1)
      else
        main();
    },
    error: function(err) {
      console.log("[ERROR] ", err.responseText)
      if(db < numberOfSensor-1)
        getDataFromDatabase(db+1)
      else
        main();
    }
  });
}

function printData() {
  console.log(sensorsData)
}
