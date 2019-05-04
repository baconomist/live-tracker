import json

from flask import Flask, request

from server.src.database import Database

app = Flask(__name__)
db = None


@app.route("/receive", methods=["POST"])
def receive_gps_data():
    request_data = json.loads(request.data.decode("ascii"))
    lat = float(request_data["gps_data"].split(",")[0])
    long = float(request_data["gps_data"].split(",")[1])
    print(lat, long)
    return ""


@app.route("/barcode", methods=["POST"])
def barcode():
    barcodes = request.get_json()
    print(barcodes)
    return ""


if __name__ == "__main__":
    db = Database()
    app.run("127.0.0.1", 4200, debug=True)
