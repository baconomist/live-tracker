import json

from flask import Flask, request

from server.src.database import Database
from server.src.datatypes.vehicle import Vehicle, VEHICLE_TYPE

app = Flask(__name__)
db = None


@app.route("/receive", methods=["POST"])
def receive_gps_data():
    request_data = json.loads(request.data.decode("ascii"))

    lat = float(request_data["gps_data"].split(",")[0])
    long = float(request_data["gps_data"].split(",")[1])
    vehicle_uid = request_data["vehicle"]

    vehicle = Vehicle.find(vehicle_uid)
    if vehicle is None:
        vehicle = Vehicle.init(vehicle_uid, VEHICLE_TYPE.TRUCK.value)

    locations = json.loads(vehicle.locations)
    locations.append([lat, long])
    vehicle.locations = json.dumps(locations)

    vehicle.save()

    return ""


@app.route("/barcode", methods=["POST"])
def barcode():
    barcodes = request.get_json()
    barcodes: dict

    for vehicle_uid in barcodes.keys():
        vehicle = Vehicle.find(vehicle_uid)
        if vehicle is None:
            vehicle = Vehicle.init(vehicle_uid, VEHICLE_TYPE.TRUCK.value)
            vehicle.save()

        packages = json.loads(vehicle.packages)

        for barcode in barcodes[vehicle_uid]:
            if barcode not in packages:
                packages.append(barcode)

            for vehicle in Vehicle.all():
                if vehicle.uid == vehicle_uid: continue
                if barcode in json.loads(vehicle.packages):
                    p = json.loads(vehicle.packages)
                    p: list
                    p.remove(barcode)
                    vehicle.packages = json.dumps(p)
                    vehicle.save()

        # Idk why, but I have to re-find the vehicle to correctly save data to it, maybe some db lock expires or something
        vehicle = Vehicle.find(vehicle_uid)
        vehicle.packages = json.dumps(packages)
        vehicle.save()

    return ""


@app.route("/get_package_location")
def get_package_location():
    package_number = request.get_json()["package_number"]

    for vehicle in Vehicle.all():
        for package in json.loads(vehicle.packages):
            if package == package_number:
                return json.loads(vehicle.locations)

if __name__ == "__main__":
    db = Database()
    app.run("142.1.2.242", 4200, debug=True)
