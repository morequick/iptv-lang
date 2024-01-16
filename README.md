## 1. 下载并安装工具运行环境

https://nodejs.org/en

`注: 选择 LTS 版本下载即可`

## 2. 语言包翻译流程

1. 分割语言包为翻译文件

	```
	例如: EN/01.txt
	```

2. 合并翻译文件为语言包

	```
	1> 合并翻译文件，生成临时文件 => CN_EN.txt
	2> 以中文语言包为基础，根据临时文件生成相应的语言包 => dist/EN.txt
	```

3. 检测未翻译项目

	`执行检测命令，生成检测结果`

	```
	英文检测结果: **TODO.EN.txt**
	俄文检测结果: **TODO.RU.txt**
	```

## 3. 语言包翻译

```
英文翻译目录: **EN**
俄文翻译目录: **RU**
```

`注: #开头表示注释`

```
#page_home=首页
page_home=Home
#page_config=系统设置
page_config=System Settings
#page_live=直播管理
page_live=Live Management
#page_vod=点播管理
page_vod=Local Video
#page_notify=广告发布
page_notify=Advertising
#page_app=APP管理
page_app=APP Management
```
