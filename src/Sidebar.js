import React  from 'react';
import ReactDOM from 'react-dom';
import styled from "styled-components";
import L from "leaflet";
import getSelectedLocatoinId from './locationGetter';
import HeatmapLayer from './HeatmapLayer';


import {Map, Marker, TileLayer, Popup} from "react-leaflet";


//echart
import asyncComponent from './AsyncComponent'
import { pieOption, barOption, lineOption  } from './optionConfig/optionNew'
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
    const id = getSelectedLocatoinId(selectedLocationId);
    //const mapSidebar = Modify();
    var time = "";
    var Climate = ""
    const loc = observationLocations.find(loc => loc.info.id === id);
    if(loc!=null){
       time = getTimeFormat(loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].time);
       Climate =  (loc.data.t.timeValuePairs[ (loc.data.t.timeValuePairs).length-1].value)+'℃';
    }
    return (
        <div>

        <button onClick={()=>Modify( selectedLocationId,observationLocations,"MarkerMap" )}>Marker Map</button>

        <button onClick={()=>Modify( selectedLocationId,observationLocations,"HeatMap" )}> HeatMap</button>


         <button onClick={()=>checkCharts( selectedLocationId,observationLocations  )}> charts</button>


         <h1>weather</h1>
         <pre>{loc && JSON.stringify(loc.info, null, 4)}</pre>
         <h1>{time}</h1>< br/>
         <h1>{Climate}</h1>
        </div>

    );

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

function checkCharts(selectedLocation,observationLocations){
    const chartVal=(
        <div>
        <h2>Climate Pie Chart</h2>
        <PieReact option={pieOption} />
        <hr/>

        <h2>Climate Bar Chart</h2>
        <BarReact option={barOption} />
        <hr/>

        <h2>SnowDepth Line Chart</h2>
        <LineReact option={lineOption} />
        <hr/>
    </div>
    );

    var reactEle = ReactDOM.render(
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

    var reactEle = ReactDOM.render(
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
