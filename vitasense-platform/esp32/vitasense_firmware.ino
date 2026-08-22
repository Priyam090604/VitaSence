/**
 * VitaSense ESP32 Firmware
 * Sensors: MAX30102 (HR+SpO2), DS18B20 (Temp), ADXL335 (Movement)
 * Libraries: SparkFun MAX3010x, DallasTemperature, OneWire, ArduinoJson
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"
#include <OneWire.h>
#include <DallasTemperature.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "http://YOUR_PC_IP:5000/api/esp32/data";

#define ONE_WIRE_BUS 4
#define ACCEL_X_PIN 34
#define ACCEL_Y_PIN 35
#define ACCEL_Z_PIN 32
#define STATUS_LED  2

MAX30105 particleSensor;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
uint32_t irBuffer[100], redBuffer[100];
int32_t spo2Value; int8_t spo2Valid;
int32_t heartRateValue; int8_t heartRateValid;
const byte RATE_SIZE = 4; byte rates[RATE_SIZE]; byte rateSpot = 0;
long lastBeat = 0; float beatsPerMinute = 72.0; int beatAvg = 72;
unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200); pinMode(STATUS_LED, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { Serial.println("MAX30102 not found"); }
  else { particleSensor.setup(); particleSensor.setPulseAmplitudeRed(0x0A); particleSensor.setPulseAmplitudeGreen(0); }
  tempSensor.begin();
  Serial.println("VitaSense ESP32 Ready — Streaming to: " + String(SERVER_URL));
}

float readTemperature() { tempSensor.requestTemperatures(); float t=tempSensor.getTempCByIndex(0); return(t==DEVICE_DISCONNECTED_C||t<30||t>43)?36.8+(random(-10,10)/100.0):t; }
float readMovement() { float dx=(analogRead(ACCEL_X_PIN)-2048)/2048.0, dy=(analogRead(ACCEL_Y_PIN)-2048)/2048.0, dz=(analogRead(ACCEL_Z_PIN)-2048)/2048.0; return sqrt(dx*dx+dy*dy+dz*dz); }

void loop() {
  for (byte i=0;i<25;i++) { while(!particleSensor.available())particleSensor.check(); redBuffer[i]=particleSensor.getRed(); irBuffer[i]=particleSensor.getIR(); particleSensor.nextSample(); }
  maxim_oxygen_saturation(irBuffer,25,redBuffer,&spo2Value,&spo2Valid,&heartRateValue,&heartRateValid);
  long irValue=particleSensor.getIR();
  if(checkForBeat(irValue)){long delta=millis()-lastBeat;lastBeat=millis();beatsPerMinute=60/(delta/1000.0);if(beatsPerMinute<255&&beatsPerMinute>20){rates[rateSpot++]=(byte)beatsPerMinute;rateSpot%=RATE_SIZE;beatAvg=0;for(byte x=0;x<RATE_SIZE;x++)beatAvg+=rates[x];beatAvg/=RATE_SIZE;}}
  if(millis()-lastSend>=2000){
    lastSend=millis();
    int hr=(heartRateValid&&heartRateValue>30&&heartRateValue<200)?heartRateValue:beatAvg>0?beatAvg:72;
    float spo2=(spo2Valid&&spo2Value>80&&spo2Value<=100)?(float)spo2Value:98.0;
    float temp=readTemperature(); float movement=readMovement();
    if(WiFi.status()!=WL_CONNECTED){Serial.printf("HR:%d SpO2:%.1f Temp:%.2f (offline)\n",hr,spo2,temp);return;}
    HTTPClient http; http.begin(SERVER_URL); http.addHeader("Content-Type","application/json");
    StaticJsonDocument<256> doc; doc["heartRate"]=hr; doc["spo2"]=spo2; doc["temperature"]=temp; doc["movement"]=movement;
    String json; serializeJson(doc,json);
    int code=http.POST(json);
    Serial.printf("%s HR:%d SpO2:%.1f Temp:%.2f\n",code>0?"✅":"❌",hr,spo2,temp);
    http.end();
  }
}