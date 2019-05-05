from orator import DatabaseManager
from orator import Model
from orator import Schema
from orator.schema import Blueprint

import os

from datatypes.vehicle import Vehicle

_databaseDir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
_databaseLocation = os.path.join(_databaseDir, "database.db")

# This is using sqlite
# For larger server apps with faster databases, setup MySql
# MySql lets you distribute data on other servers instead of just 1 file
config = {
    'sqlite': {
        'driver': 'sqlite',
        'database': _databaseLocation,
    }
}


# To "migrate" or change the database, look into migrations: https://orator-orm.com/docs/0.9/migrations.html
class Database(DatabaseManager):
    instance = None

    def __init__(self, *args, **kwargs):

        if not os.path.exists(_databaseDir):
            print("Database not yet created...")
            print("Creating database...")
            os.mkdir(_databaseDir)

        super(DatabaseManager, self).__init__(*args, **kwargs, config=config)

        Model.set_connection_resolver(self)

        self.schema = Schema(self)

        if not os.path.exists(_databaseLocation):
            self._create()

        Database.instance = self

    def _create(self):
        Vehicle.create_table(self.schema)

    def delete(self):
        print("Warning! Only use this if you are absolutely sure!")
        ans = input("Are you sure you want to delete the database? (y/n)")
        ans2 = input("Double check. Are you sure???!!? (y/n)")
        if ans == "y" and ans2 == "y":
            print("Deleting database...")
            self._delete()
        else:
            print("Exiting...")

    def _delete(self):
        self.schema.connection().drop(Vehicle.__table__)
