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
query = raw_input("\n\n> Hi! I'm Locus, your virtual assistant for all things location.\n> Ask me things like \" Where was I last night?\" or \" Where was I Febraury 2nd at 4:15pm?\"\n> ")
while query != "quit":
	resp = client.message(query)

	if 'intent' not in resp['entities']:
		print ("\n\nLocus could not locate intent. Please change your wording.")
	else:
		intent = resp['entities']['intent']
		result = locus.processIntent(intent, resp)
		print(result)
	query = raw_input("\n\n> What else can I tell you?\n> ")
#client.interactive()
