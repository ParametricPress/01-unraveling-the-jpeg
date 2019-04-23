# Unraveling the JPEG

This is the source code for [Unraveling the JPEG](https://issue-01-preview.parametric.press/articles/unraveling-the-jpeg), an interactive exploration of how to decode a JPEG image that was published in the first issue of the Parametric Press.

## Replacing the images with your own

You can append the query parameter `?imageSrc=https://urlToImage.jpg` to the article, and it will refresh and load a version of the article using that image instead of the cat picture. It should work as long as the server allows cross origin requests.

The easiest way to put your own image in the article is to upload it to [Imgur](http://imgur.com/) and add the link to it as a query parameter. You can then share this link with anyone to essentially have your own custom version of the article!

## Local Setup

To run the article locally, make sure you have NodeJS and NPM installed. Then clone or download this repository.

### Installing dependencies

1. Install `idyll` globally (only need to do this once): `npm install -g idyll`
2. Install local dependencies: `npm install`

### Running local dev server

1. Run `idyll` in the root of this project.
