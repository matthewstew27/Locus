import json
import datetime
import numpy as np
from datetime import date, time
from dateutil import parser
import pytz
from math import cos, asin, sqrt, pi
from geopy.geocoders import Nominatim
import googlemaps

class Locus:
	def __init__(self, path):
		print("Locus is ingesting your location data...")
		self.KEY_POINTS = {
			"TDX" : [37.420847,-122.170179],
			"COHO" : [37.424079,-122.170898],
			"MENLO" : [37.437868,-122.204417],
			"HOTPOT" :[37.761343,-122.430312],
			"NYC" : [40.686741, -73.993172]
			}
		self.geolocator = Nominatim() # not currently being used, but alternate to googlemaps API
		self.gmaps = googlemaps.Client(key='AIzaSyDhZMGliOJheydVX4jAZ2sBOfH3912hzFU')
		self.time_indexed_map = dict()
		self.location_indexed_map = dict() # haven't started work on this yet. Indexing by location will presumably be useful/necessary

		with open(path,"r") as f:
			self.data = json.load(f)["locations"]

		self.process_json()
		self.trips = self.calculateTrips()
		print("Locus clustered your movements into {} distinct visits".format(len(self.trips)))


	def parse_datetime(self,timestampMs):
		return datetime.datetime.fromtimestamp(int(timestampMs)/1000.0)

	def process_json(self):
		prev = None
		curr = None
		total = 0.0
		for location in self.data:
			formatted_date = self.parse_datetime(location["timestampMs"])
			cleaned_location = location.copy()
			cleaned_location["latitudeE7"] = location["latitudeE7"]/10000000.0
			cleaned_location["longitudeE7"] = location["longitudeE7"]/10000000.0
			cleaned_location["datetime"] = formatted_date
			# Don't add data point if moving
			if "velocity" not in cleaned_location or cleaned_location["velocity"] == 0:
				cleaned_location["velocity"] = -1
				cleaned_location["moving"] = False
				location = str(cleaned_location["latitudeE7"])+":"+str(cleaned_location["longitudeE7"])
				self.time_indexed_map[formatted_date] = cleaned_location
				self.location_indexed_map[location] = formatted_date

		print("Locus found {} data points".format(len(self.time_indexed_map.keys())))

	def getTimeIndexedEntry(self, key):
		return self.time_indexed_map[key]

	def getLatLon(self,entry):
		return entry["latitudeE7"],entry["longitudeE7"]

	def getVelocity(self,entry):
		return entry["velocity"]

	def getDatetime(self,entry):
		return entry["datetime"]

	def getLatLong(self, loc_str):
		latLong = loc_str.split(":")
		lat = float(latLong[0])
		lon = float(latLong[1])
		return (lat,lon)

	# Very naive and not really useful rn
	def calculateTrips(self):
		# should return a series of (start,end,location,duration) tuples
		keys = self.getTimeStamps()

		if len(keys) == 0:
			return []

		result = []

		prev_loc = self.getTimeIndexedEntry(keys[0])
		prev_start_time = self.getDatetime(prev_loc)
		prev_lat,prev_lon = self.getLatLon(prev_loc)
		for timestamp in keys:
			curr_loc = self.getTimeIndexedEntry(timestamp)
			velocity = self.getVelocity(curr_loc)
			delta = self.distance2(prev_loc,curr_loc)
			if delta >= 15.0:
				end = self.getDatetime(curr_loc)
				trip_to_enter = (prev_start_time, end, (prev_lat,prev_lon), end-prev_start_time)
				result += trip_to_enter
				prev_loc = curr_loc
				prev_start_time = end
				prev_lat,prev_lon = self.getLatLon(curr_loc)
		return result


	def distance(self,lat1, lon1, lat2, lon2):
		p = pi/180.0
		a = 0.5 - cos((lat2 - lat1) * p)/2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2
		return 12742 * asin(sqrt(a))

	def distance2(self,loc1, loc2):
		return self.distance(loc1["latitudeE7"],loc1["longitudeE7"],loc2["latitudeE7"],loc2["longitudeE7"])

	def distance_keypoints(self, K1, K2):
		kp1, kp2 = self.KEY_POINTS[K1], self.KEY_POINTS[K2]
		return self.distance(kp1[0],kp1[1],kp2[0],kp2[1])

	def getTimeStamps(self):
		return sorted(self.time_indexed_map.keys())

	def addKeyPoint(self,name,lat,lon):
		self.KEY_POINTS[name] = [lat,lon]

	def bsearch(self,arr,val):
		pass

	# given timestamp, returns the closest timestamp we have location data for
	def getClosestTimestamp(self, timestamp):
		arr = np.asarray(sorted(self.time_indexed_map.keys()))
		idx = (np.abs(list(arr-timestamp)).argmin())
		return arr[idx]

	def getLocByTime(self,timestamp):
		if timestamp in self.getTimeStamps(): return self.time_indexed_map[timestamp]
		nearest_timestamp = self.getClosestTimestamp(timestamp)
		return self.time_indexed_map[nearest_timestamp]

	# given (longitude, lattitude) tuple returns most recent visit timestamp
	def getNearestLoc(self, loc):
		lat, lon = loc[0],loc[1]
		target_address_readable = self.coordsToAddress(lat,lon)
		print(target_address_readable)
		timestamps = self.getTimeStamps()
		for ts in timestamps:
			entry = self.time_indexed_map[ts]
			curr_lat, curr_lon = entry["latitudeE7"],entry["longitudeE7"]
			# if distance is less than 0.03 KM, checks if 
			# human readable address is same as that being searched for
			if self.distance(loc[0],loc[1],curr_lat,curr_lon) < 0.03:
				curr_address_readable = self.coordsToAddress(curr_lat,curr_lon)
				if curr_address_readable == target_address_readable:
					print(" ============> ",curr_address_readable)
					return ts
				else:
					print("Close, but not close enough")
		return None

	def getTimeByLoc(self,lat,lon):
		return self.getNearestLoc((lat,lon)) 

	def getLastVisit(self,msg):
		print(msg)
		address = msg["entities"]["location"][0]["value"]
		print("Parsed the following location: {}".format(address))
		geocode_result = self.gmaps.geocode(address)[0]["geometry"]["location"]
		lat,lon = geocode_result["lat"],geocode_result["lng"]
		print("Reverse Geocoding identified the following lat and long: {}, {}".format(lat,lon))
		result = self.getTimeByLoc(lat,lon)
		if result:
			response = "\n\nAccording to Locus, you last visited {} on {}.\n".format(address, result)
		else:
			response = "\n\nLocus could not locate any past trips to {}.\n".format(address)
		return response

	def toTimestamp(self,month,day,year,hour=12,minute=00):
		d = date(year, month, day)
		t = time(hour,minute)
		return datetime.datetime.combine(d, t)

	def coordsToAddress(self, lat, lon):
		raw_result = self.gmaps.reverse_geocode((lat, lon)) #Google API
		# will likely fail when the result is empty or is missing this field
		# TODO: figure out a better way of retrieving formatted address, as google gives back multiple in ranked order. This just grabs the first.
		return raw_result[0]["formatted_address"]
		#return self.geolocator.reverse("{}, {}".format(lat,lon)) # goepy API, alternative to googlemaps

	def coordsToAddressEntry(self, raw_entry):
		return self.coordsToAddress(raw_entry["latitudeE7"],raw_entry["longitudeE7"])

	# This is where we process the messages retrieved by wit.ai
	def processIntent(self, intent, msg):
		result = "Nothing to see here"
		if intent == None:
			result = "I'm sorry. I couldn't understand your question. Please ask again."
		else:
			val = intent[0]["value"]
			if val == "aboutLastNight":
				result = self.aboutLastNight()
			elif val == "getLocation":
				result = self.getLocationGeneric(msg)
			elif val == "getLastVisit":
				result = self.getLastVisit(msg)
		return "{}".format(result)

	def getLocationGeneric(self,msg):
		raw_datetime = msg["entities"]["datetime"][0]["value"]
		formatted_date = parser.parse(raw_datetime).replace(tzinfo=None)
		closest_date = self.getClosestTimestamp(formatted_date)
		if closest_date != formatted_date:
			print("\nThe nearest timestamp we have location data for to {} is {}.".format(formatted_date,closest_date))
		raw_entry = self.getLocByTime(closest_date)
		return "\n\nAccording to Locus, on {} you were at {}.\n".format(closest_date, self.coordsToAddressEntry(raw_entry))

	def aboutLastNight(self):
		now = datetime.datetime.now()
		# treat lastNight as the day before today (i.e. 'now') at 8pm (20)
		lastNight = datetime.datetime(now.year, now.month, now.day-1, 20, 0, 0, 0)
		raw_entry = self.getLocByTime(lastNight)
		return "\n\nAccording to Locus, you spent time at {} last night.\n".format(self.coordsToAddressEntry(raw_entry))
