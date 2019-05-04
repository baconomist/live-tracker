import json

from enum import Enum

from orator import Model, Schema

from orator.schema import Blueprint


class VEHICLE_TYPE(Enum):
    TRUCK = 1
    SHIP = 2
    PLANE = 4


class Vehicle(Model):
    __table__ = "vehicles"
    __primary_key__ = "uid"
    __guarded__ = ["uid"]

    __timestamps__ = ["created_at", "updated_at"]

    @staticmethod
    def create_table(schema: Schema):
        with schema.connection().create(Vehicle.__table__) as table:
            table: Blueprint

            table.string("uid").unique().primary()
            table.integer("type")
            table.json("locations")
            table.json("packages")

            # Required by default, you can disable these columns, check orator docs
            table.timestamp("created_at")
            table.timestamp("updated_at")

    # No __init__ method allowed in model, use this instead
    @staticmethod
    def init(uid: str, type: VEHICLE_TYPE):
        instance = Vehicle()
        instance.uid = uid
        instance.type = type
        instance.locations = json.dumps([])
        instance.packages = json.dumps([])
        return instance
