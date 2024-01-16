@echo off
node tool.js txtsync ..\dist\CN.txt ..\dist\EN.txt ..\CN_EN.txt fill
node tool.js txtsplit ..\CN_EN.txt ..\EN 500
pause