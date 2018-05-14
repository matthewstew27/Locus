from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import sys
import googlemaps
from wit import Wit
from Locus import Locus
import geopy

LOCATION_DATA_PATH = "data/LocationHistory.json"
access_token = "NMY3F7NH72IG6SKUC2KRHSBAIDRXMGKM"

client = Wit(access_token=access_token)
locus = Locus(LOCATION_DATA_PATH)

resp = client.message('Where was I last night?')

if 'intent' not in resp['entities']:
	print ("Locus could not locate intent. Please change your wording.")
else:
	intent = resp['entities']['intent']
	result = locus.processIntent(intent, resp)
	print(result)
#client.interactive()
