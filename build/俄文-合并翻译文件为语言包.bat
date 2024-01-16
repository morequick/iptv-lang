@echo off
node tool.js txtjoin ..\RU  ..\CN_RU.txt
node tool.js txtsync ..\dist\CN.txt ..\CN_RU.txt ..\dist\RU.txt
pause