@echo off
node tool.js txtjoin ..\EN  ..\CN_EN.txt
node tool.js txtsync ..\dist\CN.txt ..\CN_EN.txt ..\dist\EN.txt
pause