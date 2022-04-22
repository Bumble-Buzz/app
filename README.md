# bumblebuzz
BumbleBuzz marketplace


## save command in bash_profile
echo 'export LBC_VERSION="v2.3.0"' >>  ~/.bash_profile
~/.bash_profile


## create Ingress controller in EKS
<!-- curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.3.0/docs/install/iam_policy.json -->

eksctl utils associate-iam-oidc-provider \
	--region ${AWS_REGION} \
	--cluster nft-marketplace \
	--approve

aws iam create-policy \
	--policy-name AWSLoadBalancerControllerIAMPolicy \
	--policy-document file://~/aws/policy/AWSLoadBalancerControllerIAMPolicy.json

eksctl create iamserviceaccount \
  --cluster nft-marketplace \
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
	--set clusterName=nft-marketplace \
	--set serviceAccount.create=false \
	--set serviceAccount.name=aws-load-balancer-controller \
	--set image.tag="${LBC_VERSION}"
kubectl -n kube-system rollout status deployment aws-load-balancer-controller


## Dynamo DB

aws iam create-policy \
	--policy-name EksDynamoDb \
	--policy-document file://~/aws/policy/EksDynamoDb.json

eksctl create iamserviceaccount \
  --cluster nft-marketplace \
  --namespace default \
  --name eks-dynamodb \
  --attach-policy-arn arn:aws:iam::817932929274:policy/EksDynamoDb \
  --override-existing-serviceaccounts \
  --approve


## External DNS

aws iam create-policy \
  --policy-name EksExternalDns \
  --policy-document file://~/aws/policy/EksExternalDns.json

eksctl create iamserviceaccount \
  --cluster nft-marketplace \
  --namespace default \
  --name external-dns \
  --attach-policy-arn arn:aws:iam::817932929274:policy/EksExternalDns \
  --override-existing-serviceaccounts \
  --approve


## SSL/TLS Certificate

### list
aws acm list-certificates --max-items 10

## describe
aws acm describe-certificate \
	--certificate-arn arn:aws:acm:us-east-1:817932929274:certificate/20b417b0-927c-4b59-96e5-f0ad4437f732

### create
aws acm request-certificate \
  --domain-name bumblebuzz.io \
  --subject-alternative-names *.bumblebuzz.io \
  --validation-method DNS \
  --idempotency-token 1234 \
  --options CertificateTransparencyLoggingPreference=DISABLED

### delete
aws acm delete-certificate \
	--certificate-arn arn:aws:acm:us-east-1:817932929274:certificate/20b417b0-927c-4b59-96e5-f0ad4437f732


## Auto scaling

aws autoscaling \
	describe-auto-scaling-groups \
	--query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='nft-marketplace']].[AutoScalingGroupName, MinSize, MaxSize,DesiredCapacity]" \
	--output table

### we need the ASG name
export ASG_NAME=$(aws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='nft-marketplace']].AutoScalingGroupName" --output text)

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
	--query "AutoScalingGroups[? Tags[? (Key=='eks:cluster-name') && Value=='nft-marketplace']].[AutoScalingGroupName, MinSize, MaxSize,DesiredCapacity]" \
	--output table

eksctl utils associate-iam-oidc-provider \
	--region ${AWS_REGION} \
	--cluster nft-marketplace \
	--approve

aws iam create-policy   \
  --policy-name k8s-asg-policy \
  --policy-document file://~/repo/bumblebuzz/k8s-autoscaler/asg-policy.json

eksctl create iamserviceaccount \
	--name cluster-autoscaler \
	--namespace kube-system \
	--cluster nft-marketplace \
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

