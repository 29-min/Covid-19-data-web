
var button = document.querySelector("button");
var countryname = document.querySelector("input")
//button.addEventListener('click', Coviddata)
var getParam = function(key){       // search에서 get 방식으로 보내지는 나라 이름 데이터 받기
    var _parammap = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }

        _parammap[decode(arguments[1])] = decode(arguments[2]);
    });

    return _parammap[key];
};


function Coviddata() { // 전체 함수 
    console.log('start')
    var country = getParam("country")
    if(country == undefined){
        country = 'KOR'
    }
    var requestURL = 'https://covid.ourworldindata.org/data/owid-covid-data.json'
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onload = function() {                       //coviddata  json 받아와서 함수 실행 
        var coviddata = request.response;
        var data = coviddata[country]['data'];
        console.log(data.length);    
        var daydata = [];
        for (let i=1; i <= 7; i++)
            daydata.push(data[data.length - i]);
        //var oneday = (data.filter(function(rowData){ return rowData.date == "2021-11-20"})); 
        let a = document.getElementsByClassName("main0")[0];
        a.innerText=coviddata[country]['location']; 

        var countryname = Object.keys(coviddata);               // 나라 이름 받아오기
        console.log(countryname)
        var per = [];


        var death = [];                                         //사망자 데이터
        death.push(data[data.length-1]["total_deaths"])
        console.log(death)
        let x = document.getElementsByClassName("main1")[0];
        x.innerText=death[0]; 

        var newcase = [];                                       //신규 확진자 데이터
        newcase.push(data[data.length-1]["new_cases"]);
        let y = document.getElementsByClassName("main2")[0];
        y.innerText=newcase[0]; 

        var onedaynewcase = [];
        console.log(daydata);
        var daydataforchart = [];
        for (let i=0; i <7; i++)
            daydataforchart.push(daydata[i]["date"]);   //차트를 위한 날짜 인덱스 값
        daydataforchart = daydataforchart.reverse();
        for (let i=0; i <7; i++)
            onedaynewcase.push(daydata[i]["new_cases"]);    // 일일 확진자 데이터
        onedaynewcase = onedaynewcase.reverse();
        var deathchart = [];
        for (let i=0; i <7; i++)
            deathchart.push(daydata[i]["total_deaths"]);    // 종합 사망자 데이터
        deathchart = deathchart.reverse();

        //----------------백신 접종률 높은순으로 5개 구하는 부분 ------------------//
        var countryWithVaccine = [] // 백신 접종률이 높은 순으로 정렬하려고 하는 배열
        var today = new Date(+new Date() + 3240 * 10000);
        today.setDate(today.getDate()-1);
        today = today.toISOString().split("T")[0]; // 어제 날짜를 찾아서 출력

        for(let i = 0; i<countryname.length; i++){ // 나라 전체를 순회
            var valueCountryVaccinated = coviddata[countryname[i]]['data'][coviddata[countryname[i]]['data'].length-1]['people_fully_vaccinated_per_hundred']
            var dateLatestCountryData = coviddata[countryname[i]]['data'][coviddata[countryname[i]]['data'].length-1]['date']
            if(valueCountryVaccinated == undefined || dateLatestCountryData != today) continue
            //console.log("Code: " + countryname[i] + ", Country: " + coviddata[countryname[i]]['location'] + ", Vaccinated: " + valueCountryVaccinated)
            if(countryWithVaccine.length == 0) {
                countryWithVaccine.push({
                    country: coviddata[countryname[i]]['location'],
                    vaccine: valueCountryVaccinated
                    })
            }
            
            else if(countryWithVaccine.length<5){ // 백신 접종률이 높은 순으로 정렬할 때 5개만 본다고 해서 앞 5개만 정렬하려고 함
                var beforeListLength = countryWithVaccine.length
                for(let j= 0; j<countryWithVaccine.length; j++){ // 크기순으로 정렬하기 위한 순회
                    if(countryWithVaccine[j]['vaccine'] < valueCountryVaccinated){
                        countryWithVaccine.splice(j, 0, {
                            country: coviddata[countryname[i]]['location'],
                            vaccine: valueCountryVaccinated
                        });
                        break
                    }
                }
                if(beforeListLength == countryWithVaccine.length){
                    countryWithVaccine.push({
                        country: coviddata[countryname[i]]['location'],
                        vaccine: valueCountryVaccinated
                        });
                }
            }
            else{
                
                for(let j= 0; j<5; j++){
                    if(countryWithVaccine[j]['vaccine'] < valueCountryVaccinated){
                        countryWithVaccine.splice(j, 0, {
                            country: coviddata[countryname[i]]['location'],
                            vaccine: valueCountryVaccinated
                        });
                        break
                    }
                }
            }
        }
        countryWithVaccine = countryWithVaccine.slice(0,5)
        console.log(countryWithVaccine) // 결과물!
//--------------------------끝!--------------------------//
        let c = document.getElementsByClassName("vacinebox")[0];     //html에  출력으로 보내기
        for (let i=0; i<5; i++){
        c.children[i].children[0].innerText=String(countryWithVaccine[i]['country'])
        c.children[i].children[1].innerText=String(countryWithVaccine[i]['vaccine']) + '%'
        }


        var vac_2 = coviddata['KOR']['data'][coviddata['KOR']['data'].length-2]['people_fully_vaccinated_per_hundred'] // 한국의 백신 접종률 데이터 
        var vac_1 = coviddata['KOR']['data'][coviddata['KOR']['data'].length-2]['people_vaccinated_per_hundred'] 
        var vac_0 = 100-vac_1 
        console.log(vac_0,vac_1,vac_2)


        var context = document  // 차트 부분
            .getElementById('myChart')
            .getContext('2d');
        context.clearRect(0,0,900,500)
        var doughnutcontext = document
            .getElementById('doughnutchart')
            .getContext('2d');
        doughnutcontext.clearRect(0,0,260,260)
        var doughnutchart = new Chart(doughnutcontext, {
            type: 'doughnut',
            data: {
                labels: ["2차 접종 완료", "1차 접종 완료", "미 접종"],
                datasets: [{
                    data: [vac_2, vac_1, vac_0], 
                    backgroundColor: [
                    "rgb(1, 126, 250)",
                    "rgba(48, 218, 136)",
                    "rgba(81, 203, 255)"
                    ],
                    borderWidth: 0,
                    scaleBeginAtZero: true,
                }]
            },
            options:{
                responsive: true,
                title: {
                    display: true,
                    text: '한국 백신 접종률'
                },
                legend: {
                    position: 'bottom'
                }
            }
        });

        var myChart = new Chart(context, {      //꺽은선 그래프
            type: 'line',
            data: {
                labels: daydataforchart,
                datasets: [{
                    label: '일일 확진자 수',
                    data: onedaynewcase,
                    borderColor: "rgba(255, 201, 14, 1)",
                    backgroundColor: "rgba(255, 201, 14, 0.5)",
                    fill: false,
                    lineTension: 0
                },
                {
                    label: '종합 사망자 수',
                    data: deathchart,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    fill: false,
                    lineTension: 0
                }
                ]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: '최근 7일 확진자 동향'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                }
            }
        }); 
    }
}
