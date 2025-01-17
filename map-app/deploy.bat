@echo off

REM Exibe uma mensagem indicando que o Maven está sendo executado
echo Executando mvn clean package...

REM Executa o mvn clean package e espera a execução do comando
call mvn clean package

REM Verifica se o comando mvn foi executado corretamente
IF %ERRORLEVEL% NEQ 0 (
    echo O comando mvn clean package falhou. Abortando script.
    exit /b %ERRORLEVEL%
)

REM Exibe uma mensagem indicando que os comandos docker serão executados
echo Executando docker-compose down -v...
docker-compose down -v

REM Verifica se o comando docker-compose down foi executado corretamente
IF %ERRORLEVEL% NEQ 0 (
    echo O comando docker-compose down falhou. Abortando script.
    exit /b %ERRORLEVEL%
)

REM Exibe uma mensagem indicando que o docker-compose up será executado
echo Executando docker-compose up -d --build...
docker-compose up -d --build

REM Verifica se o comando docker-compose up foi executado corretamente
IF %ERRORLEVEL% NEQ 0 (
    echo O comando docker-compose up falhou. Abortando script.
    exit /b %ERRORLEVEL%
)

REM Exibe uma mensagem indicando que os logs do Tomcat serão exibidos
echo Exibindo logs do Tomcat...

REM Substitua <nome_do_conteiner> pelo nome do contêiner Tomcat
docker logs -f map-app-map-app-1

REM Verifica se o comando docker logs foi executado corretamente
IF %ERRORLEVEL% NEQ 0 (
    echo O comando docker logs falhou. Abortando script.
    exit /b %ERRORLEVEL%
)

echo Script finalizado com sucesso.