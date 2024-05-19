import paho.mqtt.client as mqtt
import mariadb
import sys
from datetime import datetime

insert_stmt = 'INSERT INTO watering_system_data(time, moisture_levels, light_levels, temperature_levels, humidity_levels) VALUES(%s, %s, %s, %s, %s)'

# MariaDB Configuration
try:
    conn = mariadb.connect(user="fabian", password="os.getenv('DB_PASSWORD')", host="localhost", port=3306, database="Arduino")
except mariadb.Error as e:
    print("There is an issue connecting to db")
    sys.exit(1)

cur = conn.cursor()

# Callback when the client connects to the broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected successfully to the broker")
        # Subscribe to the desired topic
        client.subscribe("your/topic")
    else:
        print(f"Failed to connect, return code {rc}")

# Callback when a message is received from the broker
def on_message(client, userdata, msg):
    dataString = msg.payload.decode()
    print(f"Arduino: {dataString} @ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if "M:" in dataString and "L:" in dataString and "H:" in dataString and "T:" in dataString:
        parts = dataString.split(',')
        moisture = parts[0].split(':')[1]
        light = parts[1].split(':')[1]
        humidity = parts[2].split(':')[1]
        temperature = parts[3].split(':')[1]

        cur.execute(insert_stmt, (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), moisture, light, temperature, humidity))
        conn.commit()

# Create an MQTT client instance
client = mqtt.Client()

# Assign the on_connect and on_message callbacks
client.on_connect = on_connect
client.on_message = on_message

# Set the broker address and port
broker_address = "localhost"  # Use your broker address if different
port = 1883  # Default MQTT port

# Connect to the broker
client.connect(broker_address, port, 60)

# Start the MQTT client loop to process network traffic and dispatch callbacks
client.loop_forever()
