#  Node based on Debian GNU/Linux 8 -must be used as kafka-avro errors with non-debian based distros
FROM node

# Create Subscriber Service directory and copy source to it
RUN mkdir -p /usr/src/ms
COPY . /usr/src/ms
WORKDIR /usr/src/ms
RUN rm -rf node_modules

#The following was added to fix the error “W: Failed to fetch http://deb.debian.org/debian/dists/jessie-updates/InRelease ....”
#The fix was found here: https://unix.stackexchange.com/questions/508724/failed-to-fetch-jessie-backports-repository
RUN echo "deb [check-valid-until=no] http://cdn-fastly.deb.debian.org/debian jessie main" > /etc/apt/sources.list.d/jessie.list
RUN echo "deb [check-valid-until=no] http://archive.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/jessie-backports.list
RUN sed -i '/deb http:\/\/deb.debian.org\/debian jessie-updates main/d' /etc/apt/sources.list
RUN apt-get -o Acquire::Check-Valid-Until=false update

#Install kafka-avro dependencies e.g. Cyrus SASL, etc
RUN apt-get update && apt-get install -y \
curl \
build-essential \
groff-base \
libdb-dev \
libssl1.0.0 libssl-dev libiodbc2 libiodbc2-dev libsasl2-2 libsasl2-dev \
sasl2-bin

############ Install kafka-avro and dependenies
# Install kafka-avro
RUN npm install express --save
RUN npm install body-parser --save
RUN npm install kafka-avro --safe
RUN npm install

# start command
CMD [ “npm”, “start” ]
