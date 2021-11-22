ssh ssh://ncyujthp@node104-eu.n0c.com:5022 'rm -rf ./app/3d-viewer/*'
npm run build && scp -r -P 5022 ./dist/* ncyujthp@node104-eu.n0c.com:./app/3d-viewer/
