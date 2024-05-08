#include <TinyDHT.h>

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

void setup() {
  Serial.begin(9600);
  dht.begin();

  pinMode(REDLEDPIN, OUTPUT);
  pinMode(YELLOWLEDPIN, OUTPUT);
  pinMode(GREENLEDPIN, OUTPUT);
  pinMode(PUMPPIN, OUTPUT);

  digitalWrite(PUMPPIN, HIGH);

  Serial.println("Setup complete. Waiting for commands.");
}

void loop() {
  float moisture = analogRead(MOISTUREPIN);
  float light = analogRead(LIGHTPIN);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  Serial.print("M:");
  Serial.print(moisture);
  Serial.print(", L:");
  Serial.print(light);
  Serial.print(", H:");
  Serial.print(humidity);
  Serial.print(", T:");
  Serial.print(temperature);
  Serial.println();

  if (pumpIsOn && millis() - pumpStartTime >= 10000) {
    digitalWrite(PUMPPIN, HIGH);
    pumpIsOn = false;
    digitalWrite(YELLOWLEDPIN, LOW);
  }

    String data = Serial.readStringUntil('\n');
    data.trim();

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
