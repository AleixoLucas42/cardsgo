FROM python:3.9.18-bullseye

WORKDIR /app

ARG USERNAME=cardsgo
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME

USER $USERNAME

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY main.py .
COPY templates/index.html /app/templates/index.html
COPY static/index.js /app/static/index.js

EXPOSE 5000

ENTRYPOINT [ "python" ]
CMD [ "-u", "main.py" ]