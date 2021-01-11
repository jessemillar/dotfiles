# Azure

`azuredeploy.json` in the root of the repo is also Azure-related but has to be at root for the "Deploy to Azure" button to work.

## Kubernetes

In certain Microsoft Azure subscriptions/environments, it's desirable to deploy your dotfiles in a container running on a Kubernetes node. To accomplish this, follow these steps:

> Note: If you're accessing a Kubernetes cluster from a Windows machine, I recommend using [Chocolatey](https://chocolatey.org/) to install [Git Bash](https://git-scm.com/), [`az` CLI](https://stackoverflow.com/a/47085659), and [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-on-windows-using-chocolatey-or-scoop).

1. Creates a Kubernetes cluster in your Azure subscription of choice
1. Get access to the cluster
	```
	az aks get-credentials --name MyManagedCluster --resource-group MyResourceGroup
	```
1. Deploy the dotfiles container
	```
	kubectl apply -f kubernetes-dotfiles.yaml
	```
1. Access the container's CLI
	```
	kubectl exec --stdin --tty $(kubectl get pods --selector=app=dotfiles -o jsonpath='{.items[0].metadata.name}') zsh
	```
