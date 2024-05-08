import serial
import mariadb
from datetime import datetime
import time
import sys

ser = serial.Serial('/dev/ttyACM0', 9600)
insert_stmt = 'INSERT INTO watering_system_data(time, moisture_levels, light_levels, temperature_levels, humidity_levels) VALUES(%s, %s, %s, %s, %s)'
select_stmt = 'SELECT type, operator, threshold, statement_true, statement_false FROM watering_system_condition'

try:
    conn = mariadb.connect(user="fabian", password="fabian", host="127.0.0.1", port=3306, database="Arduino")
except mariadb.Error as e:
    print("There is an issue connecting to db")
    sys.exit(1)

cur = conn.cursor()
last_commands_sent = {}  # Dictionary to store the last command sent for each type

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

        cur.execute(insert_stmt, (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), moisture, light, temperature, humidity))
        conn.commit()

        sensor_values = {
            'moisture': float(moisture),
            'temperature': float(temperature),
            'humidity': float(humidity),
            'light': float(light)
        }

        cur.execute(select_stmt)
        for (alarm_type, condition, threshold, statement_true, statement_false) in cur:
            if alarm_type in sensor_values:
                condition_string = f"{sensor_values[alarm_type]} {condition} {float(threshold)}"
                if eval(condition_string):
                    if last_commands_sent.get(alarm_type) != statement_true:
                        print("Pi: " + statement_true)
                        ser.write((statement_true + "\n").encode())
                        last_commands_sent[alarm_type] = statement_true
                else:
                    if last_commands_sent.get(alarm_type) != statement_false:
                        print("Pi: " + statement_false)
                        ser.write((statement_false + "\n").encode())
                        last_commands_sent[alarm_type] = statement_false
            else:
                print(f"Unknown sensor type: {alarm_type}")
