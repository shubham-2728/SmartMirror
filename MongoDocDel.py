#Program to delete documents in MongoDB. Was used during testing phase when several API calls were made

from pymongo import MongoClient

mongo_uri = 'mongodb+srv://shubhamkdutt7:ReE1g8NxASuf8vn3@smartmirror.iuebqix.mongodb.net/'

# Connect to the MongoDB client
client = MongoClient(mongo_uri)

# Select the database
db = client['SmartMirror']

# Select the collection
collection = db['Reverse Geo API calls']  # Replace with your collection name


# Find up to 50 documents to delete
documents_to_delete = collection.find().limit(60)


# Extract the _id of these documents
ids_to_delete = [doc['_id'] for doc in documents_to_delete]

# Delete documents with these _id values
result = collection.delete_many({'_id': {'$in': ids_to_delete}})

# Print the result of the deletion
print(f'Deleted {result.deleted_count} documents.')

# Close the MongoDB connection
client.close()
