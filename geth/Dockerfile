FROM ethereum/client-go:v1.10.16

ARG ACCOUNT_PASSWORD
ARG ACCOUNT_PRIVATE_KEY

COPY genesis.json /tmp

RUN geth init /tmp/genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > /tmp/password \
    && echo ${ACCOUNT_PRIVATE_KEY} > /tmp/privatekey \
    && geth account import --password /tmp/password /tmp/privatekey \
    && rm -f /tmp/password \
    && rm -f /tmp/privatekey

ENTRYPOINT ["geth"]

# build
# docker build --build-arg ACCOUNT_PASSWORD=5uper53cr3t --build-arg ACCOUNT_PRIVATE_KEY=6f016e74365bbda42f5b8764e6cf1616a734f386c7732414c573f97b8b8ec1d2 --no-cache -t geth-client .

#run
# docker run -d --rm -p 8545:8545 --name geth geth-client:latest --allow-insecure-unlock --http --http.addr="0.0.0.0" --http.api="eth,web3,net,admin,personal" --http.corsdomain="*" --mine --miner.threads=1 --networkid=${NETWORK_ID} --netrestrict="172.16.254.0/28"
