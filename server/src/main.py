import json

import math
from flask import Flask, request, jsonify, render_template

from database import Database
from datatypes.vehicle import Vehicle, VEHICLE_TYPE

app = Flask(__name__, static_folder="../front_end/static", template_folder="../front_end/")
db = None


@app.route("/")
@app.route("/index.html")
def index():
    return render_template("index.html")


@app.route("/package-tracker")
@app.route("/package-tracker.html")
def package_tracker():
    return render_template("map.html")


def remove_extra_locations(locations):
    h = 0
    locations_to_remove = []
    for i in range(len(locations))[1::]:
        dx = locations[i][0] - locations[i - 1][0]
        dy = locations[i][1] - locations[i - 1][1]
        h += math.sqrt(dx*dx + dy*dy)
        # If h >= 50km
        if h*111.699 >= 50:
            h = 0
            continue
        locations_to_remove.append(locations[i])

    for loc in locations_to_remove:
        locations.remove(loc)

    return locations



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

    locations = remove_extra_locations(locations)

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


@app.route("/get_package", methods=["POST"])
def get_package_location():
    json_data = request.get_json(force=True)
    package_number = json_data["package_number"]

    locs = []
    status = False
    for vehicle in Vehicle.all():
        for package in json.loads(vehicle.packages):
            if package == package_number:
                status = True
                locs = json.loads(vehicle.locations)

    print(package_number, locs)

    return jsonify(status=status, data=dict(number=package_number, locations=locs))


if __name__ == "__main__":
    db = Database()
    app.run("142.1.2.242", 4200, debug=True)
