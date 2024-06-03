import serial
import pynmea2
from datetime import datetime
import json

# Serial setup
serial_port = '/dev/ttyS0'  # UART serial port on Raspberry Pi GPIO
baud_rate = 9600  # GPS modules typically use 9600 baud rate
ser = serial.Serial(serial_port, baud_rate, timeout=1)

def write_gps_data_to_file(latitude, longitude, timestamp):
    with open('gps_data.json', 'w') as file:
        data = {
            'latitude': latitude,
            'longitude': longitude,
            'timestamp': timestamp.isoformat()
        }
        file.write(json.dumps(data))

def display_gps_data(latitude, longitude, timestamp):
    print(f"Latitude: {latitude}, Longitude: {longitude}, Timestamp: {timestamp}")

def parse_gps_sentence(sentence):
    try:
        msg = pynmea2.parse(sentence)
        if isinstance(msg, pynmea2.types.talker.GGA):
            latitude = msg.latitude
            longitude = msg.longitude
            timestamp = datetime.utcnow()
            display_gps_data(latitude, longitude, timestamp)
            write_gps_data_to_file(latitude, longitude, timestamp)
    except pynmea2.ParseError as e:
        print(f'Failed to parse NMEA sentence: {e}')

def read_gps_data():
    while True:
        try:
            line = ser.readline().decode('ascii', errors='replace').strip()
            if line.startswith('$GPGGA'):
                parse_gps_sentence(line)
        except serial.SerialException as e:
            print(f"Error reading from serial port: {e}")
            break

if __name__ == '__main__':
    read_gps_data()
