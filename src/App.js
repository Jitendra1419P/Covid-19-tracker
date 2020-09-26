import React,{useState, useEffect } from 'react';
import './App.css';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import InfoBox from "./InfoBox"
import LineGraph from './LineGraph';
import Table from "./Table"
import { sortData, prettyPrintStat } from './Util';
import numeral from "numeral";
import Map from "./Map"
import "leaflet/dist/leaflet.css";

function App() {
  const [country,setCountry] = useState("worldwide");
  const [countryInfo, setcountryInfo] = useState({});
const [countries, setCountries] = useState([]);
const [mapCountries, setMapCountries] = useState([]);
const [tableData, setTableData] = useState([]);
const [casesType, setCasesType] = useState("cases");
const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 77 });
const [mapZoom, setMapZoom] = useState(3);


useEffect(()=>{
fetch("https://disease.sh/v3/covid-19/all")
.then(response=> response.json())
.then(data => {
  setcountryInfo(data);
});
},[])

useEffect(() => {
  const getCoutriesData = async () =>{
 await fetch("https://disease.sh/v3/covid-19/countries")
 .then((response)=> response.json())
 .then((data)=>{
 const countries = data.map((country)=>(
   {
     name: country.country, // United States 
     value:country.countryInfo.iso2 // UK 
   }));

   const sortedData = sortData(data)
   setTableData(sortedData);
   setMapCountries(data);
   setCountries(countries);

 });
};
getCoutriesData();
}, [])
 const onCountryChange = async (e) =>{
   const countryCode = e.target.value;
    setCountry(countryCode);

    const url = 
    countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response=> response.json())
    .then(data => {
      setCountry(countryCode);
      setcountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);     
    })
   };  

  
  return (
    <div className="app">
      <div className="app__left">
       {/* Header */}
       <div className="app__header">
      <h1>COVID-19 TRACKER</h1>
      <FormControl className="app__dropdown">
      <Select variant="outlined" onChange={onCountryChange} value={country}>
        <MenuItem value="worldwide">WorldWide</MenuItem>
        { countries.map((country) => (
           <MenuItem value={country.value}>{country.name}</MenuItem>
           ))}
      </Select>
      </FormControl>
      </div>
      {/* Title + Select input dropdown Field */}  
      <div className="app__stats"> 
      <InfoBox 
      isRed
      active={casesType === "cases"}
      onClick={(e) => setCasesType('cases')}
      title="Coronavirus Cases" 
      cases={prettyPrintStat(countryInfo.todayCases)} 
      total={numeral(countryInfo.cases).format("0.0a")}/>    
      <InfoBox 
      active={casesType === "recovered"}
      onClick={(e) => setCasesType("recovered")}
      title="Recoveries" 
      cases={prettyPrintStat(countryInfo.todayRecovered)} 
      total={numeral(countryInfo.recovered).format("0.0a")}/>    
      <InfoBox
      isRed
      active={casesType === "deaths"}
      onClick={(e) => setCasesType("deaths")} 
      title="Deaths" 
      cases={prettyPrintStat(countryInfo.todayDeaths)} 
      total={numeral(countryInfo.deaths).format("0.0a")}/>    
      </div>
      {/* Map */}
      <Map      
      countries={mapCountries}
      casesType={casesType}
      center={mapCenter}
      zoom={mapZoom}
      />
      </div>
     
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </div>
        </CardContent>
      </Card>


    </div>
  );
}

export default App;
