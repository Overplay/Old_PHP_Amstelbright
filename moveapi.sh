#!/bin/zsh

scp  ./public/index.php root@10.0.88.1:/psp/overplay/public/.
scp -r ./public/api/* root@10.0.88.1:/psp/overplay/public/api/.