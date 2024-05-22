import os
import serial
from datetime import datetime
import time
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# MQTT Configuration
broker_url = os.getenv('MQTT_BROKER_URL')
broker_port = int(os.getenv('MQTT_BROKER_PORT'))
username = os.getenv('MQTT_USERNAME')
password = os.getenv('MQTT_PASSWORD')
sensor_topic = os.getenv('MQTT_SENSOR_TOPIC')
command_topic = "command/threshold"

# Create an MQTT client instance
client = mqtt.Client()

# Set username and password for the client
client.username_pw_set(username, password)

# Define the on_connect callback function
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe(command_topic)
        print(f"Subscribed to topics: {command_topic}")
    else:
        print(f"Failed to connect, return code {rc}")

# Define the on_message callback function
def on_message(client, userdata, msg):
    command = msg.payload.decode()
    print(f"Received message '{command}' on topic '{msg.topic}'")
    if msg.topic == command_topic:
        handle_threshold_command(command)

# Define the handle_threshold_command function
def handle_threshold_command(command):
    print(f"Handling threshold command: {command}")
    if ser:
        ser.write((command + "\n").encode())

# Assign the callback functions to the MQTT client
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
print("Attempting to connect to MQTT broker...")
client.connect(broker_url, broker_port, 60)

# Start the MQTT client loop
client.loop_start()

# Debugging: Check if the script is reaching this point
print("MQTT client loop started")

# Placeholder for the serial object
try:
    ser = serial.Serial('/dev/ttyACM0', 9600)
except serial.SerialException as e:
    print(f"Could not open serial port: {e}")
    ser = None

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
                    "moisture": float(moisture),
                    "temperature": float(temperature),
                    "humidity": float(humidity),
                    "light": float(light)
                }

                sensor_values_json = json.dumps(sensor_values)

                client.publish(sensor_topic, str(sensor_values))
except KeyboardInterrupt:
    print("Exiting...")
finally:
    if ser:
        ser.close()
    client.loop_stop()
    client.disconnect()
