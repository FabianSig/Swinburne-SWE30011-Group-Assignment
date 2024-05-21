import serial
from datetime import datetime
import time
import paho.mqtt.client as mqtt

# MQTT Configuration with thingsboard
MQTT_BROKER = '20.42.87.166'
SENSOR_DATA_TOPIC = 'test/topic'
THRESHOLD_COMMAND_TOPIC = 'command/threshold'

broker_url = os.getenv('MQTT_BROKER_URL')
username = os.getenv('MQTT_USERNAME')
password = os.getenv('MQTT_PASSWORD')
topic = os.getenv('MQTT_TOPIC')

client = mqtt.Client()
client.username_pw_set(username, password)
client.connect(broker_url, 1883, 60)

last_commands_sent = {}

try:
    ser = serial.Serial('/dev/ttyACM0', 9600)
except serial.SerialException as e:
    print(f"Could not open serial port: {e}")
    ser = None

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker")
    client.subscribe(THRESHOLD_COMMAND_TOPIC)
    print(f"Subscribed to topics: {THRESHOLD_COMMAND_TOPIC}")

def on_message(client, userdata, msg):
    command = msg.payload.decode()
    print(f"Received message '{command}' on topic '{msg.topic}'")
    if msg.topic == THRESHOLD_COMMAND_TOPIC:
            handle_threshold_command(command)

def handle_threshold_command(command):
    print(f"Handling threshold command: {command}")
    if ser:
        ser.write((command + "\n").encode())

client.on_connect = on_connect
client.on_message = on_message
client.loop_start()

try:
    while True:
        time.sleep(0.5)
        if ser:
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

                client.publish(topic, str(sensor_values))
except KeyboardInterrupt:
    print("Exiting...")
finally:
    if ser:
        ser.close()
    client.loop_stop()
    client.disconnect()