FROM python:slim-buster

WORKDIR /app

ARG USERNAME=cardsgo
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME

USER $USERNAME

RUN pip install flask_cors mysql.connector flask mysql-connector-python flask-cors

COPY main.py .

EXPOSE 5000

ENTRYPOINT [ "python" ]
CMD [ "-u", "main.py" ]