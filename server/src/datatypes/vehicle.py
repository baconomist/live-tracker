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

    @staticmethod
    def create_table(schema: Schema):
        with schema.connection().create(Vehicle.__table__) as table:
            table: Blueprint

            table.string("uid").unique().primary()
            table.string("type")
            table.json("packages")

    # No __init__ method allowed in model, use this instead
    @staticmethod
    def init(uid: str, type: VEHICLE_TYPE):
        instance = Vehicle()
        instance.uid = uid
        instance.type = type
        return instance
