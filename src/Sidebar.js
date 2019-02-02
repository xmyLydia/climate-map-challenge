import React  from 'react';
import ReactDOM from 'react-dom';
import styled from "styled-components";
import L from "leaflet";
//import getSelectedLocatoinId from './locationGetter';
import HeatmapLayer from './HeatmapLayer';


import {Map, Marker, TileLayer, Popup} from "react-leaflet";


//echart
import asyncComponent from './AsyncComponent'
//import { pieOption, barOption, lineOption  } from './optionConfig/optionNew'
//import {  lineOption  } from './optionConfig/optionNew'
const PieReact = asyncComponent(() => import(/* webpackChunkName: "Pie" */'./EchartsDemo/PieReact'))  //饼图组件
const BarReact = asyncComponent(() => import(/* webpackChunkName: "Bar" */'./EchartsDemo/BarReact')) //柱状图组件
const LineReact = asyncComponent(() => import(/* webpackChunkName: "Line" */'./EchartsDemo/LineReact'))  //折线图组件


const MapContainer = styled(Map)`
    width: calc(100vw - 300px);
    height: 100vh;
    position:absolute;
    top:0px;
    left:300px;
`;
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Sidebar({selectedLocationId, observationLocations  }) {
   // const id = getSelectedLocatoinId(selectedLocationId);
    //const mapSidebar = Modify();
    var time = "";
    //var Climate = ""

    //const loc = observationLocations.find(loc => loc.info.id === id);

    if(observationLocations.length!==0){
       // var loc = observationLocations[0];
        //time = getTimeFormat(loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].time);
        time = getDateLatest(observationLocations);
       // Climate =  (loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].value)+'℃';
    }
    return (
        <div>

        <button onClick={()=>Modify( selectedLocationId,observationLocations,"MarkerMap" )}>Marker Map</button>

        <button onClick={()=>Modify( selectedLocationId,observationLocations,"HeatMap" )}> HeatMap</button>


         <button onClick={()=>checkCharts( selectedLocationId,observationLocations  )}> charts</button>




         <h1>{time}</h1>< br/>

        </div>

    );

}
function getDateLatest(observationLocations){
    var loc = observationLocations[0];
    var time = loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].time;
    var date = new Date(time);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';

    var result = (Y+M+D );
    return  result+" Climate ";
}
function getTimeFormat(time){
    var date = new Date(time);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    var result = (Y+M+D+h+m+s);
    return result;
}
function getHour(time){
    var date = new Date(time);

    var h = date.getHours() ;

    return h;
}
function setPieChart(observationLocations){
    var pie_data = getPieData(observationLocations);
    var pieOption ={
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['-40℃~-30℃','-30℃~-20℃','-20℃~-10℃','-10℃~-0℃','>0℃']
        },
        series: [
            {
                name:'Temperature',
                type:'pie',
                radius: ['100%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },

                 data: pie_data

            }
        ]
    };
    return pieOption;
}
function getAllClimate(observationLocations){
    var listClimate = [];
    for(var i=0;i<observationLocations.length-1;i++){
        var loc = observationLocations[i];
        var temp_climate = loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].value;
        listClimate.push(temp_climate);
    }
    return listClimate;
}
function getPieData(observationLocations){
    var listClimate = getAllClimate(observationLocations);
    var Climate4to3 = [];
    var Climate3to2 = [];
    var Climate2to1 = [];
    var Climate1to0 = [];
    var ClimateGreater0 = [];
    for(var i=0;i<listClimate.length;i++){
        var temp = listClimate[i];
        if (temp<(-30) && temp>=(-40)){
           Climate4to3.push(temp);
          // listClimate.pop(temp);
        }else if(temp<(-20)&&temp>=(-30)){
            Climate3to2.push(temp);
        }else if(temp<(-10)&&temp>=(-20)){
            Climate2to1.push(temp);
        }else if(temp<(0)&&temp>=(-10)){
            Climate1to0.push(temp);
        }else if(temp>=0){
            ClimateGreater0.push(temp);
        }
    }
    var data=[
        {value:Climate4to3.length, name:'-40℃~-30℃'},
        {value:Climate3to2.length, name:'-30℃~-20℃'},
        {value:Climate2to1.length, name:'-20℃~-10℃'},
        {value:Climate1to0.length, name:'-10℃~-0℃'},
        {value:ClimateGreater0.length, name:'>0℃'}
    ]
    return data;
}
function setBarChart(observationLocations){
    var bar_data = getAllClimate(observationLocations);
    var barOption = {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : [
﻿        'Kaarina Yltöinen','Hanko Tulliniemi',
        'Turku Artukainen','Hanko Tvärminne',
        'Salo Kärkkä','Helsinki Kaisaniemi',
        'Lohja Porla','Vihti Maasoja','Porvoo Harabacka',
        'Kotka Rankki','Loviisa Orrengrund','Kustavi Isokari',
        'Pori rautatieasema','Kokemäki Tulkkila','Jokioinen Ilmala',
        'Pirkkala Tampere-Pirkkala lentoasema','Somero Salkola','Hyvinkää Hyvinkäänkylä',
        'Hämeenlinna Katinen','Hattula Lepaa','Lahti Laune',
        'Heinola Asemantaus','Kouvola Utti Lentoportintie',
        'Lappeenranta Lepola','Lappeenranta Hiekkapakka','Kaskinen Sälgrund',
        'Karvia Alkkia','Kauhajoki Kuja-Kokko','Kankaanpää Niinisalo lentokenttä',
        'Virrat Äijänneva','Tampere Siilinkari','Juupajoki Hyytiälä','Jämsä Halli Lentoasemantie',
        'Jyväskylä lentoasema','Mikkeli lentoasema',
        'Varkaus Kosulanniemi','Savonlinna lentoasema','Tohmajärvi Kemie','Vaasa Klemettilä',
        'Kauhava lentokenttä','Ähtäri Inha','Alajärvi Möksy',
        'Multia Karhila','Viitasaari Haapaniemi','Siilinjärvi Kuopio lentoasema',
        'Kuopio Savilahti','Liperi Joensuu lentoasema',
        'Joensuu Linnunlahti','Lieksa Lampela','Pietarsaari Kallan','Kalajoki Ulkokalla',
        'Toholampi Laitala','Ylivieska lentokenttä','Haapavesi Mustikkamäki','Pyhäjärvi Ojakylä',
        'Vieremä Kaarakkala','Valtimo kirkonkylä','Kuhmo Kalliojoki','Raahe Lapaluoto satama',
        'Oulu Vihreäsaari satama','Pudasjärvi lentokenttä','Tornio Torppi','Rovaniemi rautatieasema',
        'Kemijärvi lentokenttä','Lahti Sopenkorpi','Rauma Pyynpää','Kajaani Petäisenniska',
        'Maarianhamina Länsisatama','Tampere Tampella','Espoo Tapiola'

],
    axisTick: {
        alignWithLabel: true
    }
}
],
    yAxis : [
        {
            type : 'value'
        }
    ],
        series : [
        {
            name:'Climate (℃)',
            type:'bar',
            barWidth: '60%',
            data:bar_data
        }
    ]
};
    return barOption;
}
function getHourList(observationLocations,locationIndex ){

     var loc = observationLocations[locationIndex];
     //var SnowOnLatest = loc.data.snowdepth.timeValuePairs[(loc.data.snowdepth.timeValuePairs).length-1].value;
     var TimeList = [];
     for(var i = 5;i>=0;i--){
       var Hour = getHour(loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1-i].time)+":00 Snow Depth (mm)";
        TimeList.push(Hour);
     }
     //var LatestHour = getHour(loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].time)
     return TimeList;
}
function getSnowDepth(observationLocations,locationIndex){
    var loc = observationLocations[locationIndex];
    //var SnowOnLatest = loc.data.snowdepth.timeValuePairs[(loc.data.snowdepth.timeValuePairs).length-1].value;
    var snowList = [];
    for(var i=5;i>=0;i--){
        var snow_temp = loc.data.snowdepth.timeValuePairs[(loc.data.snowdepth.timeValuePairs).length-1-i].value;
        snowList.push(snow_temp);
    }
    return snowList;
}
function setLineChart(observationLocations){
    var xAxisData = getHourList(observationLocations,0);
    var snow_KY = getSnowDepth(observationLocations,0);
    var snow_TA = getSnowDepth(observationLocations,2);
    var snow_HT = getSnowDepth(observationLocations,3);
    var snow_HK = getSnowDepth(observationLocations,5);
    var snow_LP = getSnowDepth(observationLocations,6);
    var lineOption = {
        title: {
            text: 'Stacked area map '
        },
        tooltip : {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data:['﻿Kaarina Yltöinen','Turku Artukainen','Hanko Tvärminne','Helsinki Kaisaniemi','Lohja Porla']

        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
               // data : [' 8:00 Snow Depth (mm)','12:00 Snow Depth (mm)','16:00 Snow Depth (mm)','20:00 Snow Depth (mm)','22:00 Snow Depth (mm)','0:00 Snow Depth (mm)','4:00 Snow Depth (mm)']
                data: xAxisData
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'﻿Kaarina Yltöinen',
                type:'line',
                stack: 'snow depth',
                areaStyle: {normal: {}},
                //data:[27,27,27,27,26,28,27,27]
                data:snow_KY
            },
            {
                name:'Turku Artukainen',
                type:'line',
                stack: 'snow depth',
                areaStyle: {normal: {}},
                //data:[30,30,30,30,30,30,30,29]
                data: snow_TA
            },
            {
                name:'Hanko Tvärminne',
                type:'line',
                stack: 'snow depth',
                areaStyle: {normal: {}},
                //data:[22,22,21,22,21,21,21,21]
                data: snow_HT
            },
            {
                name:'Helsinki Kaisaniemi',
                type:'line',
                stack: 'snow depth',
                areaStyle: {normal: {}},
                //data:[26,28,30,30,30,30,30,29]
                data: snow_HK
            },
            {
                name:'Lohja Porla',
                type:'line',
                stack: 'snow depth',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                areaStyle: {normal: {}},
                //data:[38,38,38,38,39,39,38,38]
                data: snow_LP
            }
        ]
    };
    return lineOption;
}
function checkCharts(selectedLocation,observationLocations){
    //Set data
    var pieOption = setPieChart( observationLocations);
    var barOption = setBarChart(observationLocations);
    var lineOption = setLineChart(observationLocations);
    const chartVal=(
        <div>
        <h2>Climate Pie Chart</h2>
        <PieReact option={pieOption} />
        <hr/>

        <h2>Climate Bar Chart ℃</h2>
        <BarReact option={barOption} />
        <hr/>

        <h2>SnowDepth Line Chart</h2>
        <LineReact option={lineOption} />
        <hr/>
    </div>
    );

     ReactDOM.render(
        <div className="App">
            <Sidebar selectedLocationId={selectedLocation} observationLocations={observationLocations}   />
            <div id="Map">
                {chartVal}
            </div>
        </div>,
        document.getElementById('root')
    );

}
function Modify(selectedLocation,observationLocations,option) {
    //drawMap(Map_Leaf);
    //var map_val = getMap();

    var map_val = null;
    if(option==="MarkerMap"){
        map_val=MarkerMap(observationLocations);
    }else if(option==="HeatMap"){
        map_val =heatMap(observationLocations);
    }

     ReactDOM.render(
        <div className="App">
            <Sidebar selectedLocationId={selectedLocation} observationLocations={observationLocations}/>
            <div id="Map">
                {map_val}
            </div>
        </div>,
        document.getElementById('root')
    );
}
function getPointsInfo(observationLocations){
    var points = [];
    for(var i=0;i<observationLocations.length;i++){
        var tempArray = [];
        var lat = observationLocations[i].position.lat;
        var lon = observationLocations[i].position.lon;
        var temperature = (parseFloat(observationLocations[i].data.t.timeValuePairs[24].value)+100)*1000;
        tempArray.push(lat);
        tempArray.push(lon);
        tempArray.push(temperature);
        points.push(tempArray);
    }
    return points;
}

 

