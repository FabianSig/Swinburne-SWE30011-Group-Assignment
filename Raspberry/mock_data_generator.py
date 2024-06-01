import os
import time
import json
import random
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load environment variables
broker_url = os.getenv('MQTT_BROKER_URL')
broker_port = int(os.getenv('MQTT_BROKER_PORT'))
username = os.getenv('MQTT_USERNAME')
password = os.getenv('MQTT_PASSWORD')
topic = os.getenv('MQTT_SENSOR_TOPIC')

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(topic)

def on_message(client, userdata, msg):
    print(f"Message received: {msg.payload.decode()}")

# Initialize the MQTT client
client = mqtt.Client()
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

# Connect to the broker
client.connect(broker_url, broker_port)

client.loop_start()

try:
    while True:
        # Generate mock data
        data = {
            "time": time.strftime('%Y-%m-%dT%H:%M:%S'),
            "light_levels": random.uniform(600, 700),
            "humidity_levels": random.uniform(60, 70),
            "temperature_levels": random.uniform(20, 22),
            "moisture_levels": random.uniform(40, 50)
        }
        client.publish(topic, json.dumps(data))
        time.sleep(1)  # Sleep for 1 second before sending the next data
except KeyboardInterrupt:
    print("Exiting...")
finally:
    client.loop_stop()
    client.disconnect()
