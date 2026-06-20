# 1. Atualizado para 3.11 (resolve o erro do importlib e é mais rápido)
FROM python:3.11-slim-bullseye

WORKDIR /app

ARG USERNAME=cardsgo
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME

USER $USERNAME

# 2. Garante que os pacotes instalados pelo usuário não-root sejam achados
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY templates/index.html /app/templates/index.html
COPY static/index.js /app/static/index.js

EXPOSE 5000

ENTRYPOINT [ "python" ]
CMD [ "-u", "main.py" ]
