# bumblebuzz
BumbleBuzz marketplace app

# create .npmrc file
```
cat << EOF > .npmrc
@reach-now:registry=${CODEARTIFACT_REPOSITORY}
${CODEARTIFACT_REPOSITORY#https:}:always-auth=true
${CODEARTIFACT_REPOSITORY#https:}:_authToken=${CODEARTIFACT_AUTH_TOKEN}
EOF
```

# todo:
## download all external files and use them locally in all commands?
## ensure env variable ACCOUNT_ID is used in all commands


# save command in bash_profile

## save LBC_VERSION in bash_profile
echo 'export LBC_VERSION="v2.4.1"' >>  ~/.bash_profile

## save AWS_REGION in bash_profile
echo 'export AWS_REGION="us-east-1"' >>  ~/.bash_profile
<!-- echo 'export AWS_REGION="us-east-2"' >>  ~/.bash_profile -->

## save ACCOUNT_ID in bash_profile
echo 'export ACCOUNT_ID=$(aws sts get-caller-identity | jq -r ".Account")' >>  ~/.bash_profile

## save MASTER_ARN in bash_profile
echo 'export MASTER_ARN=$(aws kms describe-key --key-id alias/eksworkshop --query KeyMetadata.Arn --output text)' >>  ~/.bash_profile

## update terminal with latest bash_profile changes
source ~/.bash_profile


## create Ingress controller in EKS
<!-- curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.3.0/docs/install/iam_policy.json -->

eksctl utils associate-iam-oidc-provider \
	--region ${AWS_REGION} \
	--cluster bumblebuzz \
	--approve

aws iam create-policy \
	--policy-name AWSLoadBalancerControllerIAMPolicy \
	--policy-document file://~/aws/policy/AWSLoadBalancerControllerIAMPolicy.json

eksctl create iamserviceaccount \
  --cluster bumblebuzz \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --approve

kubectl apply -k github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master
kubectl get crd

helm repo add eks https://aws.github.io/eks-charts
helm upgrade -i aws-load-balancer-controller \
	eks/aws-load-balancer-controller \
	-n kube-system \
	--set clusterName=bumblebuzz \
	--set serviceAccount.create=false \
	--set serviceAccount.name=aws-load-balancer-controller \
	--set image.tag="${LBC_VERSION}"
kubectl -n kube-system rollout status deployment aws-load-balancer-controller

kubectl get deploy -n kube-system aws-load-balancer-controller -owide
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller -owide 


## Dynamo DB

aws iam create-policy \
	--policy-name EksDynamoDb \
	--policy-document file://~/aws/policy/EksDynamoDb.json

eksctl create iamserviceaccount \
  --cluster bumblebuzz \
  --namespace default \
  --name eks-dynamodb \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/EksDynamoDb \
  --override-existing-serviceaccounts \
  --approve


## External DNS

aws iam create-policy \
  --policy-name EksExternalDns \
  --policy-document file://~/aws/policy/EksExternalDns.json

eksctl create iamserviceaccount \
  --cluster bumblebuzz \
  --namespace default \
  --name external-dns \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/EksExternalDns \
  --override-existing-serviceaccounts \
  --approve


## SSL/TLS Certificate

### list
aws acm list-certificates --max-items 10

## describe
aws acm describe-certificate \
	--certificate-arn arn:aws:acm:${AWS_REGION}:${ACCOUNT_ID}:certificate/e749381f-8e05-4661-89f2-dec7f1dea099

### create
aws acm request-certificate \
  --domain-name bumblebuzz.io \
  --subject-alternative-names *.bumblebuzz.io \
  --validation-method DNS \
  --idempotency-token 1234 \
  --options CertificateTransparencyLoggingPreference=DISABLED

### delete
aws acm delete-certificate \
	--certificate-arn arn:aws:acm:${AWS_REGION}:${ACCOUNT_ID}:certificate/e749381f-8e05-4661-89f2-dec7f1dea099


## Auto scaling

aws autoscaling \
	describe-auto-scaling-groups \
	--query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='bumblebuzz']].[AutoScalingGroupName, MinSize, MaxSize,DesiredCapacity]" \
	--output table

### we need the ASG name
export ASG_NAME=$(aws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='bumblebuzz']].AutoScalingGroupName" --output text)

### increase max capacity up to 4
aws autoscaling \
	update-auto-scaling-group \
	--auto-scaling-group-name ${ASG_NAME} \
	--min-size 3 \
	--desired-capacity 3 \
	--max-size 4

### Check new values
aws autoscaling \
	describe-auto-scaling-groups \
	--query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='bumblebuzz']].[AutoScalingGroupName, MinSize, MaxSize,DesiredCapacity]" \
	--output table

eksctl utils associate-iam-oidc-provider \
	--region ${AWS_REGION} \
	--cluster bumblebuzz \
	--approve

aws iam create-policy   \
  --policy-name k8s-asg-policy \
  --policy-document file://~/repo/bumblebuzz/k8s-autoscaler/asg-policy.json

eksctl create iamserviceaccount \
	--name cluster-autoscaler \
	--namespace kube-system \
	--cluster bumblebuzz \
	--attach-policy-arn "arn:aws:iam::${ACCOUNT_ID}:policy/k8s-asg-policy" \
	--approve \
	--override-existing-serviceaccounts

kubectl -n kube-system describe sa cluster-autoscaler

kubectl apply -f ~/repo/bumblebuzz/k8s-autoscaler/cluster-autoscaler-autodiscover.yaml

kubectl -n kube-system \
	annotate deployment.apps/cluster-autoscaler \
	cluster-autoscaler.kubernetes.io/safe-to-evict="false"

### we need to retrieve the latest docker image available for our EKS version
export K8S_VERSION=$(kubectl version --short | grep 'Server Version:' | sed 's/[^0-9.]*\([0-9.]*\).*/\1/' | cut -d. -f1,2)
export AUTOSCALER_VERSION=$(curl -s "https://api.github.com/repos/kubernetes/autoscaler/releases" | grep '"tag_name":' | sed -s 's/.*-\([0-9][0-9\.]*\).*/\1/' | grep -m1 ${K8S_VERSION})

kubectl -n kube-system \
	set image deployment.apps/cluster-autoscaler \
	cluster-autoscaler=us.gcr.io/k8s-artifacts-prod/autoscaling/cluster-autoscaler:v${AUTOSCALER_VERSION}

kubectl -n kube-system logs -f deployment/cluster-autoscaler

