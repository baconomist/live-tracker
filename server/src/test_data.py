import json
import requests
import time

data = {"gps_data": "10.55115,79.664213", "vehicle": "TRUCK1"}

while True:
    try:
        requests.post("http://142.1.2.242:4200/receive", data=json.dumps(data))
        requests.post("http://142.1.2.242:4200/barcode", json={'TRUCK1': ["UN879927127CN", "UN879927127CF", "UN879927127CG"]})
    except Exception as e:
        print(e)
    time.sleep(5)  # Run every second
