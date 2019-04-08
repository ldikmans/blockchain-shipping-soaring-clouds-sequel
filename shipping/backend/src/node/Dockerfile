#  Node based on Debian GNU/Linux 9 -must be used as kafka-avro errors with non-debian based distros
FROM node:8

# Create Backenddirectory and copy source to it
RUN mkdir -p /usr/src/api
COPY . /usr/src/api

# Set working dir
WORKDIR /usr/src/api

#Install kafka-avro dependencies e.g. Cyrus SASL, etc
RUN apt-get update && apt-get install -y \
curl \
build-essential \
groff-base \
libdb-dev \
libss1.0.0 libssl-dev libiodbc2 libiodbc2-dev libsasl2-2 libsasl2-dev \
sasl2-bin

############ Install kafka-avro and dependenies
RUN npm install express --save
RUN npm install body-parser --save
RUN npm install request-promise --save
RUN npm install request --save
RUN npm install express --save
RUN npm install cors
RUN npm install kafka-avro --save

############
RUN npm install

EXPOSE 8070
CMD [ "npm", "start" ]
