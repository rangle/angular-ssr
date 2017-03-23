#!/bin/bash

if test `basename $PWD` = 'scripts';
then
  cd ..;
fi;

if test -z "$COVERALLS_REPO_TOKEN" -o ! -f ./coverage/lcov.info;
then
  exit 0;
fi;

cat ./coverage/lcov.info | ./node_modules/.bin/coveralls;
