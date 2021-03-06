from flask import Flask

import sys
import googlemaps
from wit import Wit
from Locus import Locus
import geopy
import googlemaps
from flask import Flask, jsonify
from flask_cors import CORS

LOCATION_DATA_PATH = "data/LocationHistory.json"
access_token = "NMY3F7NH72IG6SKUC2KRHSBAIDRXMGKM"

client = Wit(access_token=access_token)
locus = Locus(LOCATION_DATA_PATH)

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return 'Running flask LocusServer!'

@app.route('/init')
def init():
	locus = Locus(LOCATION_DATA_PATH)
	return 'reinitialized locus: {}'.format(locus)

@app.route('/chat/<string:query>/')
def chat(query):
	query = "" if not query else query
	result = 'Locus could not locate intent. Please change your wording.'
	resp = client.message(query)
	if 'intent' not in resp['entities']:
		#locus.getNumDistinctVisits(37.4300,-122.1733) #37.4300 N, 122.1733 W
		return result
	else:
		intent = resp['entities']['intent']
		result = locus.processIntent(intent, resp)
		
	return jsonify(result)

@app.route('/favs/<int:numFavs>/')
def getFavs(numFavs):
	result = locus.getTopMostVisited(numFavs)
	return jsonify(result)

@app.route('/countries')
def getCountries():
	result = list(locus.getVisitedCountries())
	return jsonify(result)

@app.route('/states')
def getStates():
	result = list(locus.getVisitedStates())
	return jsonify(result)

@app.route('/cities')
def getCities():
	result = list(locus.getVisitedCities())
	return jsonify(result)


if __name__ == "__main__":
    app.run()