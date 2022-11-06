#!/usr/bin/env python
# encoding: utf-8
from datetime import datetime
import json
import mysql.connector
from flask_cors import CORS
from datetime import datetime  
from datetime import timedelta  
from flask import Flask, request, jsonify, render_template
import os

database_db = 'cardsgo'
database_host = os.getenv('database_host')
database_user = os.getenv('database_user')
database_passwd = os.getenv('database_psw')

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "http://cardsgo.ddns.net"}})

raw_cards = '{"todo": ["Example card"],"doing": [],"done": [],"blocked": []}'

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/cards', methods=['POST'])
def saveData():
    data = request.json
    expiration = datetime.now() + timedelta(days=30)
    user = data['user']
    del data['user']
    json = str(data)

    conn = mysql.connector.connect(
    host = database_host,
    user = database_user,
    password = database_passwd,
    database = database_db,
    auth_plugin='mysql_native_password'
    )
    e = conn.cursor()
    e.execute("UPDATE cardsgo.cardsgo_data SET expiration = '{}', data = '{}' WHERE (user = '{}');".format(expiration, json.replace('\'', '\\"'), user))
    conn.commit()
    print(e.rowcount, "record(s) affected")

    return jsonify(data)

@app.route('/cards', methods=['GET'])
def getData():
    global raw_cards
    now = datetime.now()
    dt_string = now.strftime("%Y-%m-%m %H:%M:%S") #calculate a month+
    u = request.args.get('project')
    conn = mysql.connector.connect(
    host = database_host,
    user = database_user,
    password = database_passwd,
    database = database_db,
    auth_plugin='mysql_native_password'
    )
    e = conn.cursor()
    e.execute("SELECT user FROM cardsgo.cardsgo_data where user = '{}'".format(u))
    user = e.fetchall()
    if (len(user) > 0):
        e = conn.cursor()
        e.execute("SELECT CONCAT(UNIX_TIMESTAMP(expiration), '000') as expiration, data FROM cardsgo.cardsgo_data where user = '{}';".format(u))
        row_headers=[x[0] for x in e.description] 
        cards = e.fetchall()
        json_data=[]
        for result in cards:
            json_data.append(dict(zip(row_headers,result)))
        return json.dumps(json_data)
    else:
        try:
            e = conn.cursor()
            e.execute("INSERT INTO cardsgo.cardsgo_data (expiration, user, data) VALUES ('{}', '{}', '{}');".format(dt_string, u, raw_cards))
            conn.commit()
            cards = e.fetchall()
            e.execute("SELECT CONCAT(UNIX_TIMESTAMP(expiration), '000') as expiration, data FROM cardsgo.cardsgo_data where user = '{}';".format(u))
            row_headers=[x[0] for x in e.description] 
            cards = e.fetchall()
            json_data=[]
            for result in cards:
                json_data.append(dict(zip(row_headers,result)))
            return json.dumps(json_data)
        except Exception as error:
            print("Oops!", str(error), "occurred.")

app.run(host="0.0.0.0", port=5000)