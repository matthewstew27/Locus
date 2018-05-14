# Locus
A virtual assistant for your google location data

# About
Locus.py contains the main logic for processing, storing, and querying the location data.
LocusBot.py contains an instance of a wit.ai chatbot that is hooked up to a simple wit.ai app set up using the wit.ai console. 
Once the wit.ai bot identifies an incoming message which contains information regarding the relevant query,
it hands it off to a Locus instance to process that query and print out the result.

# Set up
Locus currently uses default location data. To use it with your own, download your timeline data and place the "Location History.json" file into "data" directory. Then edit the file name so that it doesn't have a space in the middle: "Location History.json" -> "LocationHistory.json".

# Usage
To launch Locus, run "python LocusBot.py".
