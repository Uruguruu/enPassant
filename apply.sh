#!/bin/bash
kubectl apply -f ./Kubernetes/backend-deployment.yaml
kubectl apply -f ./Kubernetes/backend-service.yaml
kubectl apply -f ./Kubernetes/frontend-deployment.yaml
kubectl apply -f ./Kubernetes/frontend-service.yaml
kubectl apply -f ./Kubernetes/frontend-config.yaml