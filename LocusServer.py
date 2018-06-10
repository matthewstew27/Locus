from flask import Flask

import sys
import googlemaps
from wit import Wit
from Locus import Locus
import geopy
import googlemaps
from flask import Flask
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
	print(query)
	result = 'Locus could not locate intent. Please change your wording.'
	resp = client.message(query)
	if 'intent' not in resp['entities']:
		#locus.getNumDistinctVisits(37.4300,-122.1733) #37.4300 N, 122.1733 W
		return result
	else:
		intent = resp['entities']['intent']
		result = locus.processIntent(intent, resp)
	return 'chatting: {}'.format(result)

if __name__ == "__main__":
    app.run()