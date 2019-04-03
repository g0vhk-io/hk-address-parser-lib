# /bin/sh
# inspired by 
# https://blog.travis-ci.com/2018-04-11-how_to_publish_node_js_packages_with_travis_ci_and_packagecloud/
echo "//registry.npmjs.org/:_authToken=${NPM_API_TOKEN}" > $HOME/.npmrc
echo "//registry.npmjs.com/:_authToken=${NPM_API_TOKEN}" > $HOME/.npmrc

npm publish

# patch using npm?
# npm version patch
# git push origin master