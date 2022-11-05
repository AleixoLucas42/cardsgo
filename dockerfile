FROM python:3.10.4-bullseye

WORKDIR /app

RUN pip install flask_cors mysql.connector flask mysql-connector-python

EXPOSE 80
EXPOSE 443

COPY . .

ENTRYPOINT [ "python" ]
CMD [ "-u", "main.py" ]