function MarkerMap(observationLocations){//return map
    const map = (
        <MapContainer center={[65,26]} zoom={6}>
            <TileLayer
                url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                subdomains='abcd'
                maxZoom={19}
            />

            {observationLocations.map(loc => <Marker position={[loc.position.lat, loc.position.lon]}
                                                     key={loc.info.id} >

                <Popup>
              <span> <b>{[loc.info.name]}</b><br />
                    Weather: {loc && JSON.stringify(loc.data.t.timeValuePairs[24].value)}c<br />
                  Snow: {loc && JSON.stringify(loc.data.snowdepth.timeValuePairs[24].value)}cm <br />
                    Location:({ (loc.position.lat)},{loc.position.lon})<br/>
                    Time:{ getTimeFormat(loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].time)  }
            </span>
                </Popup>
            </Marker>)
            }

        </MapContainer>

    );
    return map;
}


function heatMap(observationLocations){

    var getPoints = getPointsInfo(observationLocations);

 const heat_map=(
   <MapContainer center={[65,26]} zoom={5}>
        <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate

            points = {getPoints}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            intensityExtractor={m => parseFloat(m[2])} />
            <TileLayer

            url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

        />

    </MapContainer>
 );
 return heat_map
}

export default styled(Sidebar)`
    width: 300px;
    height: 100vh;
`;
