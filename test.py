from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import networkx as nx
import pickle
import json
import random

app = Flask(__name__)
CORS(app)  # Enable CORS on the entire app

@app.route('/api/random', methods=['GET'])
def get_random():
    return jsonify(endpoints)

@app.route('/api/neighbors', methods=['GET'])
def get_data():
    return jsonify(neighbors)

if __name__ == '__main__':
    with open('sourceTarget.json', 'r') as f:
        endpoints = json.load(f)
    with open('neighbors.json', 'r') as f:
        neighbors = json.load(f)
    app.run(debug=True)
