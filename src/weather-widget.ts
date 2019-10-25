import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult
} from "lit-element";
import { weatherIcon } from "./weatherIcon";

/**
 * Current weather display widget
 * Weather information is acquired from OpenWeatherMap (https://openweathermap.org/)
 * Weather info is updated every "intervalMin" minutes based on device current position
 * settings: OWM's ID (appid), language (lang), update interval (intevalMin)
 */
@customElement("weather-widget")
export class WeatherWidget extends LitElement {
  @property({ type: String }) appid = "yourOpenWeatherMapID";
  @property({ type: String }) lang = "ja";
  @property({ type: Number }) lat = 35.68; //  default: Tokyo Station
  @property({ type: Number }) lon = 139.76; // default: Tokyo Station
  @property({ type: String }) weather = "-";
  @property({ type: Number }) weatherID = 0;
  @property({ type: Number }) tempC = -274; // never achived initial value lol
  @property({ type: String }) iconURL = "";
  @property({ type: Number }) intervalMin = 10;
  @property({ type: String }) url = "#";
  constructor() {
    super();
    // initial query
    this.queryWeather().catch(console.log);
    // intermittent query registration
    setInterval(this.queryWeather.bind(this), this.intervalMin * 60 * 1000);
  }
  async queryWeather(): Promise<void> {
    // location (latitude & longitude) acquisition
    const pos = await new Promise<Position>((resolve, reject): void => {
      navigator.geolocation.getCurrentPosition(pos => resolve(pos), reject);
    });
    this.lat = pos.coords.latitude;
    this.lon = pos.coords.longitude;

    // current weather
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&units=metric&lang=${this.lang}&appid=${this.appid}`
    );
    const resJson = await res.json();
    this.weather = resJson.weather[0].description;
    this.weatherID = resJson.weather[0].id as number;
    this.tempC = Math.round(resJson.main.temp * 10) / 10; // xx.x ℃
  }
  render(): TemplateResult {
    console.log(this.url == "#");
    return html`
      <style>
        #weatherIcon {
          width: 100px;
          height: 100px;
          margin: 0;
          padding: 0;
        }
        h3 {
          margin: 0;
          padding: 0;
        }
        a {
          text-decoration: none;
        }
      </style>
      <a
        href=${this.url}
        target=${this.url == "#" ? "_self" : "_blank"}
        rel="noopener"
      >
        <svg id="weatherIcon" viewBox="0 0 512 512">
          ${weatherIcon(this.weatherID)}
        </svg>
        <h3>${this.tempC}℃</h3>
      </a>
    `;
  }
}

// weather forecast for 5 days (3-hour interval data)
// const tResFor = await fetch(
//   `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${appid}`
// );
// const resFor = await tResFor.json();
// resFor.list.map(item => item.dt);
// // next day morning
// const weather = resFor.list;
// const weather_icon_url = `http://openweathermap.org/img/w/${
//   resFor.weather[0].icon
// }.png`;
// const temp_C = resFor.main.temp;
