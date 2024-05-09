#include <TinyDHT.h>
#include <PubSubClient.h>
#include <Adafruit_MQTT.h>
#include <Adafruit_MQTT_Client.h>
#include <WiFiNINA.h>

// WiFi credentials
#define WLAN_SSID       "YOUR_SSID"
#define WLAN_PASS       "YOUR_PASSWORD"

// Adafruit IO credentials
#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883
#define AIO_USERNAME    "melvin2000x"
#define AIO_KEY         "aio_yaVX30NUsRfpC5efXQkSjrNtYa5s"

// Feeds
#define SENSOR_DATA_FEED   "/feeds/sensor-data"
#define COMMANDS_FEED      "/feeds/commands"

#define MOISTUREPIN A0
#define LIGHTPIN A1
#define DHTPIN 2
#define DHTTYPE DHT11
#define REDLEDPIN 8
#define YELLOWLEDPIN 9
#define GREENLEDPIN 10
#define PUMPPIN 7

DHT dht(DHTPIN, DHTTYPE);

unsigned long pumpStartTime = 0;
bool pumpIsOn = false;

WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);
Adafruit_MQTT_Subscribe commandsFeed = Adafruit_MQTT_Subscribe(&mqtt, COMMANDS_FEED);
Adafruit_MQTT_Publish sensorDataFeed = Adafruit_MQTT_Publish(&mqtt, SENSOR_DATA_FEED);

void connectToWiFi() {
    // Attempt to connect to WiFi, put your house wifi details here fabian
    Serial.print("Connecting to WiFi...");
    while (WiFi.begin(WLAN_SSID, WLAN_PASS) != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("Connected!");
}

void connectToMQTT() {
    // Attempt to connect to MQTT
    while (!mqtt.connected()) {
        Serial.print("Connecting to MQTT...");
        if (mqtt.connect()) {
            Serial.println("Connected!");
            mqtt.subscribe(&commandsFeed);
        } else {
            Serial.print("Failed, rc=");
            Serial.print(mqtt.connectErrorString(mqtt.connectError()));
            Serial.println(" retrying in 5 seconds.");
            delay(5000);
        }
    }
}

void setup() {
    // Initialize serial communication
    Serial.begin(115200);

    // Connect to WiFi
    connectToWiFi();

    // Initialize DHT sensor
    dht.begin();

    // Set up pins
    pinMode(REDLEDPIN, OUTPUT);
    pinMode(YELLOWLEDPIN, OUTPUT);
    pinMode(GREENLEDPIN, OUTPUT);
    pinMode(PUMPPIN, OUTPUT);

    digitalWrite(PUMPPIN, HIGH);
    digitalWrite(REDLEDPIN, LOW);
    digitalWrite(YELLOWLEDPIN, LOW);
    digitalWrite(GREENLEDPIN, HIGH);

    // Connect to MQTT broker
    connectToMQTT();

    Serial.println("Setup complete. Waiting for commands.");
}

void loop() {
    // Reconnect to MQTT if needed
    if (!mqtt.connected()) {
        connectToMQTT();
    }
    mqtt.processPackets(10000);

    // Read sensor data
    float moisture = analogRead(MOISTUREPIN);
    float light = analogRead(LIGHTPIN);
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    // Publish sensor data
    String payload = "M:" + String(moisture) + ",L:" + String(light) + ",H:" + String(humidity) + ",T:" + String(temperature);
    sensorDataFeed.publish(payload.c_str());

    // Handle pump timer
    if (pumpIsOn && millis() - pumpStartTime >= 10000) {
        digitalWrite(PUMPPIN, HIGH);
        pumpIsOn = false;
        digitalWrite(YELLOWLEDPIN, LOW);
    }

    // Read serial commands and execute accordingly
    String data = Serial.readStringUntil('\n');
    data.trim();

    if (data.length() > 0) {
        Serial.print("Received Command: ");
        Serial.println(data);

        if (data == "ALARM ON") {
            digitalWrite(REDLEDPIN, HIGH);
            digitalWrite(GREENLEDPIN, LOW);
        } else if (data == "ALARM OFF") {
            digitalWrite(REDLEDPIN, LOW);
            digitalWrite(GREENLEDPIN, HIGH);
        }

        if (data == "PUMP ON" && !pumpIsOn) {
            digitalWrite(PUMPPIN, LOW);
            digitalWrite(YELLOWLEDPIN, HIGH);
            pumpIsOn = true;
            pumpStartTime = millis();
        } else if (data == "PUMP OFF" && pumpIsOn) {
            digitalWrite(PUMPPIN, HIGH);
            digitalWrite(YELLOWLEDPIN, LOW);
            pumpIsOn = false;
        }
    }

    delay(1000);
}
