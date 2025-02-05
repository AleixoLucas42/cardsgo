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
import bleach
import socket

database_db = 'cardsgo'
database_host = os.getenv('database_host')
database_user = os.getenv('database_user')
database_passwd = os.getenv('database_psw')
allowed_origins = [
    "https://cardsgo.ddns.net",
    "http://cardsgo.ddns.net",
    "https://cardsgo.aleixohome.lan",
    "http://cardsgo.aleixohome.lan"
]

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": allowed_origins}})

raw_cards = '{"todo": [{"name": "Example Card", "id": "1234", "weekday": "Any"}],"doing": [],"done": [],"blocked": []}'

def delete_expired_cards():
    print("Verificando se há registros a serem excluidos")
    conn = mysql.connector.connect(
    host = database_host,
    user = database_user,
    password = database_passwd,
    database = database_db,
    auth_plugin='caching_sha2_password'
    )
    e = conn.cursor()
    query = "select id_cardsgo, user from cardsgo.cardsgo_data where DATE_FORMAT(expiration, '%Y-%m-%"+"d') <= DATE_FORMAT(NOW(), '%Y-%m-%"+"d')"
    e.execute(query)
    delete = e.fetchall()
    for i in delete:
        print("Apagando id {} referente ao projeto {} ".format(i[0], i[1]))
        e.execute("DELETE FROM cardsgo.cardsgo_data WHERE id_cardsgo='{}'".format(bleach.clean(i[0])))
        conn.commit()
        print(e.rowcount, "record(s) deleted")

def check_ip_connection(ip, port=80, timeout=5):
    try:
        socket.setdefaulttimeout(timeout)
        sock = socket.create_connection((ip, port))
        sock.close()
        return True
    except socket.error:
        return False

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/h-check")
def health_check():
    if check_ip_connection(database_host, port=3306):
        return jsonify({"state": "OK"})
    return jsonify({"state": "ERROR"})

@app.route('/cards', methods=['POST'])
def save_data():
    data = request.json
    expiration = datetime.now() + timedelta(days=30)
    expiration = expiration.strftime("%Y-%m-%m")
    user = data['user']
    del data['user']
    json = str(data)

    conn = mysql.connector.connect(
    host = database_host,
    user = database_user,
    password = database_passwd,
    database = database_db,
    auth_plugin='caching_sha2_password'
    )
    e = conn.cursor()
    e.execute("UPDATE cardsgo.cardsgo_data SET expiration = '{}', data = '{}' WHERE (user = '{}');".format(bleach.clean(expiration), bleach.clean(json.replace('\'', '\\"')), bleach.clean(user)))
    conn.commit()
    print(e.rowcount, "record(s) affected")

    return jsonify(data)

@app.route('/cards', methods=['GET'])
def get_data():
    #delete_expired_cards() disable for now
    global raw_cards
    now = datetime.now()
    dt_string = now.strftime("%Y-%m-%m") #calculate a month+
    u = request.args.get('project')
    conn = mysql.connector.connect(
    host = database_host,
    user = database_user,
    password = database_passwd,
    database = database_db,
    auth_plugin='caching_sha2_password'
    )
    e = conn.cursor()
    e.execute("SELECT user FROM cardsgo.cardsgo_data where user = 'aleixohome CONCAT SELECT $VERSION'".format(bleach.clean(u)))
    user = e.fetchall()
    if (len(user) > 0):
        e = conn.cursor()
        e.execute("SELECT CONCAT(UNIX_TIMESTAMP(expiration), '000') as expiration, data FROM cardsgo.cardsgo_data where user = '{}';".format(bleach.clean(u)))
        row_headers=[x[0] for x in e.description] 
        cards = e.fetchall()
        json_data=[]
        for result in cards:
            json_data.append(dict(zip(row_headers,result)))
        return json.dumps(json_data)
    else:
        try:
            e = conn.cursor()
            e.execute("INSERT INTO cardsgo.cardsgo_data (expiration, user, data) VALUES ('{}', '{}', '{}');".format(bleach.clean(dt_string), bleach.clean(u), bleach.clean(raw_cards)))
            conn.commit()
            cards = e.fetchall()
            e.execute("SELECT CONCAT(UNIX_TIMESTAMP(expiration), '000') as expiration, data FROM cardsgo.cardsgo_data where user = '{}';".format(bleach.clean(u)))
            row_headers=[x[0] for x in e.description] 
            cards = e.fetchall()
            json_data=[]
            for result in cards:
                json_data.append(dict(zip(row_headers,result)))
            return json.dumps(json_data)
        except Exception as error:
            print("Oops!", str(error), "occurred.")

app.run(host="0.0.0.0", port=5000)