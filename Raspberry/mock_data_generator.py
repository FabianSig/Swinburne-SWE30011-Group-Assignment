import random
from datetime import datetime
import time
import paho.mqtt.client as mqtt


broker_url = os.getenv('MQTT_BROKER_URL')
username = os.getenv('MQTT_USERNAME')
password = os.getenv('MQTT_PASSWORD')
topic = os.getenv('MQTT_TOPIC')

client = mqtt.Client()
client.username_pw_set(username, password)
client.connect(broker_url, 1883, 60)

last_commands_sent = {}


def on_connect(client, userdata, flags, rc):
    print("Connected to Azure-Cloud")
    client.subscribe(commands_topic)

def on_message(client, userdata, msg):
    command = msg.payload.decode()
    if ser:
        ser.write((command + "\n").encode())

client.on_connect = on_connect
client.on_message = on_message
client.loop_start()

try:
    while True:
        time.sleep(0.5)
        parts = line.split(',')
        moisture = random.randint(200, 250)
        light = random.randint(200, 250)
        humidity = random.randint(200, 250)
        temperature = random.randint(20, 25)

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