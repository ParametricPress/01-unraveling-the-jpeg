

npm link parametric-components parametric-styles
cd node_modules/parametric-components/
git checkout local-static
npm run build
cd ../parametric-styles
git checkout local-static
cd ../..
cp node_modules/parametric-styles/issue-01-layout.css ./static/
cp node_modules/parametric-styles/issue-01-theme.css ./static/
idyll build --template _local.html
rm build.warc.gz
warcit https://parametric.press/issue-01/unraveling-the-jpeg/ build/
