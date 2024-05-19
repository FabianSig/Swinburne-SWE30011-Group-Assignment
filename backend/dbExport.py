import paho.mqtt.client as mqtt

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
    print(f"Topic: {msg.topic}\nMessage: {msg.payload.decode()}")

# Create an MQTT client instance
client = mqtt.Client()

# Assign the on_connect and on_message callbacks
client.on_connect = on_connect
client.on_message = on_message

# Set the broker address and port
broker_address = "broker.hivemq.com"  # Use your broker address if different
port = 1883  # Default MQTT port

# Connect to the broker
client.connect(broker_address, port, 60)

# Start the MQTT client loop to process network traffic and dispatch callbacks
client.loop_forever()
