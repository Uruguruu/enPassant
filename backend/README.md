# Docker Guide

## Commands

### Start
```
docker start chess-api
```
expected output:
```
chess-api
```
### Stop
```
docker stop chess-api
```

### How it was made
```
'docker run -p 3004:3004 --name chess-api uruguruu/chess-api:latest
```
The name chess-api will be important later.
