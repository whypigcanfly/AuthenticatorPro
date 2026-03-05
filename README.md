# 该项目是针对 Authenticator 项目的二开，增加了鼠标右键复制，自动填充等功能。我不懂代码，二开完全使用trae依赖AI完成。如有问题，请大家自行修复。Readme等信息可能还是原始项目的，可能不准确，大家自行下载源码编译。


原项目地址
https://github.com/Authenticator-Extension/Authenticator


## Build Setup

``` bash
# install development dependencies
npm install
# compile
npm run [chrome, firefox, prod]
```

To reproduce a build:

``` bash
npm ci
npm run prod
```



## Development (Chrome)

``` bash
# install development dependencies
npm install
# compiles the Chrome extension to the `./test/chrome` directory
npm run dev:chrome
# load the unpacked extension from the `./test/chrome/ directory in Chrome
```

