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

push:
	docker build \
	--build-arg APP_ENV=dev_aws \
	--build-arg NEXTAUTH_URL=http://localhost:80 \
	-t bumblebuzz . --no-cache
	docker tag bumblebuzz:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/bumblebuzz:v0.1.1
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/bumblebuzz:v0.1.1

push-prod:
	docker build \
	--build-arg APP_ENV=prod \
	--build-arg NEXTAUTH_URL=http://localhost:80 \
	-t bumblebuzz . --no-cache
	docker tag bumblebuzz:latest 817932929274.dkr.ecr.us-east-1.amazonaws.com/bumblebuzz:v0.1.0
	docker push 817932929274.dkr.ecr.us-east-1.amazonaws.com/bumblebuzz:v0.1.0

###################
