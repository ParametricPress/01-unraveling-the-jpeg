# Unraveling the JPEG

This is the source code for [Unraveling the JPEG](https://issue-01-preview.parametric.press/issue-01/unraveling-the-jpeg/), an interactive exploration of how to decode a JPEG image that was published in the first issue of the Parametric Press.

## Replacing the images with your own

You can append the query parameter `?imageSrc=https://urlToImage.jpg` to the article, and it will refresh and load a version of the article using that image instead of the cat picture. It should work as long as the server allows cross origin requests.

The easiest way to put your own image in the article is to upload it to [Imgur](http://imgur.com/) and add the link to it as a query parameter. You can then share this link with anyone to essentially have your own custom version of the article!

For example, I can go to [this photo of a fox](https://unsplash.com/photos/OU2vFQCwCD0) on Unplash, right click and "copy image location", then put that URL in a query parameter. [This link](https://issue-01-preview.parametric.press/issue-01/unraveling-the-jpeg/?imageSrc=https://images.unsplash.com/photo-1518526157563-b1ee37a05129?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80) will then load the article with the fox image in all the interactive diagrams. 

## Local Setup

To run the article locally, make sure you have NodeJS and NPM installed. Then clone or download this repository.

### Installing dependencies

1. Install `idyll` globally (only need to do this once): `npm install -g idyll`
2. Install local dependencies: `npm install`

### Running local dev server

1. Run `idyll --template _local.html` in the root of this project.
