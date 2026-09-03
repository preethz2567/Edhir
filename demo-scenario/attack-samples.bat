@echo off
setlocal enabledelayedexpansion

set TARGET_URL=%1
if "%TARGET_URL%"=="" set TARGET_URL=http://localhost:8081
set API_KEY=%2

set HEADERS=
if not "%API_KEY%"=="" set HEADERS=-H "X-Api-Key:%API_KEY%"

echo Firing requests against %TARGET_URL%...
echo.

echo --- [1/4] Clean GET Request ---
echo GET /products
curl -s -i %HEADERS% "%TARGET_URL%/products" | findstr /R "^HTTP"
echo.

echo --- [2/4] Clean POST Request ---
echo POST /login
curl -s -i -X POST %HEADERS% -d "username=admin&password=admin123" "%TARGET_URL%/login" | findstr /R "^HTTP"
echo.

echo --- [3/4] Attack: SQL Injection in query ---
echo GET /products?category=1'+UNION+SELECT+*+FROM+users--
curl -s -i %HEADERS% "%TARGET_URL%/products?category=1'+UNION+SELECT+*+FROM+users--" | findstr /R "^HTTP"
echo.

echo --- [4/4] Attack: XSS in form body ---
echo POST /login
curl -s -i -X POST %HEADERS% -d "username=<script>alert('xss')</script>" "%TARGET_URL%/login" | findstr /R "^HTTP"
echo.
