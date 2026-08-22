# ESP32 Wiring Guide

## MAX30102 (SpO₂/HR)
| Pin | ESP32 |
|-----|-------|
| VCC | 3.3V |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

## DS18B20 (Temperature)
| Pin | ESP32 |
|-----|-------|
| VCC | 3.3V |
| GND | GND |
| DATA | GPIO 4 (+ 4.7kΩ to VCC) |

## ADXL335 (Movement)
| Pin | ESP32 |
|-----|-------|
| VCC | 3.3V |
| GND | GND |
| XOUT | GPIO 34 |
| YOUT | GPIO 35 |
| ZOUT | GPIO 32 |
