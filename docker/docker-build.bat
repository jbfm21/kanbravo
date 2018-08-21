rem #rodar antes o gulp para empacotar

rem ###################
rem #stop
rem ###################
cd /d d:/kb/docker
docker-compose stop

rem ###################
rem #data
rem ###################
cd /d d:\kb\docker\data
docker build  -t="qkanban/repo:data_0_2"  .

rem ###################
rem #backend
rem ###################
rem #copiar package.json para a pasta do docker e remover o ^ do package json
cd /d d:\kb
docker build  -t="qkanban/repo:api_0_5" -f .\docker\backend\Dockerfile .

rem ###################
rem #frontend
rem ###################
robocopy D:\kb\tmp\deploy\frontend  D:\kb\docker\frontend\app /E /XD attachments /XD images
cd /d D:\kb\docker\frontend
docker build  -t="qkanban/repo:frontend_0_5"  .

rem ###################
rem #start
rem ###################

cd /d D:\kb\docker
docker-compose up -d