FROM python:3.8-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y git curl unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/asdf-vm/asdf.git ~/.asdf
RUN echo '\nsource $HOME/.asdf/asdf.sh' >> ~/.bashrc

RUN /root/.asdf/bin/asdf plugin-add terraform && /root/.asdf/bin/asdf plugin-add sops

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "/src/main.py" ]
