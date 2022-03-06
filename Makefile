install:
	npm install

install-clean:
	rm -fr package-lock.json || true
	rm -fr node_modules || true
	npm install
	npm i --package-lock-only

package-lock:
	rm -fr package-lock.json || true
	npm i --package-lock-only

###################

dev:
	export NEXT_PUBLIC_APP_ENV=dev; npm run dev

devStart:
	export NEXT_PUBLIC_APP_ENV=dev && npm run build && npm run start

build:
	npm run build

start:
	npm run start

###################

dynamodb:
	docker run -p 8000:8000 amazon/dynamodb-local

###################

build-push-kind:
	docker build --build-arg APP_ENV=dev_kind --build-arg NEXTAUTH_URL='http://localhost:80' -t nft-marketplace .
	docker tag nft-marketplace:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-kind
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-kind

build-push-aws:
	docker build --build-arg APP_ENV=dev_aws --build-arg NEXTAUTH_URL=http://localhost:80 -t nft-marketplace .
	docker tag nft-marketplace:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-aws
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-aws

build-push-geth-kind:
	cd geth && docker build --build-arg ACCOUNT_PASSWORD=5uper53cr3t --build-arg ACCOUNT_PRIVATE_KEY=6f016e74365bbda42f5b8764e6cf1616a734f386c7732414c573f97b8b8ec1d2 --no-cache -t geth-client .
	docker tag geth-client:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/geth-client:v0.1.0-kind
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/geth-client:v0.1.0-kind

###################
