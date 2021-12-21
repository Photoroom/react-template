import tensorflow as tf
from keras import Sequential
import keras
import numpy as np
import cv2

import blend_modes
from flask import Flask
from flask import request
from flask import jsonify
import base64
from flask_cors import CORS
import uuid
from flask import send_from_directory
import time
import os

model = keras.models.load_model('multi-keras.h5')

app = Flask(__name__)
CORS(app)

def add_pink_hair(original):
    SIZE = 192
    original = original / 255.0
    img = cv2.resize(original, (SIZE, SIZE))
    global graph
    with graph.as_default():
        preds = model.predict(np.array([img]))
    mask = preds[0][:, :, 1]
    mask = cv2.resize(mask, (original.shape[1], original.shape[0]))
    pink_image = np.zeros_like(original)
    pink_image[:, :] = (255, 105, 180)
    #     mask = np.maximum(mask - 0.1, 0.0)
    pink_image = pink_image[:, :, ::-1] * np.expand_dims(mask, -1) / 255.0

    img_alpha = cv2.cvtColor(np.array(original * 255, dtype=np.uint8), cv2.COLOR_RGB2RGBA) / 255.0

    pink_alpha = cv2.cvtColor(np.array(pink_image * 255, dtype=np.uint8), cv2.COLOR_RGB2RGBA) / 255.0

    combined = blend_modes.lighten_only(img_alpha, pink_alpha, opacity=1.0)
    return combined, pink_image




@app.route('/upload', methods=['POST'])
def upload():
    data = request.get_json()

    if data is None:
        return jsonify({'error': 'No valid request body, json missing!'})
    else:

        return process_upload(data)


@app.route('/images/<path:path>')
def send_js(path):
    return send_from_directory('images', path)


@app.route('/recent_images')
def view_recent_images():
    """
    Endpoints returning recently uploaded images from the community
    """
    paths = get_most_recent_photos()
    
    return jsonify({'paths': paths}), 200


def readb64(encoded_data):
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def process_upload(data):
    img_data = data['b64_img'] if 'b64_img' in data else None

    if img_data is None:
        return jsonify({'error': 'No valid request body, image missing!'})

    img = readb64(img_data.split(',')[1])

    if img is None:
        return jsonify({'error': 'No valid request body, invalid image'})

    combined, _ = add_pink_hair(img)

    combined = (combined * 255.0).astype(np.uint8)
    # We are using the timestamp ms as a sorting key to show the post recent
    # pictures taken to our frontend, and we use a uuid4 as a unique identifier
    path = 'images/{}{}.jpg'.format(time.time(), uuid.uuid4())
    cv2.imwrite(path, combined)

    return jsonify({'path': '/' + path})

    
def get_most_recent_photos(directory='images', count=10):
    files = [os.path.join(directory, f) for f in os.listdir('images') if os.path.isfile(os.path.join('images', f))]
    files.sort(reverse=True)
    return files[0:count]
    


graph = None
graph = tf.get_default_graph()
if __name__ == "__main__":
    graph = tf.get_default_graph()
    app.run(host='0.0.0.0', port=8000)
