import serial
from datetime import datetime
import time
import paho.mqtt.client as mqtt

# MQTT Configuration with thingsboard
MQTT_BROKER = '20.42.87.166'
SENSOR_DATA_TOPIC = 'test/topic'
COMMANDS_TOPIC = 'v1/devices/me/rpc/request/+'

broker_url = os.getenv('MQTT_BROKER_URL')
username = os.getenv('MQTT_USERNAME')
password = os.getenv('MQTT_PASSWORD')
topic = os.getenv('MQTT_TOPIC')

# Initialize MQTT Client
client = mqtt.Client()
client.username_pw_set("fabian","ae9k4_ebR17<&g(z")
client.connect(broker_url, 1883, 60)


last_commands_sent = {}

#ser = serial.Serial('/dev/ttyACM0', 9600)

def on_connect(client, userdata, flags, rc):
    print("Connected to Azure-Cloud")
    client.subscribe(COMMANDS_TOPIC)

def on_message(client, userdata, msg):
    command = msg.payload.decode()
    ser.write((command + "\n").encode())

client.username_pw_set(username, password)

client.on_connect = on_connect
client.on_message = on_message
client.loop_start()

while True:
    time.sleep(0.5)

    line = ser.readline().decode('utf-8').strip()

    print("Arduino: " + line + " @ " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    if "M:" in line and "L:" in line and "H:" in line and "T:" in line:
        parts = line.split(',')
        moisture = parts[0].split(':')[1]
        light = parts[1].split(':')[1]
        humidity = parts[2].split(':')[1]
        temperature = parts[3].split(':')[1]

        sensor_values = {
            'moisture': float(moisture),
            'temperature': float(temperature),
            'humidity': float(humidity),
            'light': float(light)
        }

    client.publish(topic, sensor_values)
