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

app-run:
	export NEXT_PUBLIC_APP_ENV=dev; npm run dev

app-build:
	npm run build

app-start:
	npm run start

###################

build-push-kind:
	docker build --build-arg APP_ENV=dev_kind -t nft-marketplace .
	docker tag nft-marketplace:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-kind
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-kind

build-push-aws:
	docker build --build-arg APP_ENV=dev_aws -t nft-marketplace .
	docker tag nft-marketplace:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-aws
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/nft-marketplace:v0.1.0-aws

###################
