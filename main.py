from flask import Flask, request

app = Flask(__name__)


@app.route("/receive", methods=["POST"])
def receive_gps_data():
    request_data = request.data.decode("ascii")
    lat = float(request_data.split(",")[0])
    long = float(request_data.split(",")[1])
    print(lat, long)
    return ""


@app.route("/barcode", methods=["POST"])
def barcode():
    barcodes = request.get_json()
    print(barcodes)
    return ""


if __name__ == "__main__":
    app.run("192.168.2.235", 4200, debug=True)
