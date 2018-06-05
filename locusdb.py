import web
import sys
from datetime import datetime
db = web.database(dbn='sqlite',
        db='Locus.db' #TODO: add your SQLite database filename
    )

######################HELPER METHODS######################
def string_to_time(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')

# Enforce foreign key constraints
def enforceForeignKey():
    db.query('PRAGMA foreign_keys = ON')

# initiates a transaction on the database
def transaction():
    return db.transaction()
# 
def getLocationByTime(time):
    query_string = 'select * from Locations where Time > $time_upper AND Tim < $time_lower'
    result = query(query_string, {'itemID': item_id})
    if not result:
        return ''
    return result[0]

def add_location(location):
    query_string2 = 'insert into Locations values ($time, $latt, $long, $velocity, $moving)'
    try:
        db.query(query_string2, {'time': location["timestampMs"], 'latt': location["latitudeE7"], 'long': location["longitudeE7"], 'velocity': location["velocity"], 'moving': location["moving"]})
    except Exception as e:
        return e
    return ""

# wrapper method around web.py's db.query method
def query(query_string, vars = {}):
    return list(db.query(query_string, vars))

#####################END HELPER METHODS#####################

#TODO: additional methods to interact with your database,
# e.g. to update the current time
