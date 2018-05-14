# Locus
A virtual assistant for your google location data


Locus.py contains the main logic for processing, storing, and querying the location data.
LocusBot.py contains an instance of a wit.ai chatbot that is hooked up to a simple wit.ai app set up using the wit.ai console. 
Once the wit.ai bot identifies an incoming message which contains information regarding the relevant query,
it hands it off to a Locus instance to process that query and print out the result.
