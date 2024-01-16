@echo off
node tool.js txtsync ..\dist\CN.txt ..\dist\RU.txt ..\CN_RU.txt fill
node tool.js txtsplit ..\CN_RU.txt ..\RU 500
pause