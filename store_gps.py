import json
from pymongo import MongoClient

#MongoDB connection details
client = MongoClient('mongodb+srv://shubhamkdutt7:ReE1g8NxASuf8vn3@smartmirror.iuebqix.mongodb.net/<dbname>?retryWrites=true&w=majority')
db = client['SmartMirror']
collection = db['GPS_Data']

def store_gps_data():
    try:
        with open('gps_data.json', 'r') as file:
            data = json.load(file)
            #Data insertion
            collection.insert_one(data)
            print('Data inserted successfully')
    except Exception as e:
        print(f'An error occurred: {e}')

if __name__ == '__main__':
    store_gps_data()

