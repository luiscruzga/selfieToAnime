const anime = require('selfietoanime');
const path = require('path');
const fs = require("fs");

console.log('IMAGEN', path.join(__dirname, '../images/brad.jpg'));
anime.transform({
    photo: path.join(__dirname, '../images/brad.jpg'),
    destinyFolder: './images'
})
.then(data => {
    console.log('image ok', data);
    fs.writeFile("testcrop.jpeg", data.image, 'base64', function(err) {
        if (err) console.log(err);
    });
})
.catch(err => {
    console.log('Error', err);
});